import axios from 'axios';
import fs from 'fs';
import csvParser from 'csv-parser';

const MEDUSA_BACKEND_URL = 'http://localhost:9000';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6InVzZXJfMDFKTjcxWllDWkVSV1NXODdGMDFQUDBCMEEiLCJhY3Rvcl90eXBlIjoidXNlciIsImF1dGhfaWRlbnRpdHlfaWQiOiJhdXRoaWRfMDFKTjcxWllINkZBQTQ1VFo0OUo2UVlaSkUiLCJhcHBfbWV0YWRhdGEiOnsidXNlcl9pZCI6InVzZXJfMDFKTjcxWllDWkVSV1NXODdGMDFQUDBCMEEifSwiaWF0IjoxNzQwNzcyNjUwLCJleHAiOjE3NDA4NTkwNTB9.k3gG9bA6lM2O8vkaJkOsAKO5XfI3TUP1CTBQgPceX6E';


const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

interface ProductData {
  title: string;
  subtitle: string;
  description: string;
  handle: string;
  status: 'published'
  shipping_profile_id: string;
  thumbnail: string;
  images: { url: string }[];
  options: {
    title: string;
    values: string[];
  }[];
  variants: {
    title: string;
    sku: string;
    prices: { amount: number; currency_code: string }[];
    options: Record<string, string>;
  }[];
  metadata?: Record<string, any>;
  categories?: { id: string; name: string }[];
  
}

const SHIPPING_PROFILE_ID = 'sp_01JN71TV3TKN9SNBY5KWQJRA6C';

