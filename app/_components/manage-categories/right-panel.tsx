/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'

const RightPanel = ({ categories, getChildCategories }: any) => {
    const [primaryCat, setPrimaryCat] = useState("");
    const [subCat, setSubCat] = useState(""); // For new child category name
    const [selectedChildCat, setSelectedChildCat] = useState(""); // For selected child category from dropdown
    const [loading, setLoading] = useState(false);

    const onCreateCat = async () => {
        if (!primaryCat) return; // Ensure the parent category is filled

        setLoading(true);
        try {
            const uri = process.env.NEXT_PUBLIC_API_URL!;

            // Step 1: Create Parent Category
            const parentCategoryResponse = await fetch(`${uri}/api/products/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: primaryCat,
                    parentCategories: [], // Parent category has no parent
                }),
            });

            const parentCategoryData = await parentCategoryResponse.json();

            // Step 2: Create or Link Child Category
            if (subCat) {
                // Create new child category
                await fetch(`${uri}/api/products/category`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: subCat,
                        parentCategories: [parentCategoryData._id], // Child category references parent ID
                    }),
                });
            } else if (selectedChildCat) {
                // Link existing child category to parent
                await fetch(`${uri}/api/products/category/${selectedChildCat}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        parentCategories: [parentCategoryData._id], // Add parent ID to existing child category
                    }),
                });
            }

            setLoading(false);
            window.location.reload();
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="bg-white h-[99%] w-full rounded-lg text-black p-5">
            <p className="font-bold text-lg">Create New Category</p>
            <hr className="my-5" />
            <section className="flex flex-col items-start justify-center gap-5">
                <Input
                    placeholder='Enter Parent Category Name'
                    onChange={(e) => setPrimaryCat(e.target.value)}
                />
                <div className="w-full flex flex-col gap-2">
                    <p className="font-bold text-lg">Create/Choose New Subcategory</p>
                    <Select onValueChange={(value) => setSelectedChildCat(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Existing Child Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category: any) => {
                                if (category.parentCategories.length === 0) {
                                    // If no parent, it's a primary category
                                    const childCategories = getChildCategories(category._id);
                                    return (
                                        <DropDownOptions key={category._id} childCategories={childCategories} />
                                    );
                                }
                                return null;
                            })}
                        </SelectContent>
                    </Select>
                    <div className="text-center font-bold">OR</div>
                    <Input
                        placeholder="Enter New Child Category Name"
                        onChange={(e) => setSubCat(e.target.value)}
                    />
                </div>
                <Button onClick={onCreateCat} disabled={!primaryCat || (!subCat && !selectedChildCat)}>
                    {loading ? "Loading..." : "Create"}
                </Button>
            </section>
        </div>
    );
};

export default RightPanel;

// DropDownOptions Component
const DropDownOptions = ({ childCategories }: any) => {
    return (
        <>
            {childCategories.map((category: any) => (
                <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
            ))}
        </>
    );
};
