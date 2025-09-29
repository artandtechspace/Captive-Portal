/**
 * @typedef {"AUTHORIZED" | "NOT_AUTHORIZED" | "UNKNOWN"} ClientState
 *
 * Represents the session state of a client within the captive portal.
 */

/**
 * @typedef {Object} AuthorizedClientStatusResponse
 * @property {"AUTHORIZED"} clientState
 * @property {string} ipAddress
 * @property {string} macAddress
 * @property {string} userName
 * @property {string} sessionId
 * @property {number} startTime
 */

/**
 * @typedef {Object} UnauthorizedClientStatusResponse
 * @property {"NOT_AUTHORIZED"} clientState
 * @property {string} ipAddress
 * @property {string} [macAddress]
 * @property {"normal" | "none"} [authType]
 */

/**
 * @typedef {Object} UnknownClientStatusResponse
 * @property {"UNKNOWN"} clientState
 * @property {string} ipAddress
 */

/**
 * @typedef {AuthorizedClientStatusResponse | UnauthorizedClientStatusResponse | UnknownClientStatusResponse} ClientStatusResponse
 */

/**
 * @typedef {Object} CaptivePortalStatusResponse
 * @property {boolean} captive
 * @property {string} ["user-portal-url"]
 * @property {number} ["seconds-remaining"]
 */

/**
 * @typedef {Object} LogonRequest
 * @property {string} user
 * @property {string} password
 */

/**
 * @typedef {AuthorizedClientStatusResponse | UnauthorizedClientStatusResponse | UnknownClientStatusResponse} LogonResponse
 */

/**
 * @typedef {UnknownClientStatusResponse | AuthorizedClientStatusResponse} LogoffResponse
 */

/**
 * Enumerates the possible client states for re-use by consumers.
 * @type {{AUTHORIZED: "AUTHORIZED", NOT_AUTHORIZED: "NOT_AUTHORIZED", UNKNOWN: "UNKNOWN"}}
 */
export const ClientState = Object.freeze({
  AUTHORIZED: "AUTHORIZED",
  NOT_AUTHORIZED: "NOT_AUTHORIZED",
  UNKNOWN: "UNKNOWN"
});
