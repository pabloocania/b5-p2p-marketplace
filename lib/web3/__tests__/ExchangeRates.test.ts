import { ExchangeRatesService } from "../ExchangeRates";

describe("ExchangeRatesService", () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should fetch prices successfully", async () => {
    const mockResponse = {
      "usd-coin": {
        eur: 0.92,
        ars: 1000,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await ExchangeRatesService.fetchPricesWithRetry();

    expect(result).toEqual({
      eur: 0.92,
      ars: 1000,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should return default values after all retries fail", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await ExchangeRatesService.fetchPricesWithRetry();

    expect(result).toEqual({
      eur: 0.92,
      ars: 1000,
    });
    expect(mockFetch).toHaveBeenCalledTimes(3); // RETRY_ATTEMPTS = 3
  });
});
