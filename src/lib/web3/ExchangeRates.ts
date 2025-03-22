interface PriceResponse {
  "usd-coin": {
    eur: number;
    ars: number;
  };
}

interface PriceData {
  eur: number;
  ars: number;
}

// Valores por defecto en caso de fallo
const DEFAULT_PRICES: PriceData = {
  eur: 0.92,
  ars: 1000,
};

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 segundo

export class ExchangeRatesService {
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async fetchPricesWithRetry(): Promise<PriceData> {
    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Attempting to fetch prices (attempt ${attempt + 1})`);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=eur,ars"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PriceResponse = await response.json();
        return {
          eur: data["usd-coin"].eur,
          ars: data["usd-coin"].ars,
        };
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);

        if (attempt === RETRY_ATTEMPTS - 1) {
          console.warn("All retry attempts failed, using default values");
          return DEFAULT_PRICES;
        }

        await this.delay(RETRY_DELAY * (attempt + 1));
      }
    }
    return DEFAULT_PRICES;
  }
}
