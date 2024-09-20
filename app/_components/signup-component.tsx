/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"

const SignupComponent = () => {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [mobileNumber, setMobileNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const handleSignup = async () => {
        setLoading(true);
        if (!mobileNumber || !fullName || !email || !password) {
            toast({
                title: "Error",
                description: "All fields are required",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mobileNumber,
                    fullName,
                    email,
                    password,
                }),
            });
    
            // Parse the response as JSON
            const responseData = await res.json();
    
            if (res.ok) { // Check if the response status is OK (200-299)
                toast({
                    title: "Success",
                    description: "Account created successfully",
                    variant: "default",
                });
                console.log("data", responseData);
                if (responseData.token) {
                    window.localStorage.setItem("token", responseData.token); // Store token from the response
                    Cookies.set("token", responseData.token, { expires: 1 / 1440 }); // 1 minute
                    router.push("/dashboard");
                } else {
                    toast({
                        title: "Error",
                        description: "Token not found in response",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Error",
                    description: responseData.message || "Failed to create account",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <p className="text-center text-blue-500">Loading...</p>;

    return (
        <Card>
            <Toaster />
            <CardHeader>
                <CardTitle>Sign-Up</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Label>
                        Mobile Number
                    </Label>
                    <Input
                        onChange={(e) => setMobileNumber(e.target.value)}
                    />
                </div>
                <div>
                    <Label>
                        FullName
                    </Label>
                    <Input
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                <div>
                    <Label>
                        Email
                    </Label>
                    <Input
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <Label>
                        Password
                    </Label>
                    <Input
                        type="password" // Ensure password input is hidden
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button color="success" onClick={handleSignup}>
                    Signup
                </Button>
            </CardFooter>
        </Card>
    );
}

export default SignupComponent;
