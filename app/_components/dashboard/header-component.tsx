import React,{useEffect, useState} from 'react'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import Cookies from "js-cookie"


const HeaderComponent = () => {
    const [admin, setAdmin] = useState<string | null>(null);
    useEffect(() => {
        const adminName = Cookies.get("name");
        if (adminName) {
          setAdmin(adminName);
        }
      }, []);
    return (
    <Card>
    <CardHeader>
      <CardTitle>
        {admin && `Welcome ${admin}`}
      </CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
  </Card>
  )
}

export default HeaderComponent