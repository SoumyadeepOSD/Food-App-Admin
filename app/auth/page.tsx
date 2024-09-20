/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignupComponent from '@/app/_components/signup-component'
import LoginComponent from '@/app/_components/login-component'
import { useSelector } from 'react-redux';
import LoadingComponent from '../_components/loading-component';

const AuthPage = () => {
    const isLoading = useSelector((state:any) => state.loading.isLoading);
    if(isLoading){
        return <LoadingComponent/>
    }
    return (
        <div className="flex flex-col bg-white items-center justify-center h-screen w-screen">
            <Tabs defaultValue="signup" className="w-[600px]">
                <TabsList>
                    <TabsTrigger value="signup">Sign-Up</TabsTrigger>
                    <TabsTrigger value="login">Sign-In</TabsTrigger>
                </TabsList>
                <TabsContent value="signup">
                    <SignupComponent/>
                </TabsContent>
                <TabsContent value="login">
                    <LoginComponent/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AuthPage