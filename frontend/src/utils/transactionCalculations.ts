export const getEWalletAmountBracket = (amount: number): string => {
  if (amount <= 500) return "100-500";
  if (amount <= 1000) return "501-1000";
  if (amount <= 2000) return "1001-2000";
  if (amount <= 3000) return "2001-3000";
  if (amount <= 4000) return "3001-4000";
  if (amount <= 5000) return "4001-5000";
  return "5000+";
};

export const getEWalletServiceChargeRate = (amount: number): number =>
  amount >= 5001 ? 0.05 : 0.01;

export const calculateEWalletServiceCharge = (amount: number): number =>
  amount * getEWalletServiceChargeRate(amount);

export const calculateEWalletTotal = (amount: number): number =>
  amount + calculateEWalletServiceCharge(amount);

export const normalizePrintingQuantity = (quantity: number): number =>
  Math.max(1, quantity || 1);

export const calculatePrintingTotal = (
  baseAmount: number,
  quantity: number,
): number => (baseAmount || 0) * normalizePrintingQuantity(quantity);
