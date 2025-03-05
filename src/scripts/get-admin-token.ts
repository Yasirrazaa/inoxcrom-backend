import axios from "axios";

export default async function (): Promise<void> {
  try {
    const response = await axios.post(
      "http://localhost:9000/auth/user/emailpass",
      {
        email: "admin@medusa-test.com",
        password: "supersecret"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Admin token:", response.data.access_token);
  } catch (error: any) {
    console.error(
      "Error getting admin token:",
      error.response?.data || error.message
    );
    
    if (error.response?.status === 401) {
      console.log("\nTrying to create admin user...");
      try {
        await axios.post(
          "http://localhost:9000/store/customers",
          {
            email: "admin@medusa-test.com",
            password: "supersecret",
            first_name: "Admin",
            last_name: "User"
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        console.log("Admin user created successfully. Please try getting the token again.");
      } catch (createError: any) {
        console.error(
          "Error creating admin user:",
          createError.response?.data || createError.message
        );
      }
    }
  }
}