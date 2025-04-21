import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const houdiniPath = process.env.HFS ? path.win32.join(process.env.HFS, "bin", "houdini.exe") : null;

function findHoudiniPath(): string | null {
  const isWindows = os.platform() === "win32";
  const programFiles = isWindows ? process.env.PROGRAMFILES || "C:/Program Files" : "/Applications";

  // Base path for Houdini installation
  const basePath = isWindows
    ? path.join(programFiles, "Side Effects Software")
    : path.join(programFiles, "Houdini");

  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = ["Houdini 20.5.550", "Houdini 20.5.370", "Houdini 20.5.410"];

  for (const version of possibleVersions) {
    const testPath = isWindows
      ? path.join(basePath, version, "bin", "houdini.exe")
      : path.join(basePath, version, "Houdini.app", "Contents", "MacOS", "houdini");
    if (fs.existsSync(testPath)) {
      return testPath; // Return the first match
    } else {
      console.log("File does not exist at the specified path.");
    }
  }

  return null;
}

function findHythonPath(): string | null {
  const isWindows = os.platform() === "win32";
  const programFiles = isWindows ? process.env.PROGRAMFILES || "C:/Program Files" : "/Applications";

  // Base path for Houdini installation
  const basePath = isWindows
    ? path.join(programFiles, "Side Effects Software")
    : path.join(programFiles, "Houdini");

  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = ["Houdini 20.5.550", "Houdini 20.5.370", "Houdini 20.5.410"];

  for (const version of possibleVersions) {
    const testPath = isWindows
      ? path.join(basePath, version, "bin", "hython.exe")
      : path.join(basePath, version, "Houdini.app", "Contents", "MacOS", "houdini");
    if (fs.existsSync(testPath)) {
      return testPath; // Return the first match
    } else {
      console.log("File does not exist at the specified path.");
    }
  }

  return null;
}

function writePythonHipFile(filePath: string, assetName: string) {
  const content =
    `
import hou
import sys

def create_simple_scene():
    # Clear the current scene
    hou.hipFile.clear()
    
    # Create a simple geometry node
    obj = hou.node('/obj')
    geo = obj.createNode('geo', '` +
    assetName +
    `')
    
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

export { findHoudiniPath, findHythonPath, writePythonHipFile };
