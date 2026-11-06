import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";
import { DEFAULT_COMPANY_BANK_DETAILS } from "@/data/bankDetails";

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
