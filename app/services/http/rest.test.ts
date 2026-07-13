import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { restClient } from "./rest";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockFetch.mockReset();
});

function okResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: true,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function errorResponse(body: unknown, status = 400, statusText = "Bad Request") {
  return Promise.resolve({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("restClient.get", () => {
  it("calls fetch with GET method and correct URL", async () => {
    mockFetch.mockReturnValue(okResponse({ data: [] }));
    await restClient.get("/products");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("appends defined query params to the URL", async () => {
    mockFetch.mockReturnValue(okResponse({ data: [] }));
    await restClient.get("/products", { params: { page: 2, type: "electronics" } });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("type=electronics");
  });

  it("omits undefined and null params from the URL", async () => {
    mockFetch.mockReturnValue(okResponse({ data: [] }));
    await restClient.get("/products", { params: { page: undefined, type: null } });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("page");
    expect(calledUrl).not.toContain("type");
  });

  it("returns parsed JSON on success", async () => {
    const payload = { data: [{ id: "P-001" }] };
    mockFetch.mockReturnValue(okResponse(payload));
    const result = await restClient.get("/products");
    expect(result).toEqual(payload);
  });

  it("throws an error with status when response is not ok", async () => {
    mockFetch.mockReturnValue(
      errorResponse({ error: { message: "Not Found" } }, 404, "Not Found"),
    );
    await expect(restClient.get("/products/P-999")).rejects.toMatchObject({
      message: "Not Found",
      status: 404,
    });
  });

  it("falls back to statusText when error body has no message", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("no json")),
      } as unknown as Response),
    );
    await expect(restClient.get("/products")).rejects.toMatchObject({
      message: "Internal Server Error",
    });
  });
});

describe("restClient.patch", () => {
  it("calls fetch with PATCH method and serialized body", async () => {
    mockFetch.mockReturnValue(okResponse({ data: { id: "P-001" } }));
    await restClient.patch("/products/P-001", { countryOfOrigin: "US" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/P-001"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ countryOfOrigin: "US" }),
      }),
    );
  });

  it("returns parsed JSON on success", async () => {
    const payload = { data: { id: "P-001", name: "Updated" } };
    mockFetch.mockReturnValue(okResponse(payload));
    const result = await restClient.patch("/products/P-001", { name: "Updated" });
    expect(result).toEqual(payload);
  });

  it("throws on error response", async () => {
    mockFetch.mockReturnValue(
      errorResponse({ error: { message: "Unprocessable" } }, 422),
    );
    await expect(
      restClient.patch("/products/P-001", {}),
    ).rejects.toMatchObject({ status: 422, message: "Unprocessable" });
  });
});

describe("restClient.post", () => {
  it("calls fetch with POST method and serialized body", async () => {
    mockFetch.mockReturnValue(okResponse({ data: { id: "P-099" } }));
    await restClient.post("/products", { name: "New product" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "New product" }),
      }),
    );
  });
});
