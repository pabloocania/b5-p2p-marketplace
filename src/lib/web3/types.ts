export interface TokenBalance {
    name: string;
    eoaBalance: string;
    smartWalletBalance: string;
    address: string
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