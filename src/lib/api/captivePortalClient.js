/**
 * @typedef {import('./dtos.js').ClientStatusResponse} ClientStatusResponse
 * @typedef {import('./dtos.js').CaptivePortalStatusResponse} CaptivePortalStatusResponse
 * @typedef {import('./dtos.js').LogonRequest} LogonRequest
 * @typedef {import('./dtos.js').LogonResponse} LogonResponse
 * @typedef {import('./dtos.js').LogoffResponse} LogoffResponse
 */

/**
 * Lightweight wrapper around the captive portal access API.
 */
export class CaptivePortalClient {
  /**
   * @param {string} [baseUrl=""] Base URL for the API. Use an empty string for same-origin requests.
   * @param {typeof fetch} [fetchImpl=fetch] Custom fetch implementation (e.g. for testing).
   */
  constructor(baseUrl = '', fetchImpl = fetch) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
  }

  /**
   * Retrieves the current client status using the GET method.
   *
   * @param {string} zoneId
   * @param {RequestInit} [options]
   * @returns {Promise<{ ok: boolean, status: number, data: ClientStatusResponse | null }>} Parsed response payload.
   */
  async getClientStatus(zoneId, options = {}) {
    return this.#request(`/api/captiveportal/access/status/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: options.method ?? 'GET',
      headers: this.#withZoneId(zoneId, options.headers)
    });
  }

  /**
   * Retrieves the standardized RFC 8908 status.
   *
   * @param {string} zoneId
   * @param {RequestInit} [options]
   * @returns {Promise<{ ok: boolean, status: number, data: CaptivePortalStatusResponse | null }>} Parsed response payload.
   */
  async getRfcStatus(zoneId, options = {}) {
    return this.#request('/api/captiveportal/access/api/', {
      ...options,
      method: options.method ?? 'GET',
      headers: this.#withZoneId(zoneId, {
        Accept: 'application/captive+json',
        ...(options.headers ?? {})
      })
    });
  }

  /**
   * Attempts to authenticate a client using the supplied credentials.
   *
   * @param {string} zoneId
   * @param {LogonRequest} credentials
   * @param {RequestInit} [options]
   * @returns {Promise<{ ok: boolean, status: number, data: LogonResponse | null }>} Parsed response payload.
   */
  async logon(zoneId, credentials, options = {}) {
    const body = this.#toFormData(credentials);
    return this.#request(`/api/captiveportal/access/logon/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: 'POST',
      headers: this.#withZoneId(zoneId, {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(options.headers ?? {})
      }),
      body
    });
  }

  /**
   * Ends the current client session if one exists.
   *
   * @param {string} zoneId
   * @param {RequestInit} [options]
   * @returns {Promise<{ ok: boolean, status: number, data: LogoffResponse | null }>} Parsed response payload.
   */
  async logoff(zoneId, options = {}) {
    return this.#request(`/api/captiveportal/access/logoff/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: options.method ?? 'POST',
      headers: this.#withZoneId(zoneId, options.headers)
    });
  }

  /**
   * @template T
   * @param {string} path
   * @param {RequestInit} init
   * @returns {Promise<{ ok: boolean, status: number, data: T | null }>}
   */
  async #request(path, init) {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    const data = await this.#parseJson(response);
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  }

  /**
   * Ensures the zoneid header is present on each request.
   * @param {string} zoneId
   * @param {HeadersInit} [headers]
   * @returns {Headers}
   */
  #withZoneId(zoneId, headers) {
    const normalized = this.#normalizeHeaders(headers);
    normalized.set('zoneid', zoneId);
    return normalized;
  }

  /**
   * Normalizes the supplied headers to a Headers instance and returns the raw HeadersInit.
   * @param {HeadersInit} [headers]
   * @returns {Headers}
   */
  #normalizeHeaders(headers) {
    if (!headers) {
      return new Headers();
    }

    if (headers instanceof Headers) {
      return headers;
    }

    return new Headers(headers);
  }

  /**
   * Parses the response body as JSON if possible.
   * @param {Response} response
   * @returns {Promise<any | null>}
   */
  async #parseJson(response) {
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('application/captive+json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    try {
      return await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * @param {LogonRequest} credentials
   */
  #toFormData(credentials) {
    const params = new URLSearchParams();
    if (credentials.user) {
      params.set('user', credentials.user);
    }
    if (credentials.password) {
      params.set('password', credentials.password);
    }
    return params;
  }
}

export { ClientState } from './dtos.js';
