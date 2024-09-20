import React from 'react'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PlusCircledIcon } from '@radix-ui/react-icons'
import Link from 'next/link';


const MainComponent = () => {
    const menuOptions = [
        {
            id: 1,
            title: "Create Item",
            navigate: "/create-item"
        },
        {
            id: 2,
            title: "View/Edit Item(s)",
            navigate: "/create-item"
        },
        {
            id: 3,
            title: "Manage Orders",
            navigate: "/create-item"
        },
        {
            id: 4,
            title: "Manage Categories",
            navigate: "/manage-categories"
        },
        {
            id: 5,
            title: "Inventory Management",
            navigate: "/create-item"
        },
        {
            id: 6,
            title: "Manage Discounts & Offers",
            navigate: "/create-item"
        },
        {
            id: 7,
            title: "View Customer Feedback/Reviews",
            navigate: "/create-item"
        },
        {
            id: 8,
            title: "Sales Reports & Analytics",
            navigate: "/create-item"
        },
        {
            id: 9,
            title: "User Management",
            navigate: "/create-item"
        },
        {
            id: 10,
            title: "Settings",
            navigate: "/create-item"
        },
        {
            id: 11,
            title: "Manage Delivery Zones",
            navigate: "/create-item"
        },
        {
            id: 12,
            title: "Notification Management",
            navigate: "/create-item"
        }
    ];

    return (
        <div className="text-black my-3">
            <div className="bg-slate-300 h-full rounded-lg p-3 grid grid-cols-4 gap-3 items-center justify-center">
                {menuOptions.map((item, index) => {
                    return (
                        <Link key={index | item.id} href={item.navigate}>
                        <Card className="hover:bg-slate-100 hover:cursor-pointer">
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex flex-row items-center gap-3">
                                        <p>
                                            {item.title}
                                        </p>
                                        <PlusCircledIcon color='blue' height={20} width={20} />
                                    </div>
                                </CardTitle>
                                <CardDescription>Create/add new items into shop</CardDescription>
                            </CardHeader>
                        </Card>
                        </Link>
                        );
                })}

            </div>
        </div>
    )
}

export default MainComponent