import { Dev3Context } from "./dev3Context";
import fetch from "isomorphic-fetch";

const isServer = typeof window === "undefined";

const baseUrl = isServer ? process.env.API_URL : ``;

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type Dev3FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & Dev3Context["fetcherOptions"];

function serilazeBody(body: unknown) {
  if (!body) {
    return undefined;
  }

  if (body.hasOwnProperty("file")) {
    const fd = new FormData();

    fd.append("file", (body as any).file);

    return fd;
  }

  return JSON.stringify(body);
}

export async function dev3Fetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal,
}: Dev3FetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  try {
    const token = !isServer ? localStorage?.getItem("token") : undefined;
    const isFileUpload = body?.hasOwnProperty("file");

    let newHeaders = {
      ...(!isFileUpload && { "Content-Type": "application/json" }),

      ...headers,
    };

    if (
      !newHeaders.hasOwnProperty("authorization") &&
      !newHeaders.hasOwnProperty("Authorization")
    ) {
      (newHeaders as any)["authorization"] = token ? `Bearer ${token}` : "";
    }

    const response = await fetch(
      `${baseUrl}${resolveUrl(url, queryParams, pathParams)}`,
      {
        signal,
        method: method.toUpperCase(),
        body: serilazeBody(body),
        headers: newHeaders,
      }
    );
    if (!response.ok) {
      let error: ErrorWrapper<TError>;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          status: "unknown" as const,
          payload:
            e instanceof Error
              ? `Unexpected error (${e.message})`
              : "Unexpected error",
        };
      }

      throw error;
    }

    if (response.headers.get("content-type")?.includes("json")) {
      return await response.json();
    } else {
      // if it is not a json response, assume it is a blob and cast it to TData
      return (await response.blob()) as unknown as TData;
    }
  } catch (e) {
    throw {
      status: "unknown" as const,
      payload:
        e instanceof Error ? `Network error (${e.message})` : "Network error",
    };
  }
}

const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {}
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = `?${query}`;
  return url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)]) + query;
};
