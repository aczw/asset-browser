import type { AssetWithDetails, Commit, Metadata } from "@/lib/types";
import { useRef, useState, useEffect } from "react";
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
  X,
  GitCommit,
  Info,
  Tag,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface AssetInfoFlowProps {
  asset: AssetWithDetails;
  canCheckout: boolean;
  canCheckin: boolean;
  onCheckout: () => void;
  onCheckin: () => void;
  onDownload: () => void;
  onLaunchDCC: () => void;
  onFilesChange: (newFiles: File[]) => void;
  onMetadataChange: (newMetadata: Metadata) => void;
  hideTitle?: boolean;
}

const AssetInfoFlow = ({
  asset,
  canCheckout,
  canCheckin,
  onCheckout,
  onCheckin,
  onDownload,
  onLaunchDCC,
  onFilesChange,
  onMetadataChange,
  hideTitle = false
}: AssetInfoFlowProps) => {
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
  const [commitHistory, setCommitHistory] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

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
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    // Reset verification status and message when files are removed
    setVerificationComplete(false);
    setVerificationMessage(null);
  };

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
      const { data, error } = await actions.verifyAsset(formData);
      if (!data.success) {
        setVerificationMessage(
          `Files did not verify! \n${data.message || "Unknown error"}`
        );
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

  // Step 3 functions
  // Get version options from commit history
  const getVersionOptions = () => {
    if (commitHistory.length === 0) {
      return [];
    }

    // Return all versions from the commit history
    return commitHistory.map(commit => commit.version);
  };

  const versionOptions = getVersionOptions();

  const handleMetadataChange = (field: keyof Metadata, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      !!version &&
      !!description &&
      !!keywords.trim() &&
      !!date
    );
  };

  const handleMetadataSubmit = () => {
    // Prepare metadata for submission
    const keywordsList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== "");

    const newMetadata: Metadata = {
      assetName: asset.name,
      assetStructureVersion: "1.0",
      hasTexture: materials === "Yes",
      keywords: keywordsList,
      commit: {
        version,
        note: description,
        author: asset.checkedOutBy || "",
        timestamp: date ? date.toISOString() : new Date().toISOString(),
      },
      versionMap: {}, // Empty version map as required by the type
    };

    // Pass metadata to parent component
    onMetadataChange(newMetadata);

    // Complete the check-in process
    handleCheckInComplete();
  };

  useEffect(() => {
    const fetchCommitHistory = async () => {
      try {
        const { data, error } = await actions.getAssetCommits({ assetName: asset.name });
        if (error) {
          console.error("Failed to fetch commit history:", error);
        } else {
          setCommitHistory(data);
          // Set the initial version to the current asset version
          if (data.length > 0) {
            setVersion(data[0].version); // Set to the latest version
            setSelectedCommit(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching commit history:", error);
      }
    };
    fetchCommitHistory();
  }, [asset.name]);

  useEffect(() => {
    if (version && commitHistory.length > 0) {
      const selectedCommit = commitHistory.find(commit => commit.version === version);
      setSelectedCommit(selectedCommit || null);
    }
  }, [version, commitHistory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Version</div>
        <Select value={selectedCommit?.version || asset?.version} onValueChange={(value) => {
          const commit = commitHistory.find(c => c.version === value);
          if (commit) {
            setSelectedCommit(commit);
          }
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={asset?.version} />
          </SelectTrigger>
          <SelectContent>
            {commitHistory.map((commit) => (
              <SelectItem key={commit.version} value={commit.version}>
                {commit.version}
              </SelectItem>
            ))}
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

      <Dialog open={checkInOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          {step === 2 && (
            <div className="flex flex-col h-full max-h-[75vh]">
              <div className="pb-4">
                <p className="text-sm text-muted-foreground">Check-in Step 1 of 2</p>
                <p className="text-xl">Upload & Verify</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Upload Files</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".zip"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                        className="flex items-center gap-1"
                      >
                        <FileUp className="h-3 w-3" />
                        Browse
                      </Button>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/40 min-h-[100px]">
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          Drag and drop files here or click Browse
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-background rounded-md p-2 text-sm"
                            >
                              <span className="truncate max-w-[300px]">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerify}
                      className="w-full"
                      disabled={uploadedFiles.length === 0}
                    >
                      Verify Files
                    </Button>
                  </div>

                  {verificationMessage && (
                    <div
                      className={`p-2 text-center text-sm font-medium ${
                        verificationComplete ? "text-green-600" : "text-red-500"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: verificationMessage.replace(/\n/g, "<br />"),
                      }}
                    />
                  )}

                  {invalidFiles.length > 0 && (
                    <div className="border border-red-200 bg-red-50 rounded-md p-3">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Invalid file names:
                      </p>
                      <ul className="space-y-1 text-sm text-red-600">
                        {invalidFiles.map((fileName, index) => (
                          <li key={index}>
                            • {fileName} - should follow one of the valid patterns
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

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

      {/* Asset Metadata Section */}
      <Separator className="my-4" />
      
      <div className="space-y-4 text-left">
        {/* {!hideTitle && <h3 className="text-lg font-medium text-left">{asset?.name}</h3>} */}

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Creator</div>
              <div className="text-sm text-muted-foreground">{asset?.creator}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Commit Author</div>
              <div className="text-sm text-muted-foreground">
                {selectedCommit ? (selectedCommit as any).authorPennkey : asset?.lastModifiedBy}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedCommit ? new Date(selectedCommit.timestamp).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : (
                  asset?.updatedAt
                    ? new Date(
                        // If the date ends with +HH or -HH (two digits, no :00), append :00
                        asset.updatedAt.replace(/([+-]\d{2})$/, "$1:00")
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                )}
              </div>
            </div>
          </div>

          {asset?.isCheckedOut && asset.checkedOutBy && (
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium">Checked Out By</div>
                <div className="text-sm text-muted-foreground">{asset.checkedOutBy}</div>
              </div>
            </div>
          )}

          {asset?.keywords && asset.keywords.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium">Keywords</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asset.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Materials Available</div>
              <div className="text-sm text-muted-foreground">{asset?.materials ? "Yes" : "No"}</div>
            </div>
          </div>
          {selectedCommit && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium">Commit Note</div>
                <div className="text-sm text-muted-foreground">{selectedCommit.note}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetInfoFlow;
