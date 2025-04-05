
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import AssetGrid from "@/components/AssetGrid";
import { api } from "@/services/api";

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  
  const queryClient = useQueryClient();
  
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAssets({
        search: searchTerm,
        author: filterAuthor,
        checkedInOnly: showCheckedInOnly,
        sortBy,
      });
      setAssets(response.assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // We don't include fetchAssets in the dependency array to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterAuthor, showCheckedInOnly, sortBy]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
  };

  const handleAuthorFilter = (author: string | null) => {
    setFilterAuthor(author);
  };

  const handleCheckedInFilter = (checkedInOnly: boolean) => {
    setShowCheckedInOnly(checkedInOnly);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Asset Browser</h1>
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