import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { invoiceId, amount, orderInfo } = body;

        // Validate required parameters
        if (!invoiceId || !amount || !orderInfo) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Get the API URL from environment variables
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3301';
        
        // Forward request to the backend API
        const response = await fetch(`${apiUrl}/payment/create-vnpay-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                invoiceId,
                amount,
                orderInfo,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, message: errorData.message || "Failed to create payment URL" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error creating VNPay URL:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
} 