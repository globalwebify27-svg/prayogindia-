// src/lib/numberToWords.ts
// Converts numeric amounts into Indian English currency words (e.g. "Rupees Nine Hundred Fifty Only")

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return "Rupees Zero Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? " " + ones[unit] : "");
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let res = "";
    if (hundred > 0) {
      res += ones[hundred] + " Hundred";
      if (rem > 0) res += " ";
    }
    if (rem > 0) {
      res += convertTwoDigits(rem);
    }
    return res;
  }

  const intPart = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - intPart) * 100);

  // Indian number grouping: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds (10^2)
  const crore = Math.floor(intPart / 10000000);
  const remAfterCrore = intPart % 10000000;
  const lakh = Math.floor(remAfterCrore / 100000);
  const remAfterLakh = remAfterCrore % 100000;
  const thousand = Math.floor(remAfterLakh / 1000);
  const remAfterThousand = remAfterLakh % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(convertThreeDigits(crore) + " Crore");
  if (lakh > 0) parts.push(convertTwoDigits(lakh) + " Lakh");
  if (thousand > 0) parts.push(convertTwoDigits(thousand) + " Thousand");
  if (remAfterThousand > 0) parts.push(convertThreeDigits(remAfterThousand));

  let result = "Rupees " + (parts.length > 0 ? parts.join(" ") : "Zero");
  if (paise > 0) {
    result += " and " + convertTwoDigits(paise) + " Paise";
  }
  result += " Only";

  return result;
}

