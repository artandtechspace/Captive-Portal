import {NextRequest} from "next/server";
import {handleLogon} from "../../mockPortal";

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", {status: 404});
    }

    return handleLogon(req);
}