import type { AssetWithDetails, Commit, Metadata } from "@/lib/types";
import { useRef, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { actions } from "astro:actions";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Download, 
  Lock, 
  LockOpen, 
  PlayCircle, 
  ArrowLeft, 
  FileUp, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetControlPanelProps {
  asset: AssetWithDetails;
  canCheckout: boolean;
  canCheckin: boolean;
  onCheckout: () => void;
  onCheckin: () => void;
  onDownload: () => void;
  onLaunchDCC: () => void;
  onFilesChange: (newFiles: File[]) => void;
  onMetadataChange: (newMetadata: Metadata) => void;
}

const AssetControlPanel = ({
  asset,
  canCheckout,
  canCheckin,
  onCheckout,
  onCheckin,
  onDownload,
  onLaunchDCC,
  onFilesChange,
  onMetadataChange,
}: AssetControlPanelProps) => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [step, setStep] = useState<2 | 3>(2);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    materials: false,
    visualCheck: false,
    centeredGeometry: false,
    rigsWorking: false,
    boundingBox: false,
    usdValidate: false,
  });

  // Step 2 states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 states
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [version, setVersion] = useState<string>("");
  const [materials, setMaterials] = useState<string>("None");
  const [keywords, setKeywords] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [metadata, setMetadata] = useState<Metadata>({} as Metadata);

  const handleCheckInComplete = () => {
    onCheckin();
    console.log("The checkin is done.");
    setCheckInOpen(false);
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (uploadedFiles.length === 0 || !verificationComplete) {
        return; // Don't proceed if no files or verification not complete
      }
      setStep(3);
    } else {
      handleMetadataSubmit();
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCheckInOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setStep(2);
      setCheckedItems({
        materials: false,
        visualCheck: false,
        centeredGeometry: false,
        rigsWorking: false,
        boundingBox: false,
        usdValidate: false,
      });
      setUploadedFiles([]);
      setVerificationComplete(false);
      setVerificationMessage(null);
      setInvalidFiles([]);
      setKeywords(asset.keywords.join(", "));
      setDescription("");
      setVersion("");
      setMaterials("None");
    }
  };

  // Step 2 functions
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      // Reset verification status and message when new files are uploaded
      setVerificationComplete(false);
      setVerificationMessage(null);
      setInvalidFiles([]);

      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    // Reset verification when files change
    setVerificationComplete(false);
    setVerificationMessage(null);
    setInvalidFiles([]);
  };

  const handleVerify = async () => {
    const assetNameToVerify = asset.name.toLowerCase();
    const invalidFilesList: string[] = [];

    uploadedFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();
      const isValid = fileName.endsWith(".zip");
      if (!isValid) {
        invalidFilesList.push(file.name);
      }
    });

    setInvalidFiles(invalidFilesList);

    if (invalidFilesList.length > 0) {
      setVerificationMessage(
        `${invalidFilesList.length} file(s) have invalid names. Please fix them.`
      );
      setVerificationComplete(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("assetName", assetNameToVerify);
      formData.append("file", uploadedFiles[0]);
      
      const { data, error } = await actions.verifyAsset(formData);

      if (error) {
        setVerificationMessage(`Verification failed: ${error.message}`);
        setVerificationComplete(false);
        return;
      }
      
      if (!data.success) {
        setVerificationMessage(
          `Files did not verify! \n${data.message || "Unknown error"}`
        );
        setVerificationComplete(false);
        return;
      }

      setVerificationMessage("All files have been successfully verified!");
      setVerificationComplete(true);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationMessage("An error occurred during verification. Please try again.");
      setVerificationComplete(false);
    }
  };

  // Step 3 functions
  // Calculate version options based on current version
  const getVersionOptions = () => {
    const currentVersion = asset.version || "1.00.00";
    const parts = currentVersion.split(".");
    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10);

    return [
      `${major + 1}.00.00`, // Major update
      `${major}.${(minor + 1).toString().padStart(2, "0")}.00`, // Minor update
      `${major}.${minor.toString().padStart(2, "0")}.${(patch + 1).toString().padStart(2, "0")}`, // Patch update
    ];
  };

  const versionOptions = getVersionOptions();

  // Set default values for step 3
  useState(() => {
    if (versionOptions.length > 0 && !version) {
      setVersion(versionOptions[0]);
    }
    setKeywords(asset.keywords.join(", "));
  });

  const isFormValid = () => {
    return (
      date &&
      version &&
      materials &&
      keywords.trim() !== "" &&
      description.trim() !== ""
    );
  };

  const handleMetadataSubmit = () => {
    if (!date) return;

    console.log("Submitting metadata");

    const commit: Commit = {
      author: asset.checkedOutBy || "",
      version: version,
      timestamp: date.toString(),
      note: description,
    };

    const newMetadata: Metadata = {
      assetName: asset.name,
      assetStructureVersion: "03.00.00",
      keywords: keywords.split(",").map(k => k.trim()).filter(k => k !== ""),
      hasTexture: materials === "Yes",
      commit: commit,
      versionMap: {},
    };

    console.log("New metadata:", newMetadata);

    onMetadataChange(newMetadata);
    onFilesChange([...uploadedFiles]);
    handleCheckInComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Version</div>
        <div className="text-sm font-medium">{asset?.version}</div>
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={asset?.version} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={asset?.version ?? "THIS SHOULD NOT HAPPEN"}>
              {asset?.version}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button className="flex items-center gap-2" onClick={onCheckout} disabled={!canCheckout}>
          <LockOpen className="h-4 w-4" />
          Check Out
        </Button>

        <Button
          className="flex items-center gap-2"
          onClick={() => setCheckInOpen(true)}
          disabled={!canCheckin}
        >
          <Lock className="h-4 w-4" />
          Check In
        </Button>

        <Button variant="outline" className="flex items-center gap-2" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download Copy
        </Button>

        <Button variant="outline" className="flex items-center gap-2" onClick={onLaunchDCC}>
          <PlayCircle className="h-4 w-4" />
          Launch DCC
        </Button>
      </div>

      {/* Check-in Flow Dialog */}
      <Dialog open={checkInOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">

          {step === 2 && (
            <div className="space-y-4">
              <DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Check-in Step 1 of 2
                </p>
                <DialogTitle className="text-xl">
                  Upload and Automatic Checks
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm">
                <p className="font-medium mb-1">Upload a .zip file!</p>
              </div>

              <Button
                className="w-full flex items-center gap-2"
                onClick={handleUploadClick}
                variant="outline"
              >
                <FileUp size={16} />
                Upload file
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
              />

              {uploadedFiles.length > 0 && (
                <div className="border rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium">Uploaded files:</p>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-between border-b pb-1 ${
                          invalidFiles.includes(file.name) ? "text-red-500" : ""
                        }`}
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={uploadedFiles.length === 0}
                variant="outline"
                className="w-full"
              >
                Verify files
              </Button>

              {verificationMessage && (
                <div
                  className={`p-2 text-center text-sm font-medium ${
                    verificationComplete ? "text-green-600" : "text-red-500"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: verificationMessage.replace(/\n/g, '<br />')
                  }}
                />
              )}

              {invalidFiles.length > 0 && (
                <div className="border border-red-200 bg-red-50 rounded-md p-3">
                  <p className="text-sm font-medium text-red-700 mb-2">Invalid file names:</p>
                  <ul className="space-y-1 text-sm text-red-600">
                    {invalidFiles.map((fileName, index) => (
                      <li key={index}>• {fileName} - should follow one of the valid patterns</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end mt-6">
                {verificationComplete && (
                  <Button onClick={handleNextStep}>
                    Proceed
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full max-h-[75vh]">
              <div className="pb-4">
                <p className="text-sm text-muted-foreground">Check-in Step 2 of 2</p>
                <p className="text-xl">Metadata Update</p>
              </div>

              <div className="flex-1 pr-4 overflow-y-auto">
                <div className="space-y-4 pb-4">
                  {/* Author Field */}
                  <div className="space-y-2">
                    <label htmlFor="author" className="text-sm font-medium">
                      Author *
                    </label>
                    <Input id="author" value={asset.checkedOutBy || ""} readOnly className="bg-muted" />
                  </div>

                  {/* Date Field */}
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">
                      Date *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Version Field */}
                  <div className="space-y-2">
                    <label htmlFor="version" className="text-sm font-medium">
                      Version *
                    </label>
                    <Select value={version} onValueChange={setVersion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {versionOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Materials Field */}
                  <div className="space-y-2">
                    <label htmlFor="materials" className="text-sm font-medium">
                      Materials
                    </label>
                    <Select value={materials} onValueChange={setMaterials}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select materials option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Keywords Field */}
                  <div className="space-y-2">
                    <label htmlFor="keywords" className="text-sm font-medium">
                      Keywords *
                    </label>
                    <Textarea
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Enter keywords separated by commas"
                      rows={2}
                    />
                  </div>

                  {/* Commit Description Field */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Commit Description *
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter commit description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 mt-auto border-t gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Button onClick={handleNextStep} disabled={!isFormValid()}>
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetControlPanel;
