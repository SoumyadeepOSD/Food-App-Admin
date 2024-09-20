/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import Cookies from "js-cookie"
import { useRouter } from 'next/navigation';
import {Button} from "@nextui-org/react";
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '@/redux/loadingSlice';

const LoginComponent = () => {

    const dispatch = useDispatch()
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const handleLogin = async () => {
        dispatch(showLoading());
        if(!email || !password){
            toast({
                title: "Error",
                description: "All fields are required",
                variant: "destructive",
            });
            dispatch(hideLoading());
            return;
        }
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL!;
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            if (res.status === 200 || res.status === 201) {
                toast({
                    title: "Success",
                    description: "Login successful",
                    variant: "default",
                });
                const responseData = await res.json();
                if (responseData.token) {
                    Cookies.set("token", responseData.token, {secure: true, sameSite: "strict", expires: 1});
                    Cookies.set("id", responseData.id,  {secure: true, sameSite: "strict", expires: 1});
                    Cookies.set("name", responseData.fullName,  {secure: true, sameSite: "strict", expires: 1});
                    Cookies.set("email", responseData.email,  {secure: true, sameSite: "strict", expires: 1});
                    router.replace("/dashboard");
                }
                dispatch(hideLoading());
            }else if (res.status===400){
                toast({
                    title: "Error",
                    description: "Fill all the credentials",
                    variant: "destructive",
                });
                dispatch(hideLoading());
            }else if(res.status===401){
                toast({
                    title: "Error",
                    description: "Invalid credentials",
                    variant: "destructive",
                });
                dispatch(hideLoading());
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
            console.log("Error:", error);
            dispatch(hideLoading());
        }
    }
        
    return (
        <Card>
            <Toaster />
            <CardHeader>
                <CardTitle>Sign-In</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Label>
                        Email
                    </Label>
                    <Input
                        onChange={(e) => { setEmail(e.target.value) }}
                    />
                </div>

                <div>
                    <Label>
                        Password
                    </Label>
                    <Input
                        onChange={(e) => { setPassword(e.target.value) }}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button color="success" onClick={handleLogin}>
                    Signin
                </Button>
                {/* <h2 className="text-blue-400">{loadingState}</h2> */}
            </CardFooter>
        </Card>

    )
}

export default LoginComponent