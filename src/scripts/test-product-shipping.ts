import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function testProductShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productsService = container.resolve("productsService");
  const shippingProfileService = container.resolve("shippingProfileService");

  try {
    // Get all shipping profiles
    logger.info("Fetching shipping profiles...");
    const profiles = await shippingProfileService.list();
    logger.info("Available shipping profiles:", profiles);

    if (profiles.length === 0) {
      throw new Error("No shipping profiles found");
    }

    // Create a test product with shipping profile
    logger.info("Creating test product...");
    const result = await productsService.create({
      title: "Test Product",
      is_giftcard: false,
      discountable: true,
      status: 'draft',
      options: [{ title: "Size" }],
      variants: [
        {
          title: "Test Variant",
          inventory_quantity: 10,
          manage_inventory: true,
          options: [{ value: "One Size" }],
          prices: [{ amount: 1000, currency_code: "eur" }],
        },
      ],
      profile_id: profiles[0].id,
    });

    logger.info("Created product:", {
      product_id: result.id,
      title: result.title,
      profile_id: result.profile_id,
    });

  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
}
