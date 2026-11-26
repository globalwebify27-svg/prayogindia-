export const CANCELLATION_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Want to change the product or quantity",
  "No longer need this product",
  "Other",
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];
