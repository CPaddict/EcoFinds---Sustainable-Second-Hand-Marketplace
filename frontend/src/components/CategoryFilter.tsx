
import { useState } from "react";
import { CATEGORIES, Category } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  activeCategory: Category;
  onChange: (category: Category) => void;
  className?: string;
}

export function CategoryFilter({ 
  activeCategory, 
  onChange,
  className
}: CategoryFilterProps) {
  return (
    <div className={className}>
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-4 px-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onChange(category)}
              className={cn(
                "px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors",
                activeCategory === category
                  ? "bg-eco-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
