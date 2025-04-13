import { MetadataSchema, type VersionMap } from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { execFile } from "child_process";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as unzipper from 'unzipper';


const API_URL = "https://usd-asset-library.up.railway.app/api";

const houdiniPath = process.env.HFS 
  ? path.win32.join(process.env.HFS, 'bin', 'houdini.exe'): null;
function findHoudiniPath(): string | null {
  const programFiles = process.env.PROGRAMFILES || 'C:/Program Files';
  
  // This pattern allows it to find any version of Houdini installed
  const basePath = path.join(programFiles, 'Side Effects Software');
  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = ['Houdini 20.5.550', 'Houdini 20.0', 'Houdini 19.5'];
  
  for (const version of possibleVersions) {
    const testPath = path.join(basePath, version, 'bin', 'houdini.exe');
    return testPath; // Return the first match
  }
  
  return null;
}

function findHythonPath(): string | null {
  const programFiles = process.env.PROGRAMFILES || 'C:/Program Files';
  
  // This pattern allows it to find any version of Houdini installed
  const basePath = path.join(programFiles, 'Side Effects Software');
  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = ['Houdini 20.5.550', 'Houdini 20.0', 'Houdini 19.5'];
  
  for (const version of possibleVersions) {
    const testPath = path.join(basePath, version, 'bin', 'hython.exe');
    return testPath; // Return the first match
  }
  
  return null;
}

function writePythonHipFile(filePath:string) {

  const content = `
import hou
import sys

def create_simple_scene():
    # Clear the current scene
    hou.hipFile.clear()
    
    # Create a simple geometry node
    obj = hou.node('/obj')
    geo = obj.createNode('geo', 'my_geometry')
    
    # Add a sphere inside the geo node
    sphere = geo.createNode('sphere')
    
    # Connect and layout
    sphere.moveToGoodPosition()
    
    # Save the file
    output_path = sys.argv[1] if len(sys.argv) > 1 else "C:/temp/generated_scene.hip"
    hou.hipFile.save(output_path)
    print(f"Scene saved to {output_path}")

if __name__ == "__main__":
    create_simple_scene()
`;

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error writing to Python file:", err);
      return;
    }
    console.log("Python file written successfully at:", filePath);
  });

}

export const server = {
  getAssets: defineAction({
    input: z
      .object({
        search: z.string().optional(),
        author: z.string().optional(),
        checkedInOnly: z.boolean().optional(),
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
      if (params?.checkedInOnly) queryParams.append("checkedInOnly", "true");
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

      const data = await response.json();
      console.log("[DEBUG] API: Received response:", data);
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

  checkoutAsset: defineAction({
    input: z.object({ assetName: z.string(), pennKey: z.string() }),
    handler: async ({ assetName, pennKey }) => {
      const response = await fetch(`${API_URL}/assets/${assetName}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Note: backend expects 'pennkey' not 'pennKey' (lowercase "K")
        body: JSON.stringify({ pennkey: pennKey }),
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText || "Failed to check out asset",
        });
      }

      const data = await response.json();
      return data;
    },
  }),

  checkinAsset: defineAction({
    input: z.object({
      assetName: z.string(),
      pennKey: z.string(),
      files: z.instanceof(File).array(),
      metadata: MetadataSchema,
    }),
    handler: async ({ assetName, pennKey, files, metadata }) => {
      const formData = new FormData();

      for (const file in files) {
        formData.append("files", file);
      }

      // S3 update, returns Version IDs
      const responseVersionIds = await fetch(`${API_URL}/assets/${assetName}/`, {
        method: "POST",
        body: formData,
      });

      if (!responseVersionIds.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseVersionIds.statusText
            ? `Failed to check in asset. Error message: ${responseVersionIds.statusText}`
            : "Failed to check in asset",
        });
      }

      const versionData = await responseVersionIds.json();
      const versionMap = versionData.version_map as VersionMap;

      console.log("version_map:", versionMap);
      metadata.versionMap = versionMap;

      // Metadata update, adds new AssetVersions based on Commit
      const responseMetadata = await fetch(`${API_URL}/metadata/${assetName}/`, {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      if (!responseMetadata.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseMetadata.statusText
            ? `Failed to check in asset. Error message: ${responseMetadata.statusText}`
            : "Failed to check in asset",
        });
      }

      const data = await responseMetadata.json();
      return data;
    },
  }),

  downloadAsset: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] downloadAsset called with assetName:", assetName);

      // Call API in both development and production
      console.log("[DEBUG] Making API call to:", `${API_URL}/assets/${assetName}/download`);
      const response = await fetch(`${API_URL}/assets/${assetName}/download`);

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

      const foundPath = findHoudiniPath();
      console.log("[DEBUG] Found Houdini path:", foundPath);
      console.log("[DEBUG] " + os.homedir());
      const exePath = foundPath || path.join(os.homedir(), "Desktop", "houdini.exe"); // Replace with the actual path to the .exe file
      console.log("[DEBUG] final exePath:", exePath);

      const assetZip = os.homedir()+"\\Downloads\\"+ assetName + ".zip"
      const outputDir = os.homedir()+"\\Downloads\\"+ assetName +"\\";
      
      // if the zip file exists
      if (fs.existsSync(assetZip)) {
        console.log("File exists at the specified path.");
        
        if (!fs.existsSync(outputDir)) {
          // unzip the file
          fs.createReadStream(assetZip)
            .pipe(unzipper.Extract({ path: outputDir }))
            .on('close', () => {
              console.log('Extraction complete.');
            })
            .on('error', () => {
              console.error('Error during extraction:');
          });
        }

        const houdiniFile = path.join(outputDir, assetName + ".fbx");

        const hythonExe = findHythonPath() || 'C:\\Program Files\\Side Effects Software\\Houdini 20.5.550\\bin\\hython.exe';

        console.log("[DEBUG] hythonExe path:", hythonExe);
             
        // create python generation file here
        writePythonHipFile(process.cwd()+"\\writtenPythonScript.py");
        const pythonScript = process.cwd() + "\\writtenPythonScript.py";
        const outputHipFile = outputDir +'\generated_scene.hip';

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
      else {

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
};
