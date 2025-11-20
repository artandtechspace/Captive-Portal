import {NextRequest} from "next/server";
import {handleStatus} from "../../mockPortal";

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", {status: 404});
    }

    return handleStatus(req);
}

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", {status: 404});
    }

    return handleStatus(req);
}