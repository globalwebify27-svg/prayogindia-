import { Product } from "@/data/mockData";

// Levenshtein distance algorithm for typo tolerance
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Check if query is typo-tolerant match for target words
export function isTypoTolerantMatch(
  query: string,
  targetText: string,
): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const target = targetText.toLowerCase();

  // 1. Direct substring match (highest priority)
  if (target.includes(q)) return true;

  // 2. Tokenized match (e.g. "rpi 5" matches "Raspberry Pi 5")
  const queryTokens = q.split(/\s+/).filter(Boolean);
  const targetTokens = target.split(/[\s\-_\/]+/).filter(Boolean);

  // Common tech alias map
  const ALIASES: Record<string, string[]> = {
    rpi: ["raspberry", "pi"],
    rasberry: ["raspberry"],
    raspbian: ["raspberry"],
    arduno: ["arduino"],
    arduin: ["arduino"],
    pixhok: ["pixhawk"],
    pixhawk: ["flight", "controller", "uav", "autopilot"],
    jeton: ["jetson"],
    jetson: ["nvidia", "orin", "nano"],
    sensr: ["sensor"],
    senser: ["sensor"],
    batry: ["battery", "lipo"],
    battry: ["battery"],
    motr: ["motor", "bldc"],
    es32: ["esp32"],
    nodemcu: ["esp8266", "esp32"],
    drone: ["quadcopter", "uav", "bldc", "esc", "flight", "propeller"],
  };

  const matchesAllTokens = queryTokens.every((token) => {
    // Check direct substring
    if (target.includes(token)) return true;

    // Check alias
    if (ALIASES[token]?.some((alias) => target.includes(alias))) return true;

    // Check Levenshtein fuzzy distance against target tokens
    return targetTokens.some((tToken) => {
      if (tToken.length < 3 && token.length < 3) return token === tToken;
      const maxDistance = token.length <= 4 ? 1 : token.length <= 7 ? 2 : 3;
      return levenshteinDistance(token, tToken) <= maxDistance;
    });
  });

  return matchesAllTokens;
}

// Filter and rank products with typo tolerance
export function searchProductsFuzzy(
  products: Product[],
  query: string,
): Product[] {
  if (!query.trim()) return products;

  return products.filter((product) => {
    const searchableText = `${product.name} ${product.sku} ${product.category} ${product.description || ""} ${product.brand || ""}`;
    return isTypoTolerantMatch(query, searchableText);
  });
}
