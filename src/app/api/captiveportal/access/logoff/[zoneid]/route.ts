import { handleLogoff } from "../../../mockPortal";
import {NextRequest} from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ zoneid: string }> }
) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", { status: 404 });
    }

    const { zoneid } = await params;
    return handleLogoff(req, zoneid);
}