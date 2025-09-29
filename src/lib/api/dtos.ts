/**
 * Stellt den Sitzungsstatus eines Clients innerhalb des Captive Portals dar.
 */
export type ClientStateValue = "AUTHORIZED" | "NOT_AUTHORIZED" | "UNKNOWN";

export interface AuthorizedClientStatusResponse {
    clientState: "AUTHORIZED";
    ipAddress: string;
    macAddress: string;
    userName: string;
    sessionId: string;
    startTime: number;
}

export interface UnauthorizedClientStatusResponse {
    clientState: "NOT_AUTHORIZED";
    ipAddress: string;
    macAddress?: string;
    authType?: "normal" | "none";
}

export interface UnknownClientStatusResponse {
    clientState: "UNKNOWN";
    ipAddress: string;
}

/**
 * Eine diskriminierte Union, die auf dem `clientState`-Feld basiert.
 */
export type ClientStatusResponse =
    | AuthorizedClientStatusResponse
    | UnauthorizedClientStatusResponse
    | UnknownClientStatusResponse;

export interface CaptivePortalStatusResponse {
    captive: boolean;
    "user-portal-url"?: string;
    "seconds-remaining"?: number;
}

export interface LogonRequest {
    user: string;
    password?: string;
}

export type LogonResponse =
    | AuthorizedClientStatusResponse
    | UnauthorizedClientStatusResponse
    | UnknownClientStatusResponse;

export type LogoffResponse =
    | UnknownClientStatusResponse
    | AuthorizedClientStatusResponse;

/**
 * Enumert die möglichen Client-Status zur Wiederverwendung durch Konsumenten.
 */
export const ClientState = {
    AUTHORIZED: "AUTHORIZED",
    NOT_AUTHORIZED: "NOT_AUTHORIZED",
    UNKNOWN: "UNKNOWN",
} as const;