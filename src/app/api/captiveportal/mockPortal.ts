import {NextRequest, NextResponse} from "next/server";
import {ClientState, type ClientStatusResponse} from "@/lib/api/dtos";

type AuthTypeMode = "password" | "none";

const AUTH_TYPE_MODE: AuthTypeMode = "password";

const VALID_USERS: Record<string, string> = {
    maker: "secret",
    "ats-demo": "ats-demo123",
};

type Session = {
    user: string;
    authorized: boolean;
    sessionId: string;
    startTime: number;
};

const SESSIONS = new Map<string, Session>();

function makeKey(zoneid: number, ip: string) {
    return `${zoneid}:${ip}`;
}

function fakeMacFromIp(_ip: string): string {
    return "02:00:00:00:00:01";
}

function getIp(req: NextRequest): string {
    const header = req.headers.get("x-forwarded-for");
    if (header) {
        return header.split(",")[0].trim();
    }
    return "127.0.0.1";
}

export function buildStatus(zoneid: number, ip: string): ClientStatusResponse {
    const sess = SESSIONS.get(makeKey(zoneid, ip));

    let isAuthorized = !!(sess && sess.authorized);
    if (AUTH_TYPE_MODE === "none") {
        isAuthorized = true;
    }

    const macAddress = fakeMacFromIp(ip);

    if (isAuthorized) {
        return {
            clientState: ClientState.AUTHORIZED,
            ipAddress: ip,
            macAddress: macAddress,
            userName: sess?.user ?? "anonymous",
            sessionId: sess?.sessionId ?? crypto.randomUUID(),
            startTime: sess?.startTime ?? Date.now() / 1000,
        };
    } else {
        return {
            clientState: ClientState.NOT_AUTHORIZED,
            ipAddress: ip,
            macAddress: macAddress,
            authType: AUTH_TYPE_MODE === "none" ? "none" : "normal",
        };
    }
}

export function handleStatus(req: NextRequest) {
    const zoneid = 0;
    const ip = getIp(req);

    const result = buildStatus(zoneid, ip);
    return NextResponse.json(result);
}

export async function handleLogon(req: NextRequest) {
    const zoneid = 0;
    const ip = getIp(req);

    const contentType = req.headers.get("content-type") || "";
    let user = "";
    let password = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await req.text();
        const params = new URLSearchParams(text);
        user = params.get("user") ?? "";
        password = params.get("password") ?? "";
    } else if (contentType.includes("application/json")) {
        const body = (await req.json().catch(() => ({}))) as any;
        user = body.user ?? "";
        password = body.password ?? "";
    }

    let success: boolean;
    if (AUTH_TYPE_MODE === "none") {
        success = true;
    } else {
        const expected = VALID_USERS[user];
        success = expected !== undefined && expected === password;
    }

    if (success) {
        const sessionId = crypto.randomUUID();
        SESSIONS.set(makeKey(zoneid, ip), {
            user,
            authorized: true,
            sessionId,
            startTime: Date.now(),
        });
    }

    const result = buildStatus(zoneid, ip);
    return NextResponse.json(result);
}

export function handleLogoff(req: NextRequest) {
    const zoneid = 0;
    const ip = getIp(req);

    SESSIONS.delete(makeKey(zoneid, ip));

    const result = buildStatus(zoneid, ip);
    return NextResponse.json(result);
}