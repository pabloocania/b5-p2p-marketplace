import { OrderStatus, OrderType, PaymentMethod } from "b5-api-client";

// Define structure for fiat amount ranges
export interface FiatAmountRange {
    label: string;
    min: string | undefined;
    max: string | undefined;
}

// Define filter group types
export enum FilterGroupType {
    SEARCH = "SEARCH",
    ORDER_TYPE = "ORDER_TYPE",
    STATUS = "STATUS",
    BLOCKCHAIN = "BLOCKCHAIN",
    TOKEN_CODE = "TOKEN_CODE",
    PAYMENT_METHODS = "PAYMENT_METHODS",
    FIAT_AMOUNT_RANGE = "FIAT_AMOUNT_RANGE",
    DATE_RANGE = "DATE_RANGE",
}

// Define specific options type for FiatAmountRange
export interface FiatAmountRangeOptions {
    fiatCodes?: string[];
    ranges?: FiatAmountRange[];
}

// Define filter group configuration
export interface FilterGroupConfig {
    type: FilterGroupType;
    title?: string;
    // Use conditional types or a union for options
    options?: FilterGroupType extends FilterGroupType.FIAT_AMOUNT_RANGE
    ? FiatAmountRangeOptions
    : any[];
    customComponent?: React.ReactNode;
}

export interface FilterState {
    orderType: OrderType[];
    status: OrderStatus[];
    blockchain: string[];
    tokenCode: string[];
    paymentMethods: PaymentMethod[];
    fiatCode: string[];
    fiatAmountRange: {
        min: string | undefined;
        max: string | undefined;
    };
    dateRange: {
        from: Date | undefined;
        to: Date | undefined;
    };
    search: string;
}

// Define props for the FilterBar component
export interface FilterBarProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filterGroups?: FilterGroupConfig[];
    showSearch?: boolean;
    className?: string;
}

// Reusable Badge Group Component
export interface BadgeGroupProps<T> {
    options: ReadonlyArray<T>; // Use ReadonlyArray
    selectedItems: ReadonlyArray<T>; // Use ReadonlyArray
    onToggle: (item: T) => void;
    renderItemContent: (item: T) => React.ReactNode;
    getKey: (item: T) => string | number;
    leadingNodes?: React.ReactNode[]; // <-- Add new optional prop
    minWidthClass?: string;
    className?: string;
} 