interface PriceResponse {
  [key: string]: { // Use index signature for dynamic token IDs
    [key: string]: number; // Use index signature for dynamic fiat codes
  };
}

// Keep the old interface for the specific USDC fetch if needed
interface UsdcPriceData {
  eur: number;
  ars: number;
}

const DEFAULT_USDC_PRICES: UsdcPriceData = {
  eur: 0.92,
  ars: 1000,
};

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Mapping from token codes to CoinGecko IDs
const COINGECKO_ID_MAP: { [key: string]: string } = {
  usdt: "tether",
  usdc: "usd-coin",
  eth: "ethereum",
  // Add more tokens as needed
};

export class ExchangeRatesService {
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getCoinGeckoId(tokenCode: string): string | null {
    return COINGECKO_ID_MAP[tokenCode.toLowerCase()] || null;
  }

  /**
   * Fetches the exchange rate for a specific token against a fiat currency with retry logic.
   * @param tokenCode The code of the token (e.g., 'usdt', 'usdc').
   * @param fiatCode The code of the fiat currency (e.g., 'ars', 'eur').
   * @returns The exchange rate as a number, or null if not found or after retries.
   * @throws Error for unsupported tokens or critical API failures.
   */
  static async fetchRateWithRetry(
    tokenCode: string,
    fiatCode: string
  ): Promise<number | null> {
    const coinGeckoId = this.getCoinGeckoId(tokenCode);
    if (!coinGeckoId) {
      throw new Error(`Unsupported token: ${tokenCode}`); // Throw specific error
    }

    const fiatCodeLower = fiatCode.toLowerCase();

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(
          `Attempting to fetch rate for ${tokenCode}/${fiatCode} (attempt ${attempt + 1})`
        );

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=${fiatCodeLower}`
        );

        if (!response.ok) {
          // Throw error on bad response status after checking attempts
          if (attempt === RETRY_ATTEMPTS - 1) {
            throw new Error(
              `CoinGecko API error: ${response.status} ${response.statusText}`
            );
          }
          // Continue to retry if not the last attempt
          throw new Error(`HTTP error! status: ${response.status}`); // Temporary error for retry
        }

        const data: PriceResponse = await response.json();

        if (!data[coinGeckoId] || data[coinGeckoId][fiatCodeLower] === undefined) {
          // If rate is missing, treat as potentially temporary, retry
          if (attempt === RETRY_ATTEMPTS - 1) {
            console.warn(`No rate available for ${tokenCode} in ${fiatCode} after retries.`);
            return null; // Return null after all retries if rate not found
          }
          throw new Error(`Rate data missing for ${tokenCode} in ${fiatCode}`); // Temporary error for retry
        }

        return data[coinGeckoId][fiatCodeLower]; // Return rate on success

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);

        if (attempt === RETRY_ATTEMPTS - 1) {
          // If it's the last attempt, re-throw the original error or a generic one
          // Check if it's the specific errors we want to propagate
          if (error instanceof Error && error.message.startsWith('CoinGecko API error')) {
            throw error; // Re-throw the specific API error
          }
          console.warn("All retry attempts failed for fetching rate.");
          throw new Error("Failed to fetch rate after multiple attempts"); // Throw generic error after retries
        }

        await this.delay(RETRY_DELAY * (attempt + 1));
      }
    }
    // Should theoretically not be reached due to throws, but as fallback:
    console.warn("Exited retry loop unexpectedly.");
    return null;
  }
}
