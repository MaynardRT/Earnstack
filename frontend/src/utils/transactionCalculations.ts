export const getEWalletAmountBracket = (amount: number): string => {
  if (amount <= 0) return "";

  const normalizedAmount = Math.min(amount, 10000);
  const bandIndex = Math.floor((normalizedAmount - 1) / 500);
  const min = bandIndex * 500 + 1;
  const max = min + 499;

  return `${min}-${max}`;
};

export const calculateEWalletServiceCharge = (amount: number): number => {
  if (amount <= 0) return 0;

  const normalizedAmount = Math.min(amount, 10000);
  return Math.ceil(normalizedAmount / 500) * 5;
};

export const getEWalletServiceChargeRate = (amount: number): number =>
  amount > 0 ? calculateEWalletServiceCharge(amount) / amount : 0;

export const calculateEWalletTotal = (amount: number): number =>
  amount + calculateEWalletServiceCharge(amount);

export const normalizePrintingQuantity = (quantity: number): number =>
  Math.max(1, quantity || 1);

export const calculatePrintingTotal = (
  baseAmount: number,
  quantity: number,
): number => (baseAmount || 0) * normalizePrintingQuantity(quantity);
