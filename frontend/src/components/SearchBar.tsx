
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  className?: string;
}

export function SearchBar({ onSearch, initialValue = "", className }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex w-full items-center ${className}`}>
      <Input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="icon"
        className="absolute right-0 mr-1"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
