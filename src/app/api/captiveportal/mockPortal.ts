import { NextRequest, NextResponse } from "next/server";
import {
    ClientState,
    type ClientStatusResponse,
    type AuthorizedClientStatusResponse,
    type UnauthorizedClientStatusResponse,
} from "@/lib/api/dtos";

// --- Configuration ---

const MOCK_CONFIG = {
    // Set to 'none' to simulate a "Terms of Use only" login without password
    authType: "normal" as "normal" | "none",
    // Hardcoded credentials for development testing
    validUsers: {
        maker: "secret",
        "ats-demo": "ats-demo123",
    } as Record<string, string>,
};

type Session = {
    user: string;
    authorized: boolean;
    sessionId: string;
    startTime: number;
    mac: string;
};

// In-memory session storage: Map<"zoneId:ip", Session>
const SESSIONS = new Map<string, Session>();

// --- Helper Functions ---

/**
 * Extracts the client IP address from the request headers.
 * Fallback to localhost for development environments.
 */
function getIp(req: NextRequest): string {
    const header = req.headers.get("x-forwarded-for");
    return header ? header.split(",")[0].trim() : "127.0.0.1";
}

/**
 * Creates a unique key for the session storage based on zone and IP.
 */
function makeSessionKey(zoneId: number, ip: string) {
    return `${zoneId}:${ip}`;
}

/**
 * Generates a deterministic fake MAC address based on the IP address.
 * This ensures the MAC stays consistent for the same IP during reloads.
 */
function fakeMacFromIp(ip: string): string {
    // Simple hash-like summation of IP parts
    const sum = ip.split(".").reduce((acc, part) => acc + parseInt(part, 10), 0);
    // Create a hex string padded to 2 chars
    const hex = (sum % 255).toString(16).padStart(2, "0");
    return `02:00:00:00:00:${hex}`;
}

/**
 * Constructs the API response object based on the current session state.
 * Mimics the OPNsense JSON structure using our DTOs.
 */
function buildResponse(zoneId: number, ip: string): ClientStatusResponse {
    const key = makeSessionKey(zoneId, ip);
    const session = SESSIONS.get(key);
    const macAddress = fakeMacFromIp(ip);

    // Case 1: User is authorized (Session exists and is valid)
    if (session && session.authorized) {
        const response: AuthorizedClientStatusResponse = {
            clientState: ClientState.AUTHORIZED,
            ipAddress: ip,
            macAddress: session.mac,
            userName: session.user,
            sessionId: session.sessionId,
            startTime: session.startTime,
        };
        return response;
    }

    // Case 2: User is NOT authorized
    const response: UnauthorizedClientStatusResponse = {
        clientState: ClientState.NOT_AUTHORIZED,
        ipAddress: ip,
        macAddress: macAddress,
        authType: MOCK_CONFIG.authType,
    };
    return response;
}

// --- Route Handlers ---

/**
 * Handles GET requests to check the current status of the client.
 */
export function handleStatus(req: NextRequest, zoneid: string = "0") {
    const zoneidNum = parseInt(zoneid, 10);
    const ip = getIp(req);
    const result = buildResponse(zoneidNum, ip);

    return NextResponse.json(result);
}

/**
 * Handles POST requests to log a user in.
 * Supports both JSON and x-www-form-urlencoded bodies.
 */
export async function handleLogon(req: NextRequest, zoneid: string = "0") {
    const zoneidNum = parseInt(zoneid, 10);
    const ip = getIp(req);

    let user = "";
    let password = "";

    // Parse request body based on Content-Type
    const contentType = req.headers.get("content-type") || "";
    try {
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
    } catch (error) {
        console.error("Failed to parse logon body:", error);
    }

    // Determine authentication success
    let success = false;

    if (MOCK_CONFIG.authType === "none") {
        // For 'none', we accept any login attempt (usually just terms acceptance)
        success = true;
        if (!user) user = "anonymous";
    } else {
        // Validate credentials against the hardcoded list
        const expectedPassword = MOCK_CONFIG.validUsers[user];
        if (expectedPassword && expectedPassword === password) {
            success = true;
        }
    }

    // If successful, create a session
    if (success) {
        const sessionId = crypto.randomUUID();
        SESSIONS.set(makeSessionKey(zoneidNum, ip), {
            user,
            authorized: true,
            sessionId,
            startTime: Date.now() / 1000, // OPNsense usually returns Unix timestamp in seconds
            mac: fakeMacFromIp(ip),
        });
    }

    // Return the status (Authorized or Not Authorized)
    // Note: OPNsense returns 200 OK even for failed logins, just with state NOT_AUTHORIZED
    const result = buildResponse(zoneidNum, ip);
    return NextResponse.json(result);
}

/**
 * Handles POST requests to log a user out.
 */
export function handleLogoff(req: NextRequest, zoneid: string = "0") {
    const zoneidNum = parseInt(zoneid, 10);
    const ip = getIp(req);

    // Remove the session
    SESSIONS.delete(makeSessionKey(zoneidNum, ip));

    const result = buildResponse(zoneidNum, ip);
    return NextResponse.json(result);
}