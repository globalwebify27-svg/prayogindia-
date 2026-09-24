import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";

export const DEFAULT_COMPANY_BANK_DETAILS = {
  accountName: "Prayog India Private Limited",
  bankName: "State Bank of India (SBI)",
  accountNumber: "40892301982739",
  ifscCode: "SBIN0000167",
  branchName: "Main Branch, Kutchery Chowk, Ranchi, Jharkhand - 834001",
  accountType: "Current Account",
  upiId: "prayogindia@sbi",
  instructions:
    "Please add your Order Number (e.g. PRG-2026-XXXX) or Proforma Number in the transaction remarks. After transferring funds, submit your 12-digit UTR/Reference number for verification.",
};

/**
 * GET /api/payment/bank-details
 * Returns authoritative company bank account information for NEFT/RTGS wire transfers.
 */
export async function GET() {
  const headers = getSecurityHeaders();

  if (process.env.DATABASE_URL) {
    try {
      // Fetch primary active bank details from database if configured
      const dbBank = await db.companyBankDetail.findFirst({
        where: { isActive: true, isPrimary: true },
      });

      if (dbBank) {
        return NextResponse.json(
          {
            success: true,
            data: {
              accountName: dbBank.accountName,
              bankName: dbBank.bankName,
              accountNumber: dbBank.accountNumber,
              ifscCode: dbBank.ifscCode,
              branchName: dbBank.branchName,
              accountType: dbBank.accountType,
              upiId: dbBank.upiId,
              instructions:
                dbBank.instructions ||
                DEFAULT_COMPANY_BANK_DETAILS.instructions,
            },
          },
          { headers },
        );
      }
    } catch (error) {
      console.warn(
        "[BankDetails API] Falling back to default configuration:",
        error,
      );
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: DEFAULT_COMPANY_BANK_DETAILS,
    },
    { headers },
  );
}
