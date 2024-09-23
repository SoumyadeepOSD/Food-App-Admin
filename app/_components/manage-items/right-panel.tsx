/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon, MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import React, { Key, useEffect, useState } from 'react';
import { Chip } from "@nextui-org/chip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '@/redux/loadingSlice';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from '@/hooks/use-toast';
import { Button as BTN } from '@nextui-org/button';
import { Toaster } from '@/components/ui/toaster';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
// Define the item type once and reuse it
interface Item {
  id: Key | string | any;
  name: string;
  description: string;
  price: string | number;
  brand: string;
  countInStock: number;
  image: string;
  categoriesNames: string[];
  categoriesIds: string[];
}



const RightPanel = () => {
  const dispatch = useDispatch();
  const [itemsWithCategories, setItemsWithCategories] = useState<Item[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<any>([]);
  // const [chosenCat, setChosenCat] = useState<Array<{ name: string; id: string }>>([]);
  const [currentEditItem, setCurrentEditItem] = useState<Item | null>(null);



  const [imageFile, setImageFile] = useState<File | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

  // Fetch categories
  const getCategories = async () => {
    const url = process.env.NEXT_PUBLIC_API_URL!;
    try {
      const response = await fetch(`${url}/api/products/category`, {
        method: 'GET'
      });
      if (response.ok) {
        const categories = await response.json();
        setAllCategories(categories);
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  const fetchData = async () => {
    dispatch(showLoading());
    try {

      const res = await fetch(`${BASE_API}/api/products/category`, {
        method: 'GET',
      });
      if (res.status === 200 || res.status === 201) {
        const allCategories = await res.json();
        const response = await fetch(`${BASE_API}/api/products`);
        const allItems = await response.json();

        // Create a mapping of category ID to category name
        const categoryMap = allCategories.reduce((acc: { [key: string]: string }, category: { _id: string; name: string }) => {
          acc[category._id] = category.name;
          return acc;
        }, {});

        // Map allItems to include category names
        const transformedItems: Item[] = allItems.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          brand: item.brand,
          countInStock: item.countInStock,
          image: item.image,
          categoriesIds: item.categories,
          categoriesNames: item.categories.map((catId: string) => categoryMap[catId] || catId),
        }));

        setItemsWithCategories(transformedItems);
        dispatch(hideLoading());
      }
      dispatch(hideLoading());
    } catch (error: any) {
      console.log(error.message);
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    dispatch(showLoading());
    fetchData(); // Call the fetchData function
    getCategories();
    dispatch(hideLoading());
  }, []);



  // Filter items based on the search query
  const filteredItems = itemsWithCategories.filter((item: Item) => {
    const lowerCaseQuery = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      item.description.toLowerCase().includes(lowerCaseQuery) ||
      item.categoriesNames.some((category) => category.toLowerCase().includes(lowerCaseQuery))
    );
  });


  const imageUrlToId = (url: string) => {
    const substr = url.split('/food_dashboard/')[1];
    if (substr) {
      return substr.split('.')[0]; // Remove the file extension
    }
    return null; // Return null if the ID can't be extracted
  };

  const onHandleDeleteItem = async ({ id, imageUrl }: { id: string, imageUrl: string }) => {
    try {
      setLoading(true);
      const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
      const publicId = imageUrlToId(imageUrl);
      console.log("PublicID is:", publicId);

      if (!publicId) {
        throw new Error("Invalid image URL, unable to extract publicId.");
      }

      // Step-1 : Delete the imageURL from Cloudinary
      const deletedImage = await fetch("/api/delete-image", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId, // Ensure the correct publicId is passed
        }),
      });

      // !Debug
      console.log("Deleted Image is : ", deletedImage);

      const deletedImageData = await deletedImage.json();
      // !Debug
      console.log("Deleted Image data is : ", deletedImageData);

      if (deletedImage.status === 200 || deletedImage.status === 201) {
        toast({
          title: "Successful",
          description: `Image ${deletedImageData.message} deleted from Cloudinary`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete image from Cloudinary");
      }

      // Step-2 : Delete it from MongoDB
      const res = await fetch(`${BASE_API}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const deletedItem = await res.json();

      if (res.ok) {
        toast({
          title: "Successful",
          description: `${deletedItem.name} is deleted from the database`,
          variant: "default",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to delete from MongoDB");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  // !Handle the product edit function
  const handleEdit = async ({ id, imageUrl }: { id: string, imageUrl: string }) => {
    // Extract the Cloudinary public ID from the existing image URL
    const publicId = imageUrlToId(imageUrl);

    // Prepare form data for image upload if a new image is provided
    const formData = new FormData();
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    setLoading(true);

    try {
      // Delete the existing image from Cloudinary
      const deleteRes = await fetch("/api/delete-image", {
        method: 'POST',
        body: JSON.stringify({ publicId }),
      });

      if (!deleteRes.ok) {
        throw new Error("Failed to delete image from Cloudinary.");
      }

      // Proceed to upload the new image if provided
      let uploadedImageUrl = imageUrl; // Default to existing image if no new image is uploaded
      if (imageFile) {
        const uploadRes = await fetch("/api/upload_image", {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload new image.");
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.data.secure_url; // Use the new uploaded image URL
      }

      // Update the product in the database with the modified data
      const productRes = await fetch(`${BASE_API}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentEditItem?.name,
          description: currentEditItem?.description,
          price: currentEditItem?.price,
          categories: currentEditItem?.categoriesIds, // Update with chosen category IDs
          brand: currentEditItem?.brand,
          countInStock: currentEditItem?.countInStock,
          image: uploadedImageUrl, // Use either the newly uploaded image or the existing one
        }),
      });

      if (!productRes.ok) {
        throw new Error("Failed to update the product.");
      }

      const editedItem = await productRes.json();
      console.log(editedItem);

      // Successfully updated, now reload or update the UI accordingly
      window.location.reload();
      setLoading(false);
    } catch (error: any) {
      console.error("Error occurred:", error.message);

      // Show error notification using toast
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });

      setLoading(false);
    }
  };

  // Handle file validation and setting
  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File size too large',
        description: `The file size is ${Math.round(file.size / 1024 / 1024)} MB. Maximum allowed size is 10 MB.`,
        variant: 'destructive',
      });
    } else {
      setImageFile(file);
      toast({
        title: 'File selected',
        description: `You selected ${file.name}`,
      });
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      validateAndSetFile(file);
    }
  };

  const onHandleRemoveCategory = ({ categoryName, categoryId }: { categoryName: string, categoryId: string }) => {
    if (currentEditItem) {
      setCurrentEditItem({
        ...currentEditItem,
        categoriesNames: currentEditItem?.categoriesNames.filter(name => name !== categoryName),
        categoriesIds: currentEditItem?.categoriesIds.filter(id => id !== categoryId)
      });
    }
  }

  const categoryMap = allCategories.reduce((acc: { [key: string]: string }, category: { _id: string; name: string }) => {
    acc[category._id] = category.name;
    return acc;
  }, {});


  return (
    <div className="w-full text-black bg-white h-full p-3 rounded-lg overflow-y-scroll">
      <Toaster />
      <p className="text-2xl font-bold mb-2">Navigate your items</p>
      <section className="flex flex-row items-start gap-5">
        <Input
          placeholder="Find your item(s)"
          onChange={(e) => setQuery(e.target.value)} // Update query on input change
        />
        <Button className="flex flex-row items-center gap-3">
          <MagnifyingGlassIcon />
          <span>Search</span>
        </Button>
      </section>
      <hr className="my-3" />
      <section className="my-2 grid grid-cols-4 gap-3">
        {filteredItems.map((item: Item) => (
          <Card key={item.id}>
            <CardContent className="flex justify-center items-center h-32"> {/* Set fixed height */}
              <Image
                src={item.image || ""}
                alt={"image"}
                width={200}
                height={100}
                className="rounded-lg mt-24"
                style={{ objectFit: "cover", height: "150%", width: "100%" }} // Adjust object-fit and ensure full coverage
              />
            </CardContent>

            <CardHeader>
              <CardTitle className="mt-10">{item.name}</CardTitle>
              <CardDescription>
                <p>{item.description}</p>
                <div className="grid grid-cols-3 mt-5 gap-2">
                  {item.categoriesNames.map((cat: string, index: Key) => (
                    <Chip key={index} color="success" variant="flat">{cat}</Chip>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-row items-center gap-5">
                <p className="text-medium font-bold">₹{item.price}</p>
                <p className="font-bold">{item.brand}</p>
                <AlertDialog>
                  <AlertDialogTrigger onClick={() => setCurrentEditItem(item)}>
                    <Pencil1Icon color="black" height={20} width={20} />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex flex-row items-center gap-3">
                        <p>Edit Item</p>
                        <Pencil1Icon color='white' height={20} width={20}/>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {/* Data */}
                        {currentEditItem && <div className="flex flex-col gap-3 items-start">
                          <Input
                            value={currentEditItem.name}
                            className="text-white"
                            onChange={(e) => {
                              setCurrentEditItem({
                                ...currentEditItem, name: e.target.value
                              })
                            }}
                          />
                          <Input
                            value={currentEditItem.description}
                            className="text-white"
                            onChange={(e) => {
                              setCurrentEditItem({
                                ...currentEditItem, description: e.target.value
                              })
                            }}
                          />

                          <Input
                            value={currentEditItem.price}
                            className="text-white"
                            onChange={(e) => {
                              setCurrentEditItem({
                                ...currentEditItem, price: e.target.value
                              })
                            }}
                          />

                          <Input
                            value={currentEditItem.brand}
                            className="text-white"
                            onChange={(e) => {
                              setCurrentEditItem({
                                ...currentEditItem, brand: e.target.value
                              })
                            }}
                          />


                          <Input
                            value={currentEditItem.countInStock}
                            className="text-white"
                            onChange={(e) => setCurrentEditItem({
                              ...currentEditItem,
                              countInStock: parseInt(e.target.value)
                            })}
                          />

                          <Select onValueChange={(e) => {
                            const splitItems = e.split("+")
                            const categoryName = splitItems[0];
                            const categoryId = splitItems[1];
                            console.log(`Name: ${categoryName}, Id: ${categoryId}`);
                            setCurrentEditItem({
                              ...currentEditItem,
                              categoriesIds: [...currentEditItem.categoriesIds, categoryId],
                              categoriesNames: [...currentEditItem.categoriesNames, categoryName]
                            });
                          }}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Categories" className="text-white" />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                allCategories && allCategories.map((singleCat: any, index: any) => {
                                  const value = `${singleCat.name}+${singleCat._id}`
                                  return (<SelectItem key={index} value={value}>{singleCat.name}</SelectItem>)
                                })
                              }
                            </SelectContent>
                          </Select>

                          <div className="grid grid-cols-4 gap-3">
                            {currentEditItem && currentEditItem.categoriesIds.map((catId, index) => {
                              const categoryName = categoryMap[catId]; // Assuming categoryMap is accessible here
                              return (
                                <Chip key={index} onClose={() => onHandleRemoveCategory({ categoryName, categoryId: catId })}>
                                  {categoryName}
                                </Chip>
                              );
                            })}
                          </div>

                          <BTN color="success" className="w-full" onClick={() => document.getElementById('file-input-popup')?.click()}>
                            Pick New from Device
                            <ImageIcon height={20} width={20} color='white' />
                          </BTN>
                          <input
                            id="file-input-popup"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                          />

                        </div>}
                        {/* Data */}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <BTN color="danger" isLoading={loading} onClick={() => { handleEdit({ id: item.id, imageUrl: item.image }) }}>Edit</BTN>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger>
                    <TrashIcon color='red' height={20} width={20} />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <BTN color="danger" onClick={() => { onHandleDeleteItem({ id: item.id, imageUrl: item.image }) }} isLoading={loading}>Delete</BTN>
                      <BTN onClick={() => {
                        console.log(currentEditItem);
                      }}>Show</BTN>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default RightPanel;
