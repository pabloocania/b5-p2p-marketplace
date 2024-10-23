import { ArkaPaymaster } from "@etherspot/prime-sdk";

export const arka_api_key = 'arka_public_key';
export const arka_url = 'https://arka.etherspot.io';
export const queryString = `?apiKey=${arka_api_key}&chainId=31`;

export const arkaPaymasterInstance = new ArkaPaymaster(31, arka_api_key, arka_url);