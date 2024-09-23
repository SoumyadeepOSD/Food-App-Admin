/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData(); // Extract form data from the request
    const imageFile = formData.get('imageFile'); // Get the image file from formData

    if (!imageFile) {
      return NextResponse.json({
        status: 400,
        message: "No file uploaded",
      });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const cloudinaryFormData = new FormData();

    // Append the image and necessary Cloudinary parameters to the form data
    cloudinaryFormData.append('file', imageFile);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!); // Make sure you set the preset
    cloudinaryFormData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)

    const res = await fetch(URL, {
      method: 'POST',
      body: cloudinaryFormData, // Send the form data to Cloudinary
    });

    const result = await res.json();

    if (res.status === 200 || res.status === 201) {
      return NextResponse.json({
        status: 201,
        message: "Success",
        data: result, // Send the Cloudinary response back to the client
      });
    } else {
      return NextResponse.json({
        status: res.status,
        message: "Failed to upload image",
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
