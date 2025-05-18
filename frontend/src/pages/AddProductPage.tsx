// src/pages/AddProductPage.tsx
import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, ProductFormInputData } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AddProductPage() {
  const { addProduct, isLoading: isProductContextLoading } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES.find(c => c !== "All") || "Others"); // Default to first non-"All" category
  const [price, setPrice] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const currentTotalFiles = imageFiles.length + filesArray.length;
      if (currentTotalFiles > 5) {
          toast({ title: "Too many images", description: "You can upload a maximum of 5 images.", variant: "destructive"});
          return; 
      }
      const newValidFiles = filesArray.filter(file => file.type.startsWith('image/'));
      if (newValidFiles.length !== filesArray.length) {
          toast({ title: "Invalid File Type", description: "Only image files are allowed.", variant: "destructive"});
      }
      setImageFiles(prevFiles => [...prevFiles, ...newValidFiles]);
      const newImagePreviews = newValidFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newImagePreviews]);
      event.target.value = ""; 
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => {
      const urlToRevoke = prevPreviews[indexToRemove];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      return prevPreviews.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !price.trim()) {
        toast({ title: "Missing Fields", description: "Please fill in all required product details.", variant: "destructive" });
        return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ title: "Invalid Price", description: "Please enter a valid positive price.", variant: "destructive" });
      return;
    }
    if (imageFiles.length === 0) {
        toast({ title: "No Image", description: "Please upload at least one product image.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const productData: ProductFormInputData = { title, description, category, price };
    const newProduct = await addProduct(productData, imageFiles);
    setIsSubmitting(false);

    if (newProduct && newProduct.id) {
      navigate(`/product/${newProduct.id}`); // ID is number, but route param is string
    }
  };

  return (
    <Layout>
      <div className="page-container max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Handmade Bamboo Coasters" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as string)} required>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(cat => cat !== "All").map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input id="price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="pl-7" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your eco-friendly product..." rows={4} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Product Images (up to 5)</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviews.map((previewUrl, index) => (
                <div key={previewUrl} className="relative aspect-square group">
                  <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md border" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => removeImage(index)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                 <Label htmlFor="image-upload-input" className="flex flex-col items-center justify-center w-full h-full aspect-square border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-eco-500 transition-colors">
                    <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <Input id="image-upload-input" type="file" multiple accept="image/*" onChange={handleImageChange} className="sr-only" />
                 </Label>
              )}
            </div>
            {imageFiles.length === 0 && <p className="text-xs text-red-500 mt-1">Please add at least one image.</p>}
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || isProductContextLoading}>
              {isSubmitting || isProductContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting || isProductContextLoading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
