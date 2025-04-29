# AssetInfoFlow Update Guide

## 1. Add the Checkbox Import

Add the Checkbox import to the imports section:

```typescript
import { Checkbox } from "../../components/ui/checkbox";
```

## 2. Add the isStrict State Variable

Add the isStrict state variable after the other step 2 states:

```typescript
// Step 2 states
const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
const [verificationComplete, setVerificationComplete] = useState(false);
const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
const [isStrict, setIsStrict] = useState(false); // Add this line
const fileInputRef = useRef<HTMLInputElement>(null);
```

## 3. Update the handleVerify Function

Update the handleVerify function to include the isStrict parameter:

```typescript
const handleVerify = async () => {
  if (uploadedFiles.length === 0) {
    setVerificationMessage("Please upload at least one file.");
    setVerificationComplete(false);
    return;
  }

  // Get the asset name for verification
  const assetNameToVerify = asset.name;

  const invalidFilesList: string[] = [];

  if (!assetNameToVerify) {
    setVerificationMessage("Asset name is required for verification");
    setVerificationComplete(false);
    return;
  }

  // Check if any files don't match the expected pattern
  const validFilePatterns = [
    new RegExp(`^${assetNameToVerify}\\.zip$`, "i"),
    new RegExp(`^${assetNameToVerify}_v\\d+\\.zip$`, "i"),
    new RegExp(`^${assetNameToVerify}_\\d+\\.\\d+\\.\\d+\\.zip$`, "i"),
  ];

  for (const file of uploadedFiles) {
    const isValid = validFilePatterns.some((pattern) => pattern.test(file.name));
    if (!isValid) {
      invalidFilesList.push(file.name);
    }
  }

  if (invalidFilesList.length > 0) {
    setInvalidFiles(invalidFilesList);
    setVerificationMessage("Some files do not follow the required naming pattern.");
    setVerificationComplete(false);
    return;
  }

  setInvalidFiles([]);

  // Verify files with backend
  try {
    const formData = new FormData();
    formData.append("assetName", assetNameToVerify);
    formData.append("file", uploadedFiles[0]);
    formData.append("isStrict", isStrict.toString()); // Add this line
    
    const { data, error } = await actions.verifyAsset(formData);
    
    if (!data.success) {
      setVerificationMessage(`Files did not verify! \n${data.message || "Unknown error"}`);
      setVerificationComplete(false);
      return;
    }

    setVerificationMessage("Files verified successfully!");
    setVerificationComplete(true);

    // Prepare metadata for the next step
    onFilesChange(uploadedFiles);
  } catch (error) {
    console.error("Error verifying files:", error);
    setVerificationMessage("An error occurred during verification.");
    setVerificationComplete(false);
  }
};
```

## 4. Add the isStrict Checkbox to the UI

Add the isStrict checkbox to the UI, right after the "Verify files" button:

```typescript
<Button
  onClick={handleVerify}
  disabled={uploadedFiles.length === 0}
  variant="outline"
  className="w-full"
>
  Verify files
</Button>

<div className="w-full flex items-center justify-center gap-2 pb-1">
  <div>
    Verification Strict Mode?
  </div>
  <Checkbox
    checked={isStrict}
    onCheckedChange={(checked) =>
      setIsStrict(checked as boolean)
    }
  />
</div>
```

This should be added in the step 2 UI section, around line 370-380 in the AssetInfoFlow.tsx file.
