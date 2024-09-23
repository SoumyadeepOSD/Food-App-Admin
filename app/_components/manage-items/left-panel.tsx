/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Button as NextUIButton } from "@nextui-org/button";
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Chip } from '@nextui-org/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { validateAndSetFile } from '@/utils/helper';

const LeftPanel = () => {
    const [allCategories, setAllCategories] = useState<any>([]);
    const [chosenCat, setChosenCat] = useState<Array<{ name: string; id: string }>>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    

    const [name, setName] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [brand, setBrand] = useState<string>("");
    const [countStock, setCountStock] = useState<string>("");

    // Handle creating item (form submission)
    const onCreateItem = async () => {
        setLoading(true);
        try {
            // Upload image
            const formData = new FormData();
            if (imageFile) formData.append('imageFile', imageFile);

            const response = await fetch("/api/upload_image", {
                method: 'POST',
                body: formData,
            });

            // If image uploaded successfully
            if (response.ok) {
                const data: any = await response.json();
                const uploadedImageUrl = data.data.secure_url; // Get the secure URL from response

                // Check if required fields are filled
                if (!name || !desc || !price || !brand || !countStock || !uploadedImageUrl) {
                    toast({
                        title: "Null Alert",
                        description: `${JSON.stringify({ name, desc, price, brand, countStock, uploadedImageUrl })}`,
                        variant: "destructive"
                    });
                    console.log({ name, desc, price, brand, countStock, uploadedImageUrl });
                    setLoading(false);
                    return;
                }

                // Send the product creation request
                const URL_API = process.env.NEXT_PUBLIC_API_URL!;
                const URL = `${URL_API}/api/products`;
                const res = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        description: desc,
                        price,
                        categories: chosenCat.map(cat => cat.id), // Send category IDs
                        brand,
                        countInStock: countStock,
                        image: uploadedImageUrl
                    }),
                });
                if (res.ok) {
                    toast({
                        title: "Successful",
                        description: "Successfully created a new item",
                        variant: "default"
                    });
                    console.log(res);
                    document.location.reload();
                } else {
                    toast({
                        title: "Error",
                        description: "Item creation failed. Please check the API.",
                        variant: "destructive",
                    });
                }
                setLoading(false);
            } else {
                toast({
                    title: "Image Upload Failed",
                    description: "Unable to upload the image",
                    variant: "destructive",
                });
                setLoading(false);
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: `Can't create item: ${error.message}`,
                variant: "destructive"
            });
            setLoading(false);
        }
    };

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


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                validateAndSetFile(file, setImageFile);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            validateAndSetFile(file, setImageFile);
        }
    };

    // Remove category chip
    const handleClose = (itemId: string) => {
        setChosenCat((prevChosenCat) => prevChosenCat.filter((cat) => cat.id !== itemId));
    };

    // Fetch categories on mount
    useEffect(() => {
        getCategories();
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    validateAndSetFile(file, setImageFile);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    return (
        <div className="w-[30%] text-black bg-white h-full p-3 rounded-lg overflow-y-scroll">
            <Toaster />
            <p className="text-2xl font-bold mb-2">Add new items</p>
            <hr className="my-2" />
            <section className="flex flex-col gap-5 items-start">
                <Input placeholder="Enter Product Name" onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Enter Description" onChange={(e) => setDesc(e.target.value)} />
                <Input placeholder="Enter Product Price" onChange={(e) => setPrice(e.target.value)} />
                <Input placeholder="Enter Product Brand" onChange={(e) => setBrand(e.target.value)} />
                <Input type="number" placeholder="Enter Item Count in Stock" onChange={(e) => setCountStock(e.target.value)} />

                <Select onValueChange={(selectedId) => {
                    const selectedCategory = allCategories.find((cat: any) => cat._id === selectedId);
                    if (selectedCategory) {
                        setChosenCat([...chosenCat, { id: selectedId, name: selectedCategory.name }]);
                    }
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map((category: any) => (
                            <SelectItem key={category._id} value={category._id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div
                    className={`border-2 border-dashed p-6 w-full text-center ${isDragOver ? 'border-blue-500 bg-blue-100' : 'border-gray-400'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {imageFile ? <p>{imageFile.name}</p> : <p>Drag and drop, paste, or pick an image file</p>}
                </div>

                <NextUIButton color="success" className="w-full" onClick={() => document.getElementById('file-input')?.click()}>
                    Pick from Device
                </NextUIButton>
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <section className="flex flex-wrap gap-2 items-center justify-center">
                    {chosenCat.map((item: any) => (
                        <Chip
                            key={item.id}
                            onClose={() => handleClose(item.id)}
                            className="font-semibold bg-[#D3D9DE] text-black"
                            variant="flat"
                            size="md"
                            isCloseable
                        >
                            {item.name}
                        </Chip>
                    ))}
                </section>
            </section>

            <hr className="my-2" />
            <NextUIButton 
                onClick={onCreateItem} 
                className="bg-black text-white w-full" 
                isDisabled={!name || !desc || !price || !brand || !countStock || !imageFile || !chosenCat} isLoading={loading}
            >
                {loading ? 'Creating...' : 'Add Item'}
            </NextUIButton>
        </div>
    );
};

export default LeftPanel;
