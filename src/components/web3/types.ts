import { ConfigStore } from '../../lib/ConfigStore';

export interface TokenBalance {
    name: string;
    eoaBalance: string;
    smartWalletBalance: string;
    address: string;
    decimals: number;
}

/**
 * Immutable data class that represents a token transfer operation
 */
export class TokenTransfer {
    readonly tokenSymbol: string;
    readonly tokenAddress: string;
    readonly amount: string;
    readonly sourceType: 'eoa' | 'smartWallet';
    readonly destinationType: 'eoa' | 'smartWallet';
    readonly timestamp: number;
    readonly status: 'pending' | 'completed' | 'failed';
    readonly txHash?: string;

    private constructor(params: {
        tokenSymbol: string;
        tokenAddress: string;
        amount: string;
        sourceType: 'eoa' | 'smartWallet';
        destinationType: 'eoa' | 'smartWallet';
        timestamp?: number;
        status?: 'pending' | 'completed' | 'failed';
        txHash?: string;
    }) {
        this.tokenSymbol = params.tokenSymbol;
        this.tokenAddress = params.tokenAddress;
        this.amount = params.amount;
        this.sourceType = params.sourceType;
        this.destinationType = params.destinationType;
        this.timestamp = params.timestamp || Date.now();
        this.status = params.status || 'pending';
        this.txHash = params.txHash;
    }

    static create(params: {
        tokenSymbol: string;
        tokenAddress: string;
        amount: string;
        sourceType: 'eoa' | 'smartWallet';
        destinationType: 'eoa' | 'smartWallet';
        timestamp?: number;
        status?: 'pending' | 'completed' | 'failed';
        txHash?: string;
    }): TokenTransfer {
        return new TokenTransfer(params);
    }

    withStatus(status: 'pending' | 'completed' | 'failed'): TokenTransfer {
        return new TokenTransfer({
            ...this,
            status
        });
    }

    withTxHash(txHash: string): TokenTransfer {
        return new TokenTransfer({
            ...this,
            txHash
        });
    }
}

export interface TokenBalanceBlockchain {
    blockchain: string;
    balances: TokenBalance[]
}

export interface BlockchainAddress {
    blockchain: string;
    address: string;
}

export interface Stablecoin {
    addresses: BlockchainAddress[];
    name: string;
    escrowAddress: string;
    decimals: number;
}

export interface StablecoinConfig {
    supportedStablecoins: Stablecoin[];
}

export interface Log {
    transactionIndex: string;
    blockNumber: string;
    transactionHash: string;
    address: string;
    topics: string[];
    data: string;
    logIndex: string;
    blockHash: string;
}

export interface Receipt {
    to: string;
    from: string;
    contractAddress: string | null;
    transactionIndex: string;
    gasUsed: string;
    logsBloom: string;
    blockHash: string;
    transactionHash: string;
    logs: Log[];
    blockNumber: string;
    confirmations: string;
    cumulativeGasUsed: string;
    status: string;
    type: string;
    byzantium: boolean;
}

export interface OPSReceipt {
    userOpHash: string;
    sender: string;
    nonce: string;
    actualGasCost: string;
    actualGasUsed: string;
    success: boolean;
    logs: Log[];
    receipt: Receipt;
}
