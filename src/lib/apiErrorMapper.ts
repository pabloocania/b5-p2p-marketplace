import { ValidationError } from "b5-api-client";

/**
 * Maps a ValidationError code to its i18n translation key.
 * @param error - The ValidationError code from the API
 * @returns The translation key for the error message
 */
export function getApiErrorKey(error: ValidationError): string {
    return `api_errors.${error}`;
}

/**
 * Gets the translation key for an API error, with fallback for unknown errors.
 * @param error - The ValidationError code or undefined
 * @returns The translation key
 */
export function getApiErrorKeyOrDefault(error?: ValidationError): string {
    if (error) {
        return getApiErrorKey(error);
    }
    return "api_errors.UNKNOWN";
}

