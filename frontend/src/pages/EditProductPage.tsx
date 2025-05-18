// src/pages/EditProductPage.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, Product, ProductFormInputData } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EditProductPage() {
  const { id: productIdStr } = useParams<{ id: string }>(); // productIdStr is string
  const { currentUser } = useAuth();
  const { getProductById, updateProduct, isLoading: isProductContextLoading } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [isFetchingProduct, setIsFetchingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productIdStr) {
      navigate('/not-found', { replace: true });
      return;
    }
    const fetchProduct = async () => {
      setIsFetchingProduct(true);
      const foundProduct = await getProductById(productIdStr); // Pass string ID
      if (foundProduct) {
        // Ensure current user is the seller
        if (currentUser?.id !== foundProduct.sellerId) {
          toast({ title: "Unauthorized", description: "You are not allowed to edit this product.", variant: "destructive" });
          navigate('/', { replace: true });
          return;
        }
        setProduct(foundProduct);
        setTitle(foundProduct.title);
        setDescription(foundProduct.description);
        setCategory(foundProduct.category);
        setPrice(foundProduct.price.toString());
        setExistingImageUrls(foundProduct.images || []); // These are full URLs from backend
      } else {
        setProduct(null);
        toast({ title: "Not Found", description: "Product not found or error fetching details.", variant: "destructive" });
        // navigate('/not-found', { replace: true }); // Handled by getProductById if it returns undefined
      }
      setIsFetchingProduct(false);
    };
    fetchProduct();
  }, [productIdStr, getProductById, currentUser, navigate, toast]);

  const handleNewImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const totalCurrentImageCount = existingImageUrls.length + newImageFiles.length + filesArray.length;
      if (totalCurrentImageCount > 5) {
        toast({ title: "Image Limit", description: "You can have a maximum of 5 images in total.", variant: "destructive" });
        return;
      }
      const newValidFiles = filesArray.filter(file => file.type.startsWith('image/'));
      if (newValidFiles.length !== filesArray.length) {
          toast({ title: "Invalid File Type", description: "Only image files are allowed.", variant: "destructive"});
      }
      setNewImageFiles(prev => [...prev, ...newValidFiles]);
      const previews = newValidFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
      event.target.value = "";
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(prevPreviews => {
      const urlToRevoke = prevPreviews[indexToRemove];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return prevPreviews.filter((_, index) => index !== indexToRemove);
    });
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdStr || !product) return;

    if (!title.trim() || !description.trim() || !category || !price.trim()) {
        toast({ title: "Missing Fields", description: "Please fill in all required product details.", variant: "destructive" });
        return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ title: "Invalid Price", description: "Please enter a valid positive price.", variant: "destructive" });
      return;
    }
    if (existingImageUrls.length === 0 && newImageFiles.length === 0) {
        toast({ title: "No Images", description: "Please ensure there is at least one product image.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const productDataToUpdate: Partial<ProductFormInputData> = { title, description, category, price };

    // Pass only the filenames of existing images to keep, not full URLs, if backend expects filenames
    // Or pass full URLs if backend can handle parsing them to filenames
    // The backend `update_product` expects `existingImages` as a JSON string of URLs/filenames.
    // It will try to extract filenames from these URLs.
    const success = await updateProduct(productIdStr, productDataToUpdate, newImageFiles, existingImageUrls);
    setIsSubmitting(false);

    if (success) {
      navigate(`/product/${productIdStr}`);
    }
  };

  if (isFetchingProduct || product === undefined) {
    return <Layout><div className="page-container flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-eco-500" /></div></Layout>;
  }
  if (product === null) { // Product explicitly not found or unauthorized
    return <Layout><div className="page-container text-center py-10">Product not found or you are not authorized to edit it.</div></Layout>;
  }

  return (
    <Layout>
      <div className="page-container max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Product: {product.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as string)} required>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(cat => cat !== "All").map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input id="price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-7" required /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>

          <div className="space-y-2">
            <Label>Product Images (max 5 total)</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImageUrls.map((url, index) => (
                <div key={`existing-${url}-${index}`} className="relative aspect-square group">
                  <img src={url} alt={`Current ${index + 1}`} className="w-full h-full object-cover rounded-md border" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => removeExistingImage(url)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {newImagePreviews.map((previewUrl, index) => (
                <div key={`new-${previewUrl}-${index}`} className="relative aspect-square group">
                  <img src={previewUrl} alt={`New preview ${index + 1}`} className="w-full h-full object-cover rounded-md border" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => removeNewImage(index)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(existingImageUrls.length + newImageFiles.length) < 5 && (
                 <Label htmlFor="new-image-upload-input" className="flex flex-col items-center justify-center w-full h-full aspect-square border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-eco-500 transition-colors">
                    <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add More</span>
                    <Input id="new-image-upload-input" type="file" multiple accept="image/*" onChange={handleNewImageChange} className="sr-only" />
                 </Label>
              )}
            </div>
             {(existingImageUrls.length + newImageFiles.length) === 0 && <p className="text-xs text-red-500 mt-1">Please add or keep at least one image.</p>}
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || isProductContextLoading || isFetchingProduct}>
              {isSubmitting || isProductContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting || isProductContextLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
