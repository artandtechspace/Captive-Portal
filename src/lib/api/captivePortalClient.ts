import type {
  CaptivePortalStatusResponse,
  ClientStatusResponse,
  LogoffResponse,
  LogonRequest,
  LogonResponse
} from './dtos';

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

export class CaptivePortalClient {
  private readonly baseUrl: string;


  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getClientStatus(
    zoneId: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<ClientStatusResponse>> {
    return this.request(`/api/captiveportal/access/status/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: options.method ?? 'GET',
      headers: this.withZoneId(zoneId, options.headers)
    });
  }

  async getRfcStatus(
    zoneId: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<CaptivePortalStatusResponse>> {
    return this.request('/api/captiveportal/access/api/', {
      ...options,
      method: options.method ?? 'GET',
      headers: this.withZoneId(zoneId, {
        Accept: 'application/captive+json',
        ...(options.headers ?? {})
      })
    });
  }

  async logon(
    zoneId: string,
    credentials: LogonRequest,
    options: RequestInit = {}
  ): Promise<ApiResponse<LogonResponse>> {
    const body = this.toFormData(credentials);
    return this.request(`/api/captiveportal/access/logon/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: 'POST',
      headers: this.withZoneId(zoneId, {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(options.headers ?? {})
      }),
      body
    });
  }

  async logoff(zoneId: string, options: RequestInit = {}): Promise<ApiResponse<LogoffResponse>> {
    return this.request(`/api/captiveportal/access/logoff/${encodeURIComponent(zoneId)}`, {
      ...options,
      method: options.method ?? 'POST',
      headers: this.withZoneId(zoneId, options.headers)
    });
  }

  async request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const data = await this.parseJson<T>(response);
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  }

  withZoneId(zoneId: string, headers?: HeadersInit): Headers {
    const normalized = this.normalizeHeaders(headers);
    normalized.set('zoneid', zoneId);
    return normalized;
  }

  normalizeHeaders(headers?: HeadersInit): Headers {
    if (!headers) {
      return new Headers();
    }
    if (headers instanceof Headers) {
      return headers;
    }
    return new Headers(headers);
  }

  async parseJson<T>(response: Response): Promise<T | null> {
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('application/captive+json')) {
      const text = await response.text();
      return text ? (JSON.parse(text) as T) : null;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return null;
      }
      throw error;
    }
  }

  toFormData(credentials: LogonRequest): URLSearchParams {
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

