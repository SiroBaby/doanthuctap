import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Test API đang hoạt động" });
} 