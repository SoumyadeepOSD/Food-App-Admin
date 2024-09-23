/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Properly parse the request body
    const { publicId }: any = await request.json(); // Fix request body parsing

    // Use the promise-based destroy method to await its result
    const result = await cloudinary.uploader.destroy("food_dashboard/"+publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        message: 'Image successfully deleted from Cloudinary',
        result,
      });
    } else {
      throw new Error(result.result || 'Failed to delete image');
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 400,
      error: error.message,
    });
  }
}
