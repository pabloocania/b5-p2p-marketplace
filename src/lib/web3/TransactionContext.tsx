import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Transaction {
  status: "idle" | "sent" | "waiting" | "success" | "error";
  message: string;
  progress: number;
}

interface TransactionContextType {
  transaction: Transaction;
  setTransaction: (transaction: Transaction) => void;
  resetTransaction: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transaction, setTransaction] = useState<Transaction>({
    status: "idle",
    message: "",
    progress: 0,
  });

  useEffect(() => {
    console.log("Progress updated:", transaction);
    // const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    // return () => clearTimeout(timer);
  }, [transaction]);

  const resetTransaction = () => {
    setTransaction({ status: "idle", message: "", progress: 0 });
  };

  return (
    <TransactionContext.Provider
      value={{ transaction, setTransaction, resetTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};
