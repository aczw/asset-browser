import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import type { AssetWithDetails } from "../../services/api";
import AssetGrid from "../AssetGrid";
import SearchBar from "../SearchBar";

const AssetsPage = () => {
  const [assets, setAssets] = useState<AssetWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  
  const queryClient = useQueryClient();
  
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching assets with params:", { searchTerm, filterAuthor, showCheckedInOnly, sortBy });
      const response = await api.getAssets({
        search: searchTerm,
        author: filterAuthor || undefined, // Convert null to undefined for API compatibility
        checkedInOnly: showCheckedInOnly,
        sortBy,
      });
      console.log("Fetched assets:", response.assets);
      console.log("Assets length:", response.assets.length);
      console.log("Assets first item:", response.assets[0]);
      setAssets(response.assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
      console.log("Is loading:", isLoading);
    }
  };

  useEffect(() => {
    console.log("AssetsPage mounted");
    console.log("Query client:", queryClient);
    fetchAssets();
    // We don't include fetchAssets in the dependency array to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterAuthor, showCheckedInOnly, sortBy]);

  const handleSearch = (search: string) => {
    console.log("Search term changed:", search);
    setSearchTerm(search);
  };

  const handleAuthorFilter = (author: string | null) => {
    console.log("Author filter changed:", author);
    setFilterAuthor(author);
  };

  const handleCheckedInFilter = (checkedInOnly: boolean) => {
    console.log("Checked in filter changed:", checkedInOnly);
    setShowCheckedInOnly(checkedInOnly);
  };

  const handleSort = (sortOption: string) => {
    console.log("Sort option changed:", sortOption);
    setSortBy(sortOption);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-left">Asset Browser</h1>
        <p className="text-muted-foreground text-left">Browse and search for assets</p>
      </div>
      
      <SearchBar
        onSearch={handleSearch}
        onAuthorFilter={handleAuthorFilter}
        onCheckedInFilter={handleCheckedInFilter}
        onSort={handleSort}
      />
      
      <div className="mt-6">
        <AssetGrid assets={assets} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AssetsPage;
