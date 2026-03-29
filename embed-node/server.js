const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: "*", // allow all (for testing)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json()); 

// Serve embed.js
app.use(express.static(path.join(__dirname, "public")));

// Dummy form config (you can later move to DB)
const forms = {
  register123: {
    formId: "register123",
    fields: [
      { type: "text", label: "First Name", name: "firstName" },
      { type: "text", label: "Last Name", name: "lastName" },
      { type: "email", label: "Email", name: "email" },
      { type: "password", label: "Password", name: "password" }
    ]
  }
};

// 👉 Get Form
app.get("/form/:id", (req, res) => {
  const form = forms[req.params.id];
  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }
  res.json(form);
});

// // 👉 Submit Form → Create Shopify Customer
// app.post("/form/submit", async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;
//  res.send(req.body);
//   try {
//     const response = await axios.post(
//       `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
//       {
//   "query": "mutation customerCreate($input: CustomerInput!) { customerCreate(input: $input) { customer { id email firstName lastName } userErrors { field message } } }",
//   "variables": {
//     "input": {
//       "firstName": firstName,
//       "lastName": lastName,
//       "email": email,
//       "tags": ["Embedded Form new"]
//     }
//   }
// },
//       {
//         headers: {
//           "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     const result = response.data.data.customerCreate;

//     if (result.userErrors.length > 0) {
//       return res.json({
//         success: false,
//         errors: result.userErrors
//       });
//     }

//     console.log("✅ Customer Created:", result.customer);

//     res.json({
//       success: true,
//       customer: result.customer
//     });

//   } catch (error) {
//     console.error("❌ Shopify Error:", error.response?.data || error.message);

//     res.status(500).json({
//       success: false,
//       error: "Something went wrong"
//     });
//   }
// });





// const axios = require("axios");

app.post("/form/submit", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address1,
    address2,
    city,
    postal,
    business,
    notes,
    marketing,
    type,
    instagram,
    website,
    gst
  } = req.body; 

  try {
    const SHOP_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`;

    // 🟢 STEP 1: Create Customer
    const customerResponse = await axios.post(
      SHOP_URL,
      {
        query: `
          mutation customerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
                email
                firstName
                lastName
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            firstName,
            lastName,
            email,
            phone,
            note: notes,
            tags: [
              "Embedded Form new",
              type || "",
              gst === "yes" ? "GST" : "No GST"
            ],
            emailMarketingConsent: marketing
              ? {
                  marketingState: "SUBSCRIBED",
                  marketingOptInLevel: "SINGLE_OPT_IN"
                }
              : undefined
          }
        }
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const customerResult =
      customerResponse.data.data.customerCreate;

    if (customerResult.userErrors.length > 0) {
      return res.json({
        success: false,
        errors: customerResult.userErrors
      });
    }

    const customerId = customerResult.customer.id; 

    // 🟢 STEP 2: Create Address
    let addressResult = null;
console.log("customerId", customerId); 

// res.json({
//       success: true,
//       customer: customerResult.customer,
//       address: addressResult?.customerAddress || null
//     });
 
    if (address1 || city) {
      const addressResponse = await axios.post(
        SHOP_URL,
        {
          query: `
  mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!, $setAsDefault: Boolean) {
    customerAddressCreate(customerId: $customerId, address: $address, setAsDefault: $setAsDefault) {
      address {
        id
        address1
        city
        zip
      }
      userErrors {
        field
        message
      }
    }
  }
`,
          variables: {
            customerId: customerId,
            address: {
              firstName,
              lastName,
              company: business,
              address1,
              address2,
              city,
              countryCode: "IN",
              zip: postal,
              phone
            }
          }
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );
console.log(addressResponse);  
      // addressResult =
      //   addressResponse.data.data.customerAddressCreate;

      // if (addressResult.userErrors.length > 0) {
      //   console.error("⚠️ Address Errors:", addressResult.userErrors);
      // }

      const addressData = addressResponse.data?.data?.customerAddressCreate;

if (!addressData) {
  console.error("❌ GraphQL Error:", addressResponse.data);
  return res.status(500).json({
    success: false,
    error: "Address creation failed"
  });
}

if (addressData.userErrors.length > 0) {
  console.error("⚠️ Address Errors:", addressData.userErrors);
}

// ✅ FIX HERE
addressResult = addressData.address; 
    }
// console.log(addressResult);   
    // ✅ FINAL RESPONSE 
    res.json({
      success: true,
      customer: customerResult.customer,
      address: addressResult?.customerAddress || null
    });

  } catch (error) {
    console.error("❌ Shopify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Something went wrong"
    });
  }
});

app.get("/shopify/customers", async (req, res) => { 
  try {
    const response = await require("axios").post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
      {
        query: `
          query CustomerList {
            customers(first: 50) {
              nodes {
                id
                firstName
                lastName
                defaultEmailAddress {
                  emailAddress
                  marketingState
                }
                defaultPhoneNumber {
                  phoneNumber
                  marketingState
                  marketingCollectedFrom
                }
                createdAt
                updatedAt
                numberOfOrders
                state
                amountSpent {
                  amount
                  currencyCode
                }
                verifiedEmail
                taxExempt
                tags
                addresses {
                  id
                  firstName
                  lastName
                  address1
                  city
                  province
                  country
                  zip
                  phone
                  name
                  provinceCode
                  countryCodeV2
                }
                defaultAddress {
                  id
                  address1
                  city
                  province
                  country
                  zip
                  phone
                  provinceCode
                  countryCodeV2
                }
              }
            }
          }
        `
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("🟢 Customers Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("❌ Shopify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});



app.get("/shopify/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 Convert to Shopify GID
    const customerGID = `gid://shopify/Customer/${id}`;

    const response = await require("axios").post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
      {
        query: `
          query getCustomer($id: ID!) {
            customer(id: $id) {
              id
              firstName
              lastName
              defaultEmailAddress {
                emailAddress
                marketingState
              }
              defaultPhoneNumber {
                phoneNumber
                marketingState
                marketingCollectedFrom
              }
              createdAt
              updatedAt
              numberOfOrders
              state
              amountSpent {
                amount
                currencyCode
              }
              verifiedEmail
              taxExempt
              tags
              addresses {
                id
                firstName
                lastName
                address1
                city
                province
                country
                zip
                phone
                name
                provinceCode
                countryCodeV2
              }
              defaultAddress {
                id
                address1
                city
                province
                country
                zip
                phone
                provinceCode
                countryCodeV2
              }
            }
          }
        `,
        variables: {
          id: customerGID
        }
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const customer = response.data?.data?.customer;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error("❌ Shopify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

app.get("/shopify/products", async (req, res) => {
  try {
    const response = await require("axios").post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
      {
        query: `
          query {
            products(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        `
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("🟢 Products Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("❌ Shopify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});