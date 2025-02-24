import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { getToken } = await auth();
        const token = await getToken();

        return NextResponse.json({ token });
    } catch {
        return NextResponse.json(
            { error: "Failed to get token" },
            { status: 500 }
        );
    }
}
