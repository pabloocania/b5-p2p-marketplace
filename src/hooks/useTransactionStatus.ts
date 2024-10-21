'use client'

import { useState, useCallback } from 'react'

type TransactionStatus = 'idle' | 'sent' | 'waiting' | 'success' | 'error'

interface TransactionState {
    status: TransactionStatus
    message: string
    progress: number
}

export function useTransactionStatus() {
    const [transactionState, setTransactionState] = useState<TransactionState>({
        status: 'idle',
        message: '',
        progress: 0,
    })

    const updateTransactionStatus = useCallback((
        status: TransactionStatus,
        message: string,
        progress: number = 0
    ) => {
        setTransactionState({ status, message, progress })
    }, [])

    const resetTransactionStatus = useCallback(() => {
        setTransactionState({
            status: 'idle',
            message: '',
            progress: 0,
        })
    }, [])

    return {
        transactionState,
        updateTransactionStatus,
        resetTransactionStatus,
    }
}