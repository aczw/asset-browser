import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AssetWithDetails, GetUsersBody } from "@/lib/types";
import AssetGrid from "../AssetGrid";
import UploadAssetFlow from "../asset-detail/UploadAssetFlow";

import { Header } from "@/components/Header";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { actions } from "astro:actions";
import {
  ArrowUpDownIcon,
  Check,
  ChevronDown,
  FileLock2Icon,
  Plus,
  Search,
  User,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  users: GetUsersBody["users"];
  onSearch: (search: string) => void;
  onAuthorFilter: (author: string | null) => void;
  onAssetStatusFilter: (assetStatus: string) => void;
  onSort: (sortBy: string) => void;
}

const SearchBar = ({
  users,
  onSearch,
  onAuthorFilter,
  onAssetStatusFilter,
  onSort,
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [assetStatus, setAssetStatus] = useState<string>("none");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("updated");
  const [createAssetOpen, setCreateAssetOpen] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);

  const sortOptions = [
    { label: "Name", value: "name" },
    { label: "Author", value: "author" },
    { label: "Recently updated", value: "updated" },
    { label: "Recently created", value: "created" },
  ];

  const checkInOptions = [
    { label: "None", value: "none" },
    { label: "Checked-in only", value: "check-in" },
    { label: "Checked-out only", value: "check-out" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleCheckedInToggle = (status: string) => {
    setAssetStatus(status);
    onAssetStatusFilter(status);
  };

  const handleAuthorSelect = (author: string) => {
    const newAuthor = selectedAuthor === author ? null : author;
    setSelectedAuthor(newAuthor);
    onAuthorFilter(newAuthor);
  };

  const handleSortSelect = (sortBy: string) => {
    setSortOption(sortBy);
    onSort(sortBy);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <form
        onSubmit={handleSearchSubmit}
        className="w-full flex items-center justify-between gap-4"
      >
        <Input
          type="text"
          placeholder="Search assets by name or keywords..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-12 pl-4"
        />

        <Button type="submit" variant="secondary" className="h-12 w-30">
          <Search className="h-5 w-5" />
          Search
        </Button>
      </form>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <UserIcon />
                {selectedAuthor ? (
                  <>
                    <span className="font-semibold">Author:</span> {selectedAuthor}
                  </>
                ) : (
                  "Filter by author"
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 h-[300px] overflow-y-auto p-0">
              <Command>
                <CommandInput placeholder="Search for name..." />
                <CommandList>
                  <CommandEmpty>No author found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user, index) => (
                      <CommandItem
                        key={`${user.pennId}-${user.fullName}-${index}`}
                        value={user.fullName}
                        onSelect={() => {
                          handleAuthorSelect(user.pennId);
                          setAuthorOpen(false);
                        }}
                        className="flex items-center justify-between"
                      >
                        {user.fullName}
                        {selectedAuthor === user.pennId && <Check />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileLock2Icon />
                {assetStatus === "none" ? (
                  "Filter by asset status"
                ) : (
                  <>
                    <span className="font-semibold">Asset status:</span>{" "}
                    {assetStatus === "check-in" ? "Checked in only" : "Checked out only"}
                  </>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {checkInOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleCheckedInToggle(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {option.value === assetStatus && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDownIcon />
                <span className="font-semibold">Sorted by:</span>{" "}
                {sortOptions.find((option) => option.value === sortOption)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {sortOption === option.value && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="default"
          onClick={() => setCreateAssetOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Upload New Asset
        </Button>
      </div>

      <UploadAssetFlow
        open={createAssetOpen}
        onOpenChange={setCreateAssetOpen}
        onComplete={() => {
          // Refresh the asset list after creating a new asset
          onSearch(searchValue);
        }}
      />
    </div>
  );
};

const AssetsPage = ({ users, error }: { users: GetUsersBody["users"]; error: any }) => {
  const { toast } = useToast();

  const [assets, setAssets] = useState<AssetWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  const [assetStatus, setAssetStatus] = useState("none");
  const [sortBy, setSortBy] = useState("updated");

  if (error) {
    toast({
      title: "Failed to fetch all users",
      description: "This is very bad",
      variant: "destructive",
    });

    return null;
  }

  const fetchAssets = async () => {
    setIsLoading(true);

    const payload = {
      search: searchTerm,
      author: filterAuthor || undefined,
      assetStatus: assetStatus === "none" ? undefined : assetStatus === "check-in" ? true : false,
      sortBy,
    };

    console.log("Fetching assets with params:", payload);
    const { data, error } = await actions.getAssets(payload);

    if (error) {
      console.error("[ERROR] API: Failed to fetch assets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch assets. Please try again.",
        variant: "destructive",
      });
      setAssets([]);
    } else {
      const { assets } = data;
      console.log("Fetched assets:", assets);
      console.log("Assets length:", assets.length);
      console.log("Assets first item:", assets[0]);
      setAssets(assets);
    }

    setIsLoading(false);
    console.log("Is loading:", isLoading);
  };

  useEffect(() => {
    console.log("AssetsPage mounted");
    fetchAssets();
    // We don't include fetchAssets in the dependency array to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterAuthor, assetStatus, sortBy]);

  return (
    <div className="container mx-auto py-14 px-4 max-w-7xl space-y-6">
      <Header />

      <SearchBar
        users={users}
        onSearch={setSearchTerm}
        onAuthorFilter={setFilterAuthor}
        onAssetStatusFilter={setAssetStatus}
        onSort={setSortBy}
      />

      <AssetGrid assets={assets} isLoading={isLoading} />
    </div>
  );
};

export default AssetsPage;
