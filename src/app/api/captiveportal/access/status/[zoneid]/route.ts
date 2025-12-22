import { NextRequest } from "next/server";
import { handleStatus } from "../../../mockPortal";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ zoneid: string }> }
) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", { status: 404 });
    }

    const { zoneid } = await params;
    return handleStatus(req, zoneid);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ zoneid: string }> }
) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", { status: 404 });
    }

    const { zoneid } = await params;
    return handleStatus(req, zoneid);
}