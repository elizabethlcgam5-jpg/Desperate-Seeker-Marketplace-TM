import { getUncachableStripeClient } from "./stripeClient";

/**
 * Creates the three Desperately Seeking seller subscription products in Stripe.
 * Each product has a `tier` metadata field used by the backend to map subscriptions
 * back to our subscriptionTier column.
 *
 * This script is idempotent — it checks for existing products before creating.
 * Run with: pnpm --filter @workspace/scripts tsx src/seed-products.ts
 */

const PLANS = [
  {
    name: "Premium Monthly",
    description: "Respond to buyer requests, full messaging, match alerts. Billed monthly.",
    tier: "seller_basic",
    unitAmount: 199,
    interval: "month" as const,
  },
  {
    name: "Premium Annual",
    description: "Everything in Premium, billed annually. Best value.",
    tier: "seller_annual",
    unitAmount: 2999,
    interval: "year" as const,
  },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log("🔍 Checking for existing Desperately Seeking products...\n");

  for (const plan of PLANS) {
    // Check if product already exists by metadata tier
    const existing = await stripe.products.search({
      query: `metadata['tier']:'${plan.tier}' AND active:'true'`,
    });

    if (existing.data.length > 0) {
      const p = existing.data[0];
      console.log(`✓ ${plan.name} already exists (${p.id})`);

      // List its active prices
      const prices = await stripe.prices.list({ product: p.id, active: true });
      for (const price of prices.data) {
        console.log(`  └─ Price: ${price.id}  $${(price.unit_amount! / 100).toFixed(2)}`);
      }
      continue;
    }

    // Create the product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { tier: plan.tier },
    });
    console.log(`✅ Created product: ${product.name} (${product.id})`);

    // Create its price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.unitAmount,
      currency: "usd",
      recurring: {
        interval: plan.interval,
        ...(plan.intervalCount ? { interval_count: plan.intervalCount } : {}),
      },
    });
    console.log(
      `  └─ Created price: ${price.id}  $${(price.unit_amount! / 100).toFixed(2)}/${plan.interval}`,
    );
  }

  console.log("\n🎉 Stripe products seeded successfully!");
  console.log("stripe-replit-sync will now backfill these into the stripe.products table.");
}

seedProducts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
