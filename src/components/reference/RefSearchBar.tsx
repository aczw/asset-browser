
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/services/api";

interface SearchBarProps {
  onSearch: (search: string) => void;
  onAuthorFilter: (author: string | null) => void;
  onCheckedInFilter: (checkedInOnly: boolean) => void;
  onSort: (sortBy: string) => void;
}

const SearchBar = ({ onSearch, onAuthorFilter, onCheckedInFilter, onSort }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("updated");
  
  const sortOptions = [
    { label: "Name", value: "name" },
    { label: "Author", value: "author" },
    { label: "Recently Updated", value: "updated" },
    { label: "Recently Created", value: "created" },
  ];

  useEffect(() => {
    // Fetch authors when component mounts
    const fetchAuthors = async () => {
      const { authors } = await api.getAuthors();
      setAuthors(authors);
    };
    
    fetchAuthors();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleCheckedInToggle = () => {
    const newValue = !showCheckedInOnly;
    setShowCheckedInOnly(newValue);
    onCheckedInFilter(newValue);
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
      <form onSubmit={handleSearchSubmit} className="relative">
        <Input
          type="text"
          placeholder="Search assets by name or keywords..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input pl-10 h-12 text-base"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Button 
          type="submit" 
          variant="default" 
          size="sm" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3 pb-2">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4 mr-1" />
                {selectedAuthor ? `Author: ${selectedAuthor}` : "Filter by Author"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Author</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                {authors.map((author) => (
                  <DropdownMenuItem 
                    key={author} 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleAuthorSelect(author)}
                  >
                    {author}
                    {selectedAuthor === author && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {selectedAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleAuthorSelect(selectedAuthor)}
                  >
                    Clear filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center">
            <Checkbox 
              id="checked-in-only" 
              checked={showCheckedInOnly} 
              onCheckedChange={handleCheckedInToggle}
              className="mr-2"
            />
            <label htmlFor="checked-in-only" className="text-sm cursor-pointer select-none">
              Show checked-in assets only
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Sort: {sortOptions.find(o => o.value === sortOption)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort Assets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value} 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleSortSelect(option.value)}
                  >
                    {option.label}
                    {sortOption === option.value && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
