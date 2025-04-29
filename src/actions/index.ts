import { findHoudiniPath, findHythonPath, writePythonHipFile } from "@/lib/launch-dcc";
import {
  type AssetWithDetails,
  type GetUserBody,
  type GetUsersBody,
  type SingleUser,
} from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { execFile } from "child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as unzipper from "unzipper";

const API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api"
  : "https://usd-asset-library.up.railway.app/api";

export const server = {
  getAssets: defineAction({
    input: z
      .object({
        search: z.string().optional(),
        author: z.string().optional(),
        assetStatus: z.enum(["none", "check-in", "check-out"]),
        sortBy: z.string().optional(),
      })
      .optional(),
    handler: async (input) => {
      const params = input;

      console.log("[DEBUG] API: getAssets called with params:", params);

      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.author) queryParams.append("author", params.author);
      if (params?.assetStatus) queryParams.append("assetStatus", params.assetStatus);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      // Always make API call
      console.log("[DEBUG] API: Making API call to:", `${API_URL}/assets${queryString}`);
      const response = await fetch(`${API_URL}/assets${queryString}`);

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch assets: ${response.statusText}`,
        });
      }

      const data = (await response.json()) as { assets: AssetWithDetails[] };
      return data;
    },
  }),

  getAsset: defineAction({
    input: z.object({ assetName: z.string() }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] API: assetName type:", typeof assetName);

      const response = await fetch(`${API_URL}/assets/${assetName}`);
      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch asset details",
        });
      }

      const data = await response.json();
      return data;
    },
  }),

  createAsset: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      note: z.string(),
      hasTexture: z.boolean(),
      pennKey: z.string(),
      keywordsRawList: z.string(),
      assetName: z.string(),
      accessToken: z.string(),
    }),

    handler: async ({
      file,
      pennKey,
      note,
      hasTexture,
      keywordsRawList,
      assetName,
      accessToken,
    }) => {
      console.log("[DEBUG] API: API URL:", API_URL);
      if (typeof keywordsRawList === "string") {
        keywordsRawList = JSON.parse(keywordsRawList);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("note", note);
      formData.append("hasTexture", String(hasTexture));
      formData.append("pennkey", pennKey);

      for (const keyword of keywordsRawList) {
        formData.append("keywordsRawList", keyword);
      }

      const response = await fetch(`${API_URL}/assets/${assetName}/upload/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        console.log(data.message);
      }

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText
            ? `Failed to create asset. Error message: ${response.statusText}`
            : "Failed to create asset",
        });
      }
      return data;
    },
  }),

  checkinAsset: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      note: z.string(),
      version: z.string(),
      hasTexture: z.boolean(),
      pennKey: z.string(),
      keywordsRawList: z.string(),
      assetName: z.string(),
      accessToken: z.string(),
    }),

    handler: async ({
      file,
      pennKey,
      version,
      note,
      hasTexture,
      keywordsRawList,
      assetName,
      accessToken,
    }) => {
      if (typeof keywordsRawList === "string") {
        keywordsRawList = JSON.parse(keywordsRawList);
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("note", note);
      formData.append("version", version);
      formData.append("hasTexture", String(hasTexture));
      formData.append("pennkey", pennKey);
      for (const keyword of keywordsRawList) {
        formData.append("keywordsRawList", keyword);
      }
      formData.append("accessToken", accessToken);

      console.log("formdata = ", formData);

      // S3 update, currently does not return version IDs - instead writes to a assetName/version/file path
      const response = await fetch(`${API_URL}/assets/${assetName}/checkin/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        console.log("data message", data.message);
      }

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText || "Failed to check in asset",
        });
      }

      return data;
    },
  }),

  checkoutAsset: defineAction({
    input: z.object({
      assetName: z.string(),
      pennKey: z.string(),
      accessToken: z.string(),
    }),
    handler: async ({ assetName, pennKey, accessToken }) => {
      const response = await fetch(`${API_URL}/assets/${assetName}/checkout/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // Note: backend expects 'pennkey' not 'pennKey' (lowercase "K")
        body: JSON.stringify({ pennkey: pennKey }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: data.error || response.statusText || "Failed to check out asset",
        });
      }

      const data = await response.json();
      return data;
    },
  }),

  verifyAsset: defineAction({
    accept: "form",
    input: z.object({
      assetName: z.string(),
      file: z.instanceof(File),
      isStrict: z.string(),
    }),
    handler: async ({ assetName, file, isStrict }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isStrict", isStrict);

      const response = await fetch(`${API_URL}/assets/${assetName}/verify/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        return false;
      }

      const results = await response.json();

      return results;
    },
  }),

  downloadAsset: defineAction({
    input: z.object({
      assetName: z.string(),
      version: z.string().optional(),
    }),
    handler: async ({ assetName, version }) => {
      console.log("[DEBUG] downloadAsset called with assetName:", assetName, "version:", version);

      // Construct the endpoint URL based on whether a version is provided
      let endpoint = `${API_URL}/assets/${assetName}/download`;
      if (version) {
        endpoint = `${API_URL}/assets/${assetName}/download/commit/${version}/`;
      }

      // Call API in both development and production
      console.log("[DEBUG] Making API call to:", endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.log("[DEBUG] Error occurred! API response status code:", response.status);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to download asset",
        });
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log("[DEBUG] Received blob of size:", blob.size);

      // Action handlers don't support directly returning blobs. See https://github.com/rich-harris/devalue
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;
    },
  }),

  launchDCC: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] API: launchDCC called");

      const exePath = findHoudiniPath(); // Replace with the actual path to the .exe file

      console.log("[DEBUG] final exePath:", exePath);

      const assetZip = os.homedir() + "\\Downloads\\" + assetName + ".zip";
      const outputDir = os.homedir() + "\\Downloads\\" + assetName + "\\";

      // if the zip file exists
      if (fs.existsSync(assetZip)) {
        if (!fs.existsSync(outputDir)) {
          // unzip the file
          fs.createReadStream(assetZip)
            .pipe(unzipper.Extract({ path: outputDir }))
            .on("close", () => {
              console.log("Extraction complete.");
            })

            .on("error", () => {
              console.error("Error during extraction:");
            });
        }

        const houdiniFile = path.join(outputDir, assetName + ".fbx");

        const hythonExe = findHythonPath();
        console.log("[DEBUG] hythonExe path:", hythonExe);

        // create python generation file here

        writePythonHipFile(process.cwd() + "\\writtenPythonScript.py", assetName);
        const pythonScript = process.cwd() + "\\writtenPythonScript.py";
        const outputHipFile = outputDir + "generated_scene.hip";

        if (hythonExe) {
          execFile(hythonExe, [pythonScript, outputHipFile], (error, stdout, stderr) => {
            if (error) {
              console.error(`Error running Hython: ${error.message}`);
              return;
            }

            if (stderr && stderr.trim()) {
              console.error(`Hython stderr: ${stderr}`);
            }

            if (stdout && stdout.trim()) {
              console.log(`Hython stdout: ${stdout}`);
            }

            console.log(`Hip file generated successfully at: ${outputHipFile}`);
          });
        }
        if (exePath) {
          execFile(exePath, [outputHipFile], (error, stdout, stderr) => {
            if (error) {
              console.error("[ERROR] Failed to launch .exe:", error);
              throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to launch application: ${error.message}`,
              });
            }

            console.log("[DEBUG] Application launched successfully. Output:", stdout);
          });
        }
      } else {
        // TODO: output message to the user to download the asset first
        console.log("File does not exist at the specified path.");
      }

      return { message: "Application launched successfully" };
    },
  }),

  getAuthors: defineAction({
    input: undefined,
    handler: async () => {
      console.log("[DEBUG] API: getAuthors called");

      // TODO
      throw new ActionError({
        code: "FORBIDDEN",
        message: "To do",
      });
    },
  }),

  getUsers: defineAction({
    input: undefined,
    handler: async () => {
      const response = await fetch(`${API_URL}/users/`, { method: "GET" });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to fetch all users! " +
            (response.statusText.length > 0 ? response.statusText : ""),
        });
      }

      const data = (await response.json()) as GetUsersBody;
      return data;
    },
  }),

  getUser: defineAction({
    input: z.object({
      pennKey: z.string(),
      recentCommits: z.number().optional(),
    }),
    handler: async ({ pennKey, recentCommits }) => {
      const recentCommitsParam = recentCommits ? `?recent_commits=${recentCommits}` : "";
      const response = await fetch(`${API_URL}/users/${pennKey}/${recentCommitsParam}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          `[DEBUG] Could not get user "${pennKey}" with recent_commits = ${recentCommits}, status code: ${response.status}`
        );

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user! ${
            response.statusText.length > 0 ? response.statusText : ""
          }`,
        });
      }

      const data = (await response.json()) as GetUserBody;
      return data;
    },
  }),

  getMe: defineAction({
    input: z.object({
      accessToken: z.string(),
    }),
    handler: async ({ accessToken }) => {
      const response = await fetch(`${API_URL}/currentUser/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "GET",
      });

      if (!response.ok) {
        console.log(`[DEBUG] Could not get current user, status code: ${response.status}`);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get current user! ${
            response.statusText.length > 0 ? response.statusText : ""
          }`,
        });
      }
      const data: SingleUser = (await response.json()) as SingleUser;
      return data;
    },
  }),

  downloadGlb: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      const response = await fetch(`${API_URL}/assets/${assetName}/download/glb/`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log("[DEBUG] downloadGlb(): failed to download .glb file");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to download .glb file for "${assetName}!" ${
            response.statusText.length > 0 ? response.statusText : `Code: ${response.status}`
          }`,
        });
      }

      const data = await response.arrayBuffer();
      return data;
    },
  }),

  storeLoginTokens: defineAction({
    accept: "form",
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    handler: async ({ username, password }) => {
      const response = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        console.log("[DEBUG] getLoginToken(): failed to get login token");
        if (response.status === 401) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }
      }

      const data = await response.json();

      return data;
    },
  }),

  // move out of local storage
  refreshToken: defineAction({
    accept: "form",
    input: z.object({
      refreshToken: z.string(),
    }),
    handler: async ({ refreshToken }) => {
      const response = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        console.log("[DEBUG] refreshToken(): failed to get access token");
        if (response.status === 401) {
          console.log("Refresh token expired. Please log in again.");
          return "";
        }
      }

      const data = await response.json();

      return data.access;
    },
  }),

  assetExists: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log(`Checking if asset exists: ${assetName}`);

      try {
        // Try the first endpoint format
        let response = await fetch(`${API_URL}/assets/${assetName}/exists`, {
          method: "GET",
        });

        if (!response.ok) {
          console.error(`Endpoint failed. Returning default response.`);
          // return { exists: true };
        }

        const data = await response.json();
        console.log(`Response data:`, data);
        return data;
      } catch (error) {
        console.error(`Fetch error:`, error);
        // Return a default response that allows the user to proceed
        return { exists: false };
      }
    },
  }),

  downloadAssetByTag: defineAction({
    input: z.object({
      assetName: z.string(),
      tag: z.string(),
    }),
    handler: async ({ assetName, tag }) => {
      console.log("[DEBUG] downloadAssetByTag called with assetName:", assetName, "tag:", tag);

      // Construct the endpoint URL for tag-based download
      const endpoint = `${API_URL}/assets/${assetName}/download/tag/${tag}/`;

      // Call API in both development and production
      console.log("[DEBUG] Making API call to:", endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.log("[DEBUG] Error occurred! API response status code:", response.status);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to download asset by tag",
        });
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log("[DEBUG] Received blob of size:", blob.size);

      // Action handlers don't support directly returning blobs. See https://github.com/rich-harris/devalue
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;
    },
  }),

  getAssetCommits: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log(`Fetching commit history for asset: ${assetName}`);

      try {
        const response = await fetch(`${API_URL}/assets/${assetName}/info/commits/`, {
          method: "GET",
        });

        if (!response.ok) {
          console.error(`Failed to fetch commit history: ${response.statusText}`);
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.statusText || "Failed to fetch asset commit history",
          });
        }

        const data = await response.json();
        console.log(`Commit history data:`, data);
        return data;
      } catch (error) {
        console.error(`Fetch error:`, error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch asset commit history",
        });
      }
    },
  }),
};
