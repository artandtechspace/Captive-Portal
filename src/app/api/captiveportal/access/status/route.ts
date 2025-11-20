import {NextRequest} from "next/server";
import {handleStatus} from "../../mockPortal";

export async function POST(req: NextRequest) {
    // Mock NUR im Development aktiv
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not found", {status: 404});
    }

    return handleStatus(req);
}