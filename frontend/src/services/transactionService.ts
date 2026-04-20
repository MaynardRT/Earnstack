import api from "./api";
import {
  Transaction,
  TransactionSummary,
  EWalletTransaction,
  PrintingTransaction,
} from "../types";

export const transactionService = {
  getSummary: async (): Promise<TransactionSummary> => {
    const response = await api.get("/transactions/summary", {
      params: { includeStatusBreakdown: true },
    });
    return response.data;
  },

  getRecentTransactions: async (days: number = 30): Promise<Transaction[]> => {
    const response = await api.get("/transactions/recent", {
      params: { days },
    });
    return response.data;
  },

  getTransactionsByPeriod: async (
    period: "daily" | "weekly" | "monthly",
  ): Promise<Transaction[]> => {
    const response = await api.get("/transactions/by-period", {
      params: { period },
    });
    return response.data;
  },

  createEWalletTransaction: async (
    data: EWalletTransaction,
  ): Promise<Transaction> => {
    const response = await api.post("/transactions/ewallet", data);
    return response.data;
  },

  createPrintingTransaction: async (
    data: PrintingTransaction,
  ): Promise<Transaction> => {
    const response = await api.post("/transactions/printing", data);
    return response.data;
  },

  exportTransactions: async (): Promise<Blob> => {
    const response = await api.get("/settings/export/transactions", {
      responseType: "blob",
    });
    return response.data;
  },
};
