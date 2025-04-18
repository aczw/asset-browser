import { MetadataSchema } from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { execFile } from "child_process";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import type { AssetWithDetails } from "@/lib/types";
import * as prom from 'fs/promises';
import { exec } from 'child_process';

interface AssetCardProps {
  asset: AssetWithDetails;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  // Now you can use asset.isCheckedOut anywhere inside
  console.log(asset.isCheckedOut); // true or false
}


// const API_URL = import.meta.env.DEV
//   ? "http://127.0.0.1:8000/api"
//   : "https://usd-asset-library.up.railway.app/api";
const API_URL = "https://usd-asset-library.up.railway.app/api";

const houdiniPath = process.env.HFS 
  ? path.win32.join(process.env.HFS, 'bin', 'houdini.exe'): null;
function findHoudiniPath(): string | null {

  const isWindows = os.platform() === 'win32';
  const programFiles = isWindows
    ? process.env.PROGRAMFILES || 'C:/Program Files'
    : '/Applications';
    // Base path for Houdini installation
    const basePath = isWindows
    ? path.join(programFiles, 'Side Effects Software')
    : path.join(programFiles, 'Houdini');

  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = isWindows
  ? ['Houdini 20.5.332', 'Houdini 20.5.550', 'Houdini 20.5.370', 'Houdini 20.5.410'] : ['20.5.332', '20.5.550', '20.5.370', '20.5.410'];
  
  for (const version of possibleVersions) {
    const testPath = isWindows
    ? path.join(basePath, version, 'bin', 'houdini.exe')
    : path.join(
      basePath,
      `Houdini${version}`,
      `Houdini Apprentice ${version}.app`
    );
    prom.access(testPath)
      .then(() => {
        console.log("File exists at the specified path.");
        return testPath; // Return the first match
      })
      .catch(() => {
        //console.log("File does not exist at the specified path.");
      });

    console.log(testPath);
  }
  
  // for (const version of possibleVersions) {
  //   const testPath = isWindows
  //   ? path.join(basePath, version, 'bin', 'houdini.exe')
  //   : path.join(
  //     basePath,
  //     `Houdini${version}`,
  //     `Houdini\ Apprentice\ ${version}.app`
  //   );
  //   if (fs.existsSync(testPath)) {
  //     return testPath; // Return the first match
  //   }
  //   else{
  //     console.log("File does not exist at the specified path.");
  //   }
  //   console.log(testPath);
  // }
  
  //return null;
}

function findHythonPath(): string | null {
  const isWindows = os.platform() === 'win32';
  const programFiles = isWindows
    ? process.env.PROGRAMFILES || 'C:/Program Files'
    : '/Applications';
  
    // Base path for Houdini installation
    const basePath = isWindows
    ? path.join(programFiles, 'Side Effects Software')
    : path.join(programFiles, 'Houdini');

  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = isWindows
  ? ['Houdini 20.5.332', 'Houdini 20.5.550', 'Houdini 20.5.370', 'Houdini 20.5.410'] : ['20.5.332', '20.5.550', '20.5.370', '20.5.410'];  
  for (const version of possibleVersions) {
    const testPath = isWindows
    ? path.join(basePath, version, 'bin', 'hython.exe')
    : path.join(
      basePath,
      `Houdini${version}`,
      `Houdini Apprentice ${version}.app`
    );
    if (fs.existsSync(testPath)) {
      return testPath; // Return the first match
    }
    else{
      console.log("File does not exist at the specified path.");
    }
  }
  
  return null;
}

