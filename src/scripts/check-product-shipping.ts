import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { DataSource } from "typeorm";

export default async function checkProductShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const database = container.resolve("database") as DataSource;

  try {
    logger.info("Checking database for shipping profiles...");
    const profiles = await database.query(
      `SELECT id, name, type, created_at, updated_at 
       FROM shipping_profile`
    );
    logger.info(`Found shipping profiles in database: ${JSON.stringify(profiles, null, 2)}`);

    logger.info("\nChecking products with shipping profiles...");
    const productsWithProfiles = await database.query(
      `SELECT p.id, p.title, sp.id as profile_id, sp.name as profile_name, sp.type as profile_type
       FROM product p
       LEFT JOIN shipping_profile sp ON p.shipping_profile_id = sp.id
       LIMIT 5`
    );
    
    logger.info(`Products with shipping profiles: ${JSON.stringify(productsWithProfiles, null, 2)}`);

  } catch (error) {
    logger.error("Database error:", error);
    throw error;
  }
}
