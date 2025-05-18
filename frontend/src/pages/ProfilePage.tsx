
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { ImagePlus, User } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, updateProfile, logout } = useAuth();
  const { userProducts } = useProducts();
  
  const [username, setUsername] = useState(currentUser?.username || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const success = await updateProfile({
      username,
      profileImage,
    });
    
    setIsSubmitting(false);
    
    if (success) {
      setIsEditing(false);
    }
  };
  
  const handleImagePlaceholder = () => {
    // For demo, use a placeholder image
    setProfileImage("https://images.unsplash.com/photo-1535268647677-300dbf3d78d1");
  };

  return (
    <Layout>
      <div className="page-container pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={currentUser?.username || "Profile"} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold">
                    {currentUser?.username || "User"}
                  </h2>
                  <p className="text-gray-500 text-sm">{currentUser?.email}</p>
                  
                  <div className="mt-6 w-full">
                    <Button 
                      onClick={() => setIsEditing(!isEditing)} 
                      variant="outline" 
                      className="w-full"
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                  
                  <div className="mt-3 w-full">
                    <Button 
                      onClick={logout} 
                      variant="ghost" 
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              {isEditing ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      {profileImage ? (
                        <div className="mt-2 relative rounded-md overflow-hidden">
                          <img 
                            src={profileImage} 
                            alt="Profile preview" 
                            className="w-full h-48 object-cover" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => setProfileImage("")}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-48 border-dashed" 
                          onClick={handleImagePlaceholder}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
                            <span>Add Image</span>
                            <span className="text-xs text-gray-400 mt-1">(Click for placeholder)</span>
                          </div>
                        </Button>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </div>
              ) : (
                <Tabs defaultValue="listings">
                  <TabsList className="w-full">
                    <TabsTrigger value="listings" className="flex-1">My Listings</TabsTrigger>
                    <TabsTrigger value="purchases" className="flex-1">Purchase History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="listings" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">My Listings</h2>
                      <Link to="/add-product">
                        <Button size="sm">Add New Product</Button>
                      </Link>
                    </div>
                    
                    {userProducts.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-500 mb-4">You haven't listed any products yet</p>
                        <Link to="/add-product">
                          <Button>Create Your First Listing</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userProducts.map(product => (
                          <ProductCard key={product.id} product={product} compact />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="purchases" className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
                    <div className="bg-white rounded-lg shadow divide-y">
                      <Link to="/purchases" className="block p-4 text-center text-primary hover:bg-gray-50">
                        View Purchase History
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
