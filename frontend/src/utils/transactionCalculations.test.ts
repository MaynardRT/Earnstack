import { describe, expect, it } from "vitest";
import {
  calculateEWalletServiceCharge,
  calculateEWalletTotal,
  calculatePrintingTotal,
  getEWalletAmountBracket,
  getEWalletServiceChargeRate,
  normalizePrintingQuantity,
} from "./transactionCalculations";

describe("transactionCalculations", () => {
  it("uses the 1% e-wallet rate below 5001", () => {
    expect(getEWalletServiceChargeRate(5000)).toBe(0.01);
    expect(calculateEWalletServiceCharge(5000)).toBe(50);
    expect(calculateEWalletTotal(5000)).toBe(5050);
  });

  it("uses the 5% e-wallet rate at 5001 and above", () => {
    expect(getEWalletServiceChargeRate(5001)).toBe(0.05);
    expect(calculateEWalletServiceCharge(5001)).toBeCloseTo(250.05);
  });

  it("returns the current amount brackets used by the form", () => {
    expect(getEWalletAmountBracket(500)).toBe("100-500");
    expect(getEWalletAmountBracket(1000)).toBe("501-1000");
    expect(getEWalletAmountBracket(1500)).toBe("1001-2000");
    expect(getEWalletAmountBracket(3500)).toBe("3001-4000");
    expect(getEWalletAmountBracket(5001)).toBe("5000+");
  });

  it("keeps printing totals as unit price times quantity with a minimum quantity of one", () => {
    expect(normalizePrintingQuantity(0)).toBe(1);
    expect(calculatePrintingTotal(2.5, 4)).toBe(10);
    expect(calculatePrintingTotal(2.5, 0)).toBe(2.5);
  });
});
