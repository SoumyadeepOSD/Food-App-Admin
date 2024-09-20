/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@nextui-org/progress';
import { Input } from '@/components/ui/input';

const LeftPanel = ({ categories, getChildCategories }: any) => {
    const [loading, setLoading] = useState(false);

    const onDeleteParentCategory = async ({ categoryId }: { categoryId: string }) => {
        setLoading(true);
        try {
            const uri = process.env.NEXT_PUBLIC_API_URL!;
            const res: any = await fetch(`${uri}/api/products/category`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    categoryId: categoryId,
                }),
            });
            const data = await res.json(); // parse the response
            if (res.ok) {
                toast({
                    title: "Success",
                    description: `Category deleted successfully.`,
                    variant: "default"
                });
                setLoading(false);
                window.location.reload();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Something went wrong",
                    variant: "destructive",
                });
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    return (
        <Card className="h-[100%] w-[40%]">
            <Toaster />
            <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
            </CardHeader>
            <CardContent>
                {
                    categories.map((category: any, index: any) => {
                        // Check if the category has no parents, display as primary label
                        if (!category.parentCategories.length) {
                            const childCategories = getChildCategories(category._id);
                            return (
                                <div key={index} className="flex flex-col items-start gap-5 my-5 bg-gray-200 h-full p-3 rounded-md">
                                    <div className="w-full flex flex-row items-center justify-between">
                                        <CategoryOptions
                                            name={category.name}
                                            childCategories={childCategories}
                                        />
                                        <div className="flex flex-row gap-2">
                                            {/* AlertDialog for adding a new subcategory */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Pencil1Icon
                                                        color="blue"
                                                        height={20}
                                                        width={20}
                                                        className="hover:cursor-pointer"
                                                    />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white text-black">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Add New Subcategory</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Please enter a name for the new subcategory of <strong>{category.name}</strong>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AddSubCategoryForm
                                                        parentCategoryId={category._id}
                                                        onSuccess={() => window.location.reload()}
                                                    />
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            {/* AlertDialog for deleting a category */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <TrashIcon color="red" height={20} width={20} className="hover:cursor-pointer" />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-black">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your category
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => onDeleteParentCategory({ categoryId: category._id })}
                                                            disabled={loading} // Disable the button while loading
                                                        >
                                                            {loading ? <CircularProgress color="success" size="sm" /> : "Delete"}
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })
                }
            </CardContent>
        </Card>
    );
};

export default LeftPanel;

const CategoryOptions = ({ name, childCategories }: { name: string, childCategories: any[] }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>{name}</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {
                    childCategories.length > 0 ? (
                        childCategories.map((childCategory, index) => (
                            <DropdownMenuItem key={index}>{childCategory.name}</DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem>No subcategories</DropdownMenuItem>
                    )
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// AddSubCategoryForm Component
const AddSubCategoryForm = ({ parentCategoryId, onSuccess }: { parentCategoryId: string, onSuccess: () => void }) => {
    const [subCatName, setSubCatName] = useState('');
    const [loading, setLoading] = useState(false);

    const onAddSubCategory = async () => {
        setLoading(true);
        try {
            const uri = process.env.NEXT_PUBLIC_API_URL!;
            await fetch(`${uri}/api/products/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: subCatName,
                    parentCategories: [parentCategoryId], // Reference to parent category ID
                }),
            });
            setLoading(false);
            toast({
                title: "Success",
                description: "Subcategory created successfully.",
                variant: "default"
            });
            onSuccess(); // Trigger success callback
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
        <div className="flex flex-col gap-3 text-black">
            <Input
                placeholder="Enter Subcategory Name"
                value={subCatName}
                onChange={(e) => setSubCatName(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={onAddSubCategory} disabled={!subCatName || loading}>
                    {loading ? <CircularProgress color="primary" size="sm" /> : "Add"}
                </Button>
            </AlertDialogFooter>
        </div>
    );
};
