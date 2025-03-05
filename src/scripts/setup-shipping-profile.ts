import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createShippingProfilesWorkflow } from "@medusajs/medusa/core-flows";

export default async function setupShippingProfile({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  try {
    // Check existing shipping profiles
    const profiles = await fulfillmentModuleService.listShippingProfiles({});
    logger.info(`Current shipping profiles: ${JSON.stringify(profiles, null, 2)}`);

    if (!profiles || profiles.length === 0) {
      logger.info("Creating default shipping profile...");
      const { result } = await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            }
          ],
        },
      });
      logger.info(`Created shipping profile: ${JSON.stringify(result[0], null, 2)}`);
    } else {
      logger.info("Default shipping profile already exists");
    }
  } catch (error) {
    logger.error("Error setting up shipping profile:", error);
    throw error;
  }
}
