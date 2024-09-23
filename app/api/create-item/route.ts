/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
   const {name, description, price, categories, brand, countInStock, image}:any = request.body;
    if (!name || !description || !price || !categories || !brand || !countInStock || !image) {
      return NextResponse.json({
        status: 400,
        message: "Some fields are missing",
      });
    }

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
        description, 
        price, 
        categories, 
        brand, 
        countInStock, 
        image
      }), // Send the form data to Cloudinary
    });

    const result = await res.json();

    if (res.status === 200 || res.status === 201) {
      return NextResponse.json({
        status: 201,
        message: "Success",
        data: result, 
      });
    } else {
      return NextResponse.json({
        status: res.status,
        message: "Failed to create item",
        error: result.error || 'Unknown error',
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: "Error",
      error: error.message,
    });
  }
}