const category_hierarchy: Record<string, { id: string; parent: string | null; parent_name: string | null }> = {
  // Parent Categories
  "Writing Type": {
      "id": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent": null,
      "parent_name": null
  },
  "Refills": {
      "id": "pcat_01JN72Q7KJ614AR9CAFA4A4CA0",
      "parent": null,
      "parent_name": null
  },
  "Range": {
      "id": "pcat_01JN72Q7RZYZ5NB223PRKXQ7W8",
      "parent": null,
      "parent_name": null
  },
  "Models": {
      "id": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent": null,
      "parent_name": null
  },
  "Collections": {
      "id": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent": null,
      "parent_name": null
  },

  // Writing Type Children
  "Fountain pens": {
      "id": "pcat_01JN72Q7D3W1E0JJHSKFZRTX4W",
      "parent": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent_name": "Writing Type"
  },
  "Ballpoint pens": {
      "id": "pcat_01JN72Q7EJFGSSC4JGCJ3DZ7YD",
      "parent": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent_name": "Writing Type"
  },
  "Mechanical pencils": {
      "id": "pcat_01JN72Q7FR6RZFY8PKK4EJ29B2",
      "parent": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent_name": "Writing Type"
  },
  "Rollerball pens": {
      "id": "pcat_01JN72Q7H1C852AKP40SBRM92E",
      "parent": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent_name": "Writing Type"
  },
  "Sets": {
      "id": "pcat_01JN72Q7JD7R83PQVTP1Q5G7J7",
      "parent": "pcat_01JN72Q7BH4RVH6KMRC2TB3AM1",
      "parent_name": "Writing Type"
  },

  "Fountain pen refills": {
      "id": "pcat_01JN6SX18YBXZHM7QF0WS5A9WG",
      "parent": "pcat_01JN6SX181JWH38V553WZRD5GE",
      "parent_name": "Refills"
  },
  "Ball pen refills": {
      "id": "pcat_01JN6SX19Z2S28TZHR5AYDM71R",
      "parent": "pcat_01JN6SX181JWH38V553WZRD5GE",
      "parent_name": "Refills"
  },
  "Pencil refills": {
      "id": "pcat_01JN6SX1B05F2ACEV48RXE201Z",
      "parent": "pcat_01JN6SX181JWH38V553WZRD5GE",
      "parent_name": "Refills"
  },
  "Roller refills": {
      "id": "pcat_01JN6SX1C2AYZ2PAT8GKS913RJ",
      "parent": "pcat_01JN6SX181JWH38V553WZRD5GE",
      "parent_name": "Refills"
  },

  "Office": {
      "id": "pcat_01JN72Q7T0SCY1M05S7YHXHJ79",
      "parent": "pcat_01JN72Q7RZYZ5NB223PRKXQ7W8",
      "parent_name": "Range"
  },
  "Casual": {
      "id": "pcat_01JN72Q7V4QVWADPCP6AM1E8RD",
      "parent": "pcat_01JN72Q7RZYZ5NB223PRKXQ7W8",
      "parent_name": "Range"
  },
  "Premium": {
      "id": "pcat_01JN72Q7WH69C3WY5S6X48R7QJ",
      "parent": "pcat_01JN72Q7RZYZ5NB223PRKXQ7W8",
      "parent_name": "Range"
  },

  "Arc": {
      "id": "pcat_01JN72Q7YM0W8CZE6BTQMECNM4",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Vista": {
      "id": "pcat_01JN72Q7ZWW92QSRRK6PX1YKQN",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Round": {
      "id": "pcat_01JN72Q80ZK3SHNDF7CVYWSFVF",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Beat": {
      "id": "pcat_01JN72Q826D22D0835Q34J4M3B",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Prime": {
      "id": "pcat_01JN72Q83BP8YBM666WGXMYFP9",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Canvas": {
      "id": "pcat_01JN72Q84NVR9TNS7F1SABM94E",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Touch": {
      "id": "pcat_01JN72Q8664GK28SZ651JTVATT",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Inox70": {
      "id": "pcat_01JN72Q87NJ359E2WW3C1N9SKE",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Slim": {
      "id": "pcat_01JN72Q8957GWK2HZ2MF2RAVKB",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Soul": {
      "id": "pcat_01JN72Q8AJNBKYMH5K1BQV1GHR",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Spin": {
      "id": "pcat_01JN72Q8BS2W6MHWY8ESWRRVZA",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Vera": {
      "id": "pcat_01JN72Q8D2W28PA2BDVDMT5M0M",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Wave": {
      "id": "pcat_01JN72Q8DZ4XV0K8N7K8FX07W9",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Rocker": {
      "id": "pcat_01JN72Q8F8YAE0TY688H08DCJ5",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Terra": {
      "id": "pcat_01JN72Q8GB1PJA86GM3NX2Q6QT",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },
  "Curvy": {
      "id": "pcat_01JN72Q8HHVSK5STSR5AC6FEKP",
      "parent": "pcat_01JN72Q7XMFARCCMA5JWTM4MKY",
      "parent_name": "Models"
  },

  // Collections Children
  "Ictíneo": {
      "id": "pcat_01JN72Q8KKXCWBRDXM6DR74XG6",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Arcade": {
      "id": "pcat_01JN72Q8MRFYJMQPDYHMCHRN1H",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Arts": {
      "id": "pcat_01JN72Q8NRJHDPSYNGFSWJ4NF9",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Books": {
      "id": "pcat_01JN72Q8PYZQBPT3DY5WCCN8JK",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Beat is Back": {
      "id": "pcat_01JN72Q8R07RMDRF1W8MA5F13G",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Carbone": {
      "id": "pcat_01JN72Q8S84C1FJ19J03ADSGQQ",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Etnia": {
      "id": "pcat_01JN72Q8T73NRDH2D3YJTMQKBY",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Fantasy": {
      "id": "pcat_01JN72Q8VTVYJERQ33N2HP943G",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "History": {
      "id": "pcat_01JN72Q8XGT1KFFB6TQF6PE9JB",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Inox": {
      "id": "pcat_01JN72Q8YPV4BCVY4Y173JS4XT",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Mava": {
      "id": "pcat_01JN72Q8ZW4TRAAH72KWV2HDAZ",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Royale": {
      "id": "pcat_01JN72Q914YA80PZGA2M5WAJ8G",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Spices": {
      "id": "pcat_01JN72Q92A9YVMPYSPQBJ075X4",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  },
  "Vintage": {
      "id": "pcat_01JN72Q93R906TXQ9P8QQDN2CJ",
      "parent": "pcat_01JN72Q8JGRNN8FXHHA7EK5AJ9",
      "parent_name": "Collections"
  }
};


interface CategoryInfo {
  id: string;
  name: string;
}

const getCategoryInfo = (categoryName: string): CategoryInfo[] => {
  const category = category_hierarchy[categoryName];
  if (!category) return [];

  const result: CategoryInfo[] = [{ id: category.id, name: categoryName }];
  
  if (category.parent) {
    const parentCat = Object.entries(category_hierarchy).find(([_, c]) => c.id === category.parent);
    if (parentCat) {
      result.push({ id: category.parent, name: parentCat[0] });
    }
  }
  
  return result;
};

const processProduct = async (row: any): Promise<ProductData> => {
  // Parse pictures array, handling both JSON string and CSV string formats
  let images: string[] = [];
  try {
    // Try parsing as JSON first
    images = JSON.parse(row.pictures || '[]');
  } catch {
    // If JSON parse fails, treat as CSV string
    images = row.pictures ? row.pictures
      .replace(/[\[\]']/g, '') // Remove brackets and quotes
      .split(',')
      .map((img: string) => img.trim())
      .filter(Boolean) : [];
  }

  // Parse colors and models arrays
  let colors: string[] = [];
  try {
    colors = JSON.parse(row.colors || '[]');
  } catch {
    colors = row.colors ? row.colors
      .replace(/[\[\]']/g, '')
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean) : [];
  }

  let models: string[] = [];
  try {
    models = JSON.parse(row.models || '[]');
  } catch {
    models = row.models ? row.models
      .replace(/[\[\]']/g, '')
      .split(',')
      .map((m: string) => m.trim())
      .filter(Boolean) : [];
  }

  // Set default values if arrays are empty
  if (colors.length === 0) colors = ['Default'];
  if (models.length === 0) models = ['Standard'];

  // Get category IDs for both category and catalogue
  const categories: { id: string, name: string }[] = [];
  if (row.category) {
    const cat = category_hierarchy[row.category];
    if (cat) {
      categories.push({ id: cat.id, name: row.category });
      if (cat.parent) {
        const parentCat = Object.entries(category_hierarchy).find(([_, c]) => c.id === cat.parent);
        if (parentCat) {
          categories.push({ id: cat.parent, name: parentCat[0] });
        }
      }
    }
  }
  if (row.catalogue) {
    const cat = category_hierarchy[row.catalogue];
    if (cat) {
      categories.push({ id: cat.id, name: row.catalogue });
      if (cat.parent) {
        const parentCat = Object.entries(category_hierarchy).find(([_, c]) => c.id === cat.parent);
        if (parentCat) {
          categories.push({ id: cat.parent, name: parentCat[0] });
        }
      }
    }
  }

  // Process product details
  let productDetails = {};
  try {
    productDetails = JSON.parse(row.product_details || '{}');
  } catch (e) {
    // If product_details is not valid JSON, store it as a string
    if (row.product_details) {
      productDetails = { details: row.product_details };
    }
  }

  // Clean up the price - remove € symbol and convert to cents
  const priceStr = (row.price || '').replace('€', '').trim();
  const eurPrice = Number(priceStr) || 0;
  const eurCents = Math.round(eurPrice * 100);
  const audCents = Math.round(eurCents * 1.68);

  // Generate handle from reference and name
  const handle = `${row.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-') // Replace multiple consecutive dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

  const productData: ProductData = {
    title: row.name,
    subtitle: row.short_description || '',
    description: row.description || '',
    handle,
    status: 'published',
    shipping_profile_id: SHIPPING_PROFILE_ID,
    thumbnail: images[0] || '',
    images: images.slice(1).map((url: string) => ({ url })),
    options: [
      {
        title: 'Color',
        values: colors.map(c => c) // Ensure string array
      },
      {
        title: 'Model',
        values: models.map(m => m) // Ensure string array
      }
    ],
    variants: [],
    metadata: {
      ...productDetails,
      reference_id: row.reference
    },
    categories: Array.from(new Set(categories.map(c => c.id)))
      .map(id => ({ id, name: categories.find(c => c.id === id)?.name || '' }))
  };


  // Create variants with proper titles and prices
  for (const color of colors) {
    for (const model of models) {
      const variantTitle = models.length > 1 ? `${color} - ${model}` : color;
      const sku = `${row.reference}-${color}-${model}`
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-');

      productData.variants.push({
        title: variantTitle,
        sku,
        prices: [
          { amount: eurCents, currency_code: 'eur' },
          { amount: audCents, currency_code: 'aud' }
        ],
        options: {
          Color: color,
          Model: model
        } satisfies Record<string, string>
      });
    }
  }

  return productData;
};

const processCSV = async () => {
  const filePath = '/home/yasir/Documents/my-medusa-store/inoxcrom_products.csv';
  const rows: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
      for (const row of rows) {
        try {
          const productData = await processProduct(row);
          // First try to find existing product by handle
          const searchResponse = await axios.get(
            `${MEDUSA_BACKEND_URL}/admin/products?q=${productData.handle}`,
            { headers }
          );

          let response;
          if (searchResponse.data.products && searchResponse.data.products.length > 0) {
            // Update existing product
            const existingProduct = searchResponse.data.products[0];
            response = await axios.post(
              `${MEDUSA_BACKEND_URL}/admin/products/${existingProduct.id}`,
              productData,
              { headers }
            );
            console.log(`✅ Product '${productData.title}' updated successfully.`);
          } else {
            // Create new product if not found
            response = await axios.post(
              `${MEDUSA_BACKEND_URL}/admin/products`,
              productData,
              { headers }
            );
            console.log(`✅ Product '${productData.title}' created successfully.`);
          }
        } catch (error: any) {
          console.error(`❌ Error processing product '${row.name}':`, error.response?.data || error.message);
        }
      }
    });
};

processCSV();

