const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const app = express();

app.use(cors());
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

// 👉 Submit Form → Create Shopify Customer
app.post("/form/submit", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
 res.send(req.body);
  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
      {
  "query": "mutation customerCreate($input: CustomerInput!) { customerCreate(input: $input) { customer { id email firstName lastName } userErrors { field message } } }",
  "variables": {
    "input": {
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "tags": ["Embedded Form new"]
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

    const result = response.data.data.customerCreate;

    if (result.userErrors.length > 0) {
      return res.json({
        success: false,
        errors: result.userErrors
      });
    }

    console.log("✅ Customer Created:", result.customer);

    res.json({
      success: true,
      customer: result.customer
    });

  } catch (error) {
    console.error("❌ Shopify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Something went wrong"
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