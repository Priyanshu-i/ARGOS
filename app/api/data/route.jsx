import { NextResponse } from "next/server";
import connectDB from "@/Config/database";
import mongoose from "mongoose";
export const GET = async () => {
    try {
        await connectDB();
        console.log("✅ Connected to MongoDB");
    }catch (error) {
        console.error("❌ Error fetching ImportCheck data:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
};