import type { HttpClientRequest, HttpClientResponse } from "./http.types";

export class HttpClient {
    constructor(private baseUrl: string, private defaultHeaders: HeadersInit = {}) {}

    private async request<T>(request: HttpClientRequest): Promise<HttpClientResponse<T>> {
        let { url, method, body, headers } = request;

        headers = { ...this.defaultHeaders, ...headers };

        const response = await fetch(`${this.baseUrl}${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                message: responseData
            }
        }

        return {
            ok: true,
            data: responseData,
            status: response.status,
        };
    }

    get<T>(url: string, headers?: HeadersInit): Promise<HttpClientResponse<T>> {
        return this.request<T>({ url, method: 'GET', headers });
    }

    post<T>(url: string, body: any, headers?: HeadersInit): Promise<HttpClientResponse<T>> {
        return this.request<T>({ url, method: 'POST', body, headers });
    }
}
