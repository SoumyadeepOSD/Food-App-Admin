/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        <Card className="h-[100%] w-[40%] overflow-y-scroll">
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
                                <div key={index} className="flex flex-col items-start gap-5 my-5 bg-gray-100 h-full p-3 rounded-md">
                                    <div className="w-full flex flex-row items-start justify-between">
                                        <CategoryOptions
                                            name={category.name}
                                            childCategories={childCategories}
                                            RenameCategoryForm={RenameCategoryForm}
                                        />
                                        <div className="flex flex-row gap-2">
                                            {/* AlertDialog for adding a new subcategory or renaming a category */}
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
                                                        <AlertDialogTitle>Edit Category</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Choose an action to perform on <strong>{category.name}</strong>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <Tabs defaultValue="add" className="w-full">
                                                        <TabsList className="w-full flex flex-row items-center justify-between">
                                                            <TabsTrigger
                                                                className="w-[50%] py-2 border-b-2 border-transparent aria-selected:border-blue-500 aria-selected:text-blue-500 rounded-none"
                                                                value="add"
                                                            >
                                                                Add Sub-category
                                                            </TabsTrigger>
                                                            <TabsTrigger
                                                                className="w-[50%] py-2 border-b-2 border-transparent aria-selected:border-blue-500 aria-selected:text-blue-500 rounded-none"
                                                                value="rename"
                                                            >
                                                                Rename Category
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent className="w-full" value="add">
                                                            <AddSubCategoryForm
                                                                parentCategoryId={category._id}
                                                                onSuccess={() => window.location.reload()}
                                                            />
                                                        </TabsContent>
                                                        <TabsContent value="rename">
                                                            <RenameCategoryForm
                                                                categoryId={category._id}
                                                                currentName={category.name}
                                                                onSuccess={() => window.location.reload()}
                                                            />
                                                        </TabsContent>
                                                    </Tabs>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            {/* AlertDialog for deleting a category */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <TrashIcon color="red" height={20} width={20} className="hover:cursor-pointer" />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white text-black">
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

const CategoryOptions = ({ RenameCategoryForm, name, childCategories }: { RenameCategoryForm: any, name: string, childCategories: any[] }) => {
    return (
        <div className="w-full">
            <p className="font-semibold">
                {name}
            </p>
            <div>
                {
                    childCategories.map((childCategory, index) => {
                        return (
                            <div key={index} className="mt-10 bg-slate-200 w-full p-2 rounded-md flex flex-row items-start justify-between">
                                <p>{childCategory.name}</p>
                                <div className="flex flex-row items-center gap-2">
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
                                                <AlertDialogTitle>Edit Category</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Choose an action to perform on <strong>{childCategory.name}</strong>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <RenameCategoryForm
                                                categoryId={childCategory._id}
                                                currentName={childCategory.name}
                                                onSuccess={() => window.location.reload()}
                                            />
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <TrashIcon color='red' height={20} width={20} />
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
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

// RenameCategoryForm Component
const RenameCategoryForm = ({ categoryId, currentName, onSuccess }: { categoryId: string, currentName: string, onSuccess: () => void }) => {
    const [newName, setNewName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    const onRenameCategory = async () => {
        setLoading(true);
        try {
            const uri = process.env.NEXT_PUBLIC_API_URL!;
            await fetch(`${uri}/api/products/category`, {
                method: "PUT", // Assuming a PUT request is used to update
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    categoryId: categoryId,
                    name: newName,
                }),
            });
            setLoading(false);
            toast({
                title: "Success",
                description: "Category renamed successfully.",
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
                placeholder="Enter New Category Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={onRenameCategory} disabled={!newName || loading}>
                    {loading ? <CircularProgress color="primary" size="sm" /> : "Rename"}
                </Button>
            </AlertDialogFooter>
        </div>
    );
};