function writePythonHipFile(filePath:string, assetName:string, checkedOut: boolean) {

  const content = `
import hou
import sys

def create_simple_scene():
    # Clear the current scene
    hou.hipFile.clear()
    
    # Create a simple geometry node
    obj = hou.node('/obj')
    geo = obj.createNode('geo', '` + assetName + `')
    
    # Add a sphere inside the geo node
    sphere = geo.createNode('sphere')
    
    # Connect and layout
    sphere.moveToGoodPosition()

    # Create null node with checkedOut status
    null_node = obj.createNode('null', 'status')
    null_node.addSpareParmTuple(hou.ToggleParmTemplate("checked_out", "Checked Out"))
    null_node.parm("checked_out").set(${checkedOut ? "True" : "False"})
    null_node.moveToGoodPosition()
    
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
      //console.log("[DEBUG] API: Received response:", data);
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
      assetName: z.string(),
      version: z.string(),
      file: z.instanceof(File),
    }),
    handler: async ({ assetName, version, file }) => {
      console.log("[DEBUG] API: assetName type:", typeof assetName);
      console.log("[DEBUG] API: API URL:", API_URL);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);

      const response = await fetch(`${API_URL}/assets/${assetName}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText
            ? `Failed to create asset. Error message: ${response.statusText}`
            : "Failed to create asset",
        });
      }
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
    accept: "form",
    input: z.object({
      assetName: z.string(),
      pennKey: z.string(),
      file: z.instanceof(File), // used to be an array, now just one because ZIP
      metadata: MetadataSchema,
    }),
    handler: async ({ assetName, pennKey, file, metadata }) => {
      const formData = new FormData();
      formData.append("file", file);

      // S3 update, currently does not return version IDs - instead writes to a assetName/version/file path
      const response = await fetch(`${API_URL}/assets/${assetName}/checkin/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText || "Failed to check in asset",
        });
      }

      // TO DO: Handle metadata updates and version ID control should it happen

      const data = await response.json();
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

      const isWindows = os.platform() === 'win32';

      const assetZip = isWindows ? os.homedir()+"\\Downloads\\"+ assetName + ".zip" : os.homedir()+"/Downloads/"+ assetName + ".zip";
      console.log("[DEBUG] assetZip path:", assetZip);
      const outputDir = isWindows ? os.homedir()+"\\Downloads\\"+ assetName +"\\" : os.homedir()+"/Downloads/"+ assetName +"/";

      //const houdiniFile = path.join(outputDir, assetName + ".fbx");
      const exePath = '/Applications/Houdini/Houdini20.5.332/Houdini Apprentice 20.5.332.app';
      
      // if the zip file exists
      if (fs.existsSync(assetZip)) {
        
        if (!fs.existsSync(outputDir)) {
          // unzip the file
          console.log("[DEBUG] Unzipping the file...");

          fs.createReadStream(assetZip)
    .pipe(unzipper.Extract({ path: outputDir }))
    .on('close', () => {
      console.log('Extraction complete.');
    })
    .on('error', (err) => {
      console.error('Error during extraction:', err);
    });
        }

        //const hythonExe = findHythonPath();
        //const hythonExe = isWindows ? findHythonPath() : '/Applications/Houdini/Houdini20.5.332/Houdini Apprentice 20.5.332.app/Contents/bin/hython';
        ///Applications/Houdini/Houdini20.5.332/Frameworks/Houdini.framework/Versions/20.5/Resources/bin/hython 
        const hythonExe = '/Applications/Houdini/Houdini20.5.332/Frameworks/Houdini.framework/Versions/20.5/Resources/bin/hython';
        
        console.log("[DEBUG] hythonExe path:", hythonExe);
             
        // create python generation file here


        const res = await fetch(`${API_URL}/assets/${assetName}`);
        const json = await res.json();
        const isCheckedOut = json.asset?.isCheckedOut ?? false;



      //   if (hythonExe) {
      //     execFile(hythonExe, [pythonScript, outputHipFile], (error, stdout, stderr) => {
      //       if (error) {
      //         console.error(`Error running Hython: ${error.message}`);
      //         return;
      //       }
            
      //       if (stderr && stderr.trim()) {
      //         console.error(`Hython stderr: ${stderr}`);
      //       }
            
      //       if (stdout && stdout.trim()) {
      //         console.log(`Hython stdout: ${stdout}`);
      //       }
            
      //       console.log(`Hip file generated successfully at: ${outputHipFile}`);
      //     });
      //   }
      
      //   if (exePath) {
      //     execFile(exePath, [outputHipFile], (error, stdout, stderr) => {
      //       if (error) {
      //         console.error("[ERROR] Failed to launch .exe:", error);
      //         throw new ActionError({
      //           code: "INTERNAL_SERVER_ERROR",
      //           message: `Failed to launch application: ${error.message}`,
      //         });
      //       }
    
      //       console.log("[DEBUG] Application launched successfully. Output:", stdout);
          
      //     });
      //   }
      // }
      // else {

      //   // TODO: output message to the user to download the asset first
      //   console.log("File does not exist at the specified path.");
      // }

      //const exePath = findHoudiniPath();
      //const outputHipFile = outputDir +'\generated_scene.hip';

      writePythonHipFile(process.cwd()+"\\writtenPythonScript.py",assetName,isCheckedOut);
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
      
      exec(`open "${exePath}" --args "${outputHipFile}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error launching .app file: ${error.message}`);
          return;
        }
      
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
      
        console.log(`stdout: ${stdout}`);
        console.log(`Successfully launched ${exePath}`);
      });

      // Replace with the actual path to the .exe file
      console.log("[DEBUG] final exePath:", exePath);

      return { message: "Application launched successfully" };
    }
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
