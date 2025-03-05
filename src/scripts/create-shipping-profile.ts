import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function createShippingProfile({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  try {
    logger.info("Checking existing shipping profiles...");
    // Get all types of shipping profiles
    const existingProfiles = await fulfillmentModuleService.listShippingProfiles({});

    if (existingProfiles.length === 0) {
      logger.info("Creating required shipping profiles...");
      const profiles = await fulfillmentModuleService.createShippingProfiles([
        {
          name: "Default Shipping Profile",
          type: "default",
        },
        {
          name: "Gift Card Profile",
          type: "gift_card",
        }
      ]);
      logger.info(`Created shipping profiles: ${JSON.stringify(profiles, null, 2)}`);
    } else {
      logger.info("Existing shipping profiles:");
      existingProfiles.forEach(profile => {
        logger.info(`- ${profile.name} (ID: ${profile.id}, Type: ${profile.type})`);
      });
    }
  } catch (error) {
      logger.error("Error creating shipping profile:", error);
      throw new Error(`Failed to create shipping profile: ${error.message}`);
  }
}
