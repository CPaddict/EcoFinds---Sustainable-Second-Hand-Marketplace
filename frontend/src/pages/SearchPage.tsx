
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { Category } from "@/types";

export default function SearchPage() {
  const [localQuery, setLocalQuery] = useState("");
  const [localCategory, setLocalCategory] = useState<Category>("All");
  const { 
    filteredProducts, 
    setSearchQuery, 
    setActiveCategory 
  } = useProducts();
  
  const handleSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
  };
  
  const handleCategoryChange = (category: Category) => {
    setLocalCategory(category);
    setActiveCategory(category);
  };

  return (
    <Layout>
      <div className="page-container pb-20">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Search Products</h1>
            
            <SearchBar 
              onSearch={handleSearch} 
              initialValue={localQuery} 
              className="mb-4"
            />
            
            <CategoryFilter 
              activeCategory={localCategory} 
              onChange={handleCategoryChange}
            />
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600">No products found</h2>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filter settings
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
