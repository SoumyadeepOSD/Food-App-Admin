/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import LeftPanel from '../_components/manage-categories/left-panel';
import RightPanel from '../_components/manage-categories/right-panel';

const CreateItem = () => {
    const [categories, setCategories] = useState<any[]>([]);

    const getCategories = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL!;
            const response = await fetch(`${url}/api/products/category`,{
                method: "GET",
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Get categories on component mount
    useEffect(() => {
        getCategories();
    }, []);

    // Function to get child categories based on parent ID
    const getChildCategories = (parentId: string) => {
        return categories.filter((category) => 
            category.parentCategories.includes(parentId)
        );
    };

    return (
        <div className="bg-slate-300 h-screen rounded-lg p-3 flex flex-row gap-3 items-center justify-center w-full">
            <LeftPanel 
                categories={categories} 
                getChildCategories={getChildCategories} 
            />
            <RightPanel
                categories={categories}
                getChildCategories={getChildCategories}
            />
        </div>
    );
};

export default CreateItem;

