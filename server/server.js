import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
// import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __dirname1 = path.resolve();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Check if directory exists, create if not
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const secretKey = process.env.JWT_SECRET;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const razorpayId = process.env.RAZORPAY_ID;
const razorpaySecret = process.env.RAZORPAY_SECRET;
// const whatsappToken = process.env.WHATSAPP_TOKEN;
// const whatsappId = process.env.WHATSAPP_ID;

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

const client = twilio(accountSid, authToken);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Failed to authenticate token" });
    }
    req.id = decoded.id;
    next();
  });
};

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(`The authHearder received is ${authHeader}\n`);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Token is ${token}\n`);
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
      req.id = decoded.id;

      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("role")
        .eq("id", decoded.id)
        .single();

      if (fetchError || !user) {
        throw new Error("Failed to fetch user data");
      }
      console.log(user.role);
      if (user.role == "admin") {
        return next();
      } else {
        return res
          .status(403)
          .json({ error: "You are not authorized as admin" });
      }
    } catch (error) {
      console.error("Error verifying admin token:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

const uploadCloudinary = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    // Clean up the local file after uploading to Cloudinary
    fs.unlinkSync(localFilePath);

    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);

    // Clean up the local file in case of an error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw error; // Pass the error to the calling function
  }
};

app.get("/verify_admin", verifyAdminToken, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin page" });
});

app.post("/user/register", async (req, res) => {
  // Destructure user inputs from request body
  const { name, email, address, phone, password } = req.body;

  // Validate input fields
  if (!name || !email || !address || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
          address,
          phone,
          name,
        },
      ])
      .select("*"); // Select all fields to confirm successful insertion

    // Handle Supabase insertion errors
    if (error) {
      console.error("Error inserting user into users table:", error);
      return res.status(500).json({
        message: "Error registering user",
        error: error.message,
      });
    }

    // Remove password from the response for security
    const safeUser = {
      ...data[0],
      password: undefined, // Explicitly exclude the password
    };
    const token = jwt.sign({ id: data.id }, secretKey, {
      expiresIn: "1h",
    });
    // Respond with success
    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
      token,
    });
  } catch (err) {
    // Catch unexpected errors
    console.error("Unexpected Error:", err);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
});

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !users) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(password, users.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const token = jwt.sign({ id: users.id }, secretKey, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        email: users.email,
        address: users.address,
        phone: users.phone,
        name: users.name,
      },
      token,
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
});

app.get("/user/profile", verifyToken, async (req, res) => {
  try {
    // Use `req.email` from the `verifyToken` middleware
    const { data, error } = await supabase
      .from("users")
      .select("name, email, address, phone")
      .eq("id", req.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res
      .status(500)
      .json({ message: "An error occurred while fetching profile" });
  }
});

app.post("/user/logout", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(400)
        .json({ message: "Authorization token is required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }

    // Optionally, invalidate token if stored on the server
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error during logout:", err.message);
    res.status(500).json({ message: "An error occurred during logout" });
  }
});

app.post("/upload/pic", upload.single("avatar"), async (req, res) => {
  try {
    console.log("File received:", req.file.path); // Debugging log
    const responseUrl = await uploadCloudinary(req.file.path);
    res.json({ picUrl: responseUrl });
  } catch (error) {
    console.error("Error in /upload/pic route:", error.message);
    res.status(500).send("Error uploading image");
  }
});

app.post("/upload", verifyAdminToken, async (req, res) => {
  const {
    name,
    price,
    arrival_date,
    description,
    benefits,
    usage_storage,
    loaded_with,
    disclaimer,
    images,
    quantity,
    category,
  } = req.body;

  if (
    !name ||
    !price ||
    !arrival_date ||
    !description ||
    !Array.isArray(benefits) ||
    !Array.isArray(usage_storage) ||
    !Array.isArray(loaded_with) ||
    !Array.isArray(disclaimer) ||
    !Array.isArray(images) ||
    !quantity ||
    !category
  ) {
    return res
      .status(400)
      .json({ message: "Missing or invalid required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          arrival_date,
          description,
          benefits,
          usage_storage,
          loaded_with,
          disclaimer,
          images,
          quantity,
          category,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        message: "Error uploading product",
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Product uploaded successfully",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err.message,
    });
  }
});

app.post("/create-and-send-payment-link", verifyToken, async (req, res) => {
  const { amount, customerName, customerContact, customerEmail, orderDetails } =
    req.body;
  console.log(customerContact);
  if (
    !amount ||
    !customerName ||
    !customerContact ||
    !customerEmail ||
    !orderDetails ||
    orderDetails.length === 0
  ) {
    console.warn("Request validation failed: missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("id, address, hasContacted")
      .eq("email", customerEmail)
      .single();

    if (userFetchError) {
      console.error("Error fetching user data:", userFetchError.message);
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    const customerId = userData.id;
    const customerAddress = userData.address || "Address not provided";
    // const hasContacted = userData.hasContacted;

    for (const item of orderDetails) {
      const { productName, quantity } = item;

      const { data: productData, error: fetchProductError } = await supabase
        .from("products")
        .select("quantity")
        .eq("name", productName)
        .single();

      if (fetchProductError) {
        console.error(
          `Error fetching product data for ${productName}:`,
          fetchProductError.message
        );
        return res
          .status(500)
          .json({ error: `Failed to fetch product data for ${productName}` });
      }

      if (quantity > productData.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${productName}. Only ${productData.quantity} items available.`,
        });
      }
    }

    const razorpay = new Razorpay({
      key_id: razorpayId,
      key_secret: razorpaySecret,
    });

    const orderItems = orderDetails
      .map(
        (item) => `- **${item.productName}**: ₹${item.price} x ${item.quantity}`
      )
      .join("\n");

    const paymentLinkData = {
      upi_link: false,
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      first_min_partial_amount: 100,
      expire_by: Math.floor(Date.now() / 1000) + 86400,
      reference_id: `TS${Date.now()}${Math.floor(Math.random() * 1000)}`,
      description: `Payment for ${customerName}`,
      customer: {
        contact: customerContact,
        email: customerEmail,
        name: customerName,
      },
      notify: { sms: true, email: true },
      reminder_enable: true,
      notes: {
        customer_id: customerId,
        customerName,
        customerAddress,
        orderItems,
        amount,
      },
      callback_url: "https://lure-skin-studio.onrender.com/cart",
      callback_method: "get",
    };

    let paymentLink;
    try {
      console.log("Creating payment link...");
      paymentLink = await razorpay.paymentLink.create(paymentLinkData);
      console.log("Payment link created:", paymentLink.short_url);
    } catch (error) {
      console.error("Error creating payment link:", error.message);
      return res.status(500).json({ error: "Failed to create payment link" });
    }

    const message = `
    Hello ${customerName},

    Thank you for your order!

    Here are the payment details:
    - Amount: ₹${amount}
    - Description: Payment for ${customerName}

    Order Details:
    ${orderItems}

    Delivery Address:
    ${customerAddress}

    Click the link below to complete your payment:
    ${paymentLink.short_url}

    If you have any questions, feel free to reply to this message.

    Thank you for shopping with us!`;

    try {
      console.log("Sending SMS message to:", customerContact);

      // if (!hasContacted) {
      //   console.log("Customer not contacted before, sending template message...");
      //   await axios.post(
      //     `https://graph.facebook.com/v21.0/${whatsappId}/messages`,
      //     {
      //       messaging_product: "whatsapp",
      //       to: customerContact,
      //       type: "template",
      //       template: { name: "hello_world", language: { code: "en_US" } },
      //     },
      //     { headers: { Authorization: `Bearer ${whatsappToken}`, "Content-Type": "application/json" } }
      //   );

      //   const { error: updateError } = await supabase
      //     .from("users")
      //     .update({ hasContacted: true })
      //     .eq("phone", customerContact);

      //   if (updateError) {
      //     console.error("Error updating contact status:", updateError.message);
      //   } else {
      //     console.log("User marked as contacted.");
      //   }

      //   return res.status(200).json({
      //     message: "Payment link created and template sent via WhatsApp",
      //     paymentLink: paymentLink.short_url,
      //   });
      // } else {
      //   console.log("Customer already contacted, sending detailed payment info...");
      //   await axios.post(
      //     `https://graph.facebook.com/v21.0/${whatsappId}/messages`,
      //     {
      //       messaging_product: "whatsapp",
      //       to: customerContact,
      //       type: "text",
      //       text: { body: message },
      //     },
      //     { headers: { Authorization: `Bearer ${whatsappToken}`, "Content-Type": "application/json" } }
      //   );

      //   console.log("Detailed payment info sent successfully.");
      //   return res.status(200).json({
      //     message: "Payment link created and detailed info sent via WhatsApp",
      //     paymentLink: paymentLink.short_url,
      //   });
      // }
      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: customerContact,
      });

      console.log("SMS sent successfully.");
      return res.status(200).json({
        message: "Payment link created and sent via SMS",
        paymentLink: paymentLink.short_url,
      });
    } catch (error) {
      console.error("Error sending SMS message:", error.message);
      return res.status(500).json({
        error: "Failed to send SMS message, but payment link was created",
        paymentLink: paymentLink.short_url,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/verification", async (req, res) => {
  const shasum = crypto.createHmac("sha256", razorpayWebhookSecret);
  shasum.update(JSON.stringify(req.body));
  const expectedSignature = shasum.digest("hex");
  const signature = req.headers["x-razorpay-signature"];
  console.log(expectedSignature, signature);
  if (signature === expectedSignature) {
    console.log("Valid webhook received:", req.body);

    const { event, payload } = req.body;

    if (event === "payment_link.paid") {
      const customer_id = payload.payment_link.entity.notes.customer_id;
      const customerName = payload.payment_link.entity.notes.customerName;
      const customerAddress =
        payload.payment_link.entity.notes.address || "Address not provided";
      const orderDetails = payload.payment_link.entity.notes.orderItems;
      const amount = payload.payment_link.entity.notes.amount;
      const message = `
      🛍 *New Order Payment Received!*
        
      👤 *Customer Name:* ${customerName}  
      🏠 *Address:* ${customerAddress}  
      💰 *Total Amount:* ₹${amount}  

      📦 *Order Details:*  
      ${orderDetails}

      ✅ Payment confirmed & cart cleared.`;
      try {
        const { data: cartItems, error: fetchError } = await supabase
          .from("cart")
          .select("items")
          .eq("customer_id", customer_id);

        if (fetchError) {
          console.error("Error fetching cart items:", fetchError.message);
          return res.status(500).json({ error: "Failed to fetch cart items" });
        }

        if (cartItems && cartItems.length > 0) {
          const cart = cartItems[0].items || [];

          for (const item of cart) {
            const { p_id: product_id, quantity } = item;

            try {
              const { data: productData, error: fetchProductError } =
                await supabase
                  .from("products")
                  .select("quantity")
                  .eq("id", product_id)
                  .single();

              if (fetchProductError) {
                console.error(
                  `Error fetching product details for product_id=${product_id}:`,
                  fetchProductError.message
                );
                continue;
              }

              const updatedQuantity = productData.quantity - quantity;
              const updatedQuantitySold =
                (productData.quantity_sold || 0) + quantity;

              const { error: updateError } = await supabase
                .from("products")
                .update({
                  quantity: updatedQuantity,
                  quantity_sold: updatedQuantitySold,
                })
                .eq("id", product_id);

              if (updateError) {
                console.error(
                  `Error updating product quantity and quantity_sold for product_id=${product_id}:`,
                  updateError.message
                );
              } else {
                console.log(
                  `Product updated successfully for product_id=${product_id}: quantity=${updatedQuantity}, quantity_sold=${updatedQuantitySold}`
                );
              }
            } catch (error) {
              console.error(
                `Unexpected error updating product quantity and quantity_sold for product_id=${product_id}:`,
                error.message
              );
            }
          }

          const { error: clearCartError } = await supabase
            .from("cart")
            .update({ items: null })
            .eq("customer_id", customer_id);

          if (clearCartError) {
            console.error("Error clearing cart:", clearCartError.message);
            return res
              .status(500)
              .json({ error: "Failed to clear cart after payment" });
          }
        }
        try {
          console.log("Sending order confirmation to admin...");
          // await axios.post(
          //   "https://graph.facebook.com/v21.0/${whatsappId}/messages",
          //   {
          //     messaging_product: "whatsapp",
          //     to: "919629030156",
          //     type: "text",
          //     text: { body: message },
          //   },
          //   {
          //     headers: {
          //       Authorization: `Bearer ${whatsappToken}`,
          //       "Content-Type": "application/json",
          //     },
          //   }
          // );
          await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: "+919778440565",
          });
          console.log("SMS notification sent to admin successfully.");
        } catch (error) {
          console.error("Error sending SMS message to admin:", error.message);
        }

        console.log("Payment success tasks completed successfully");
        res.status(200).json({ message: "Payment processed and cart cleared" });
      } catch (error) {
        console.error("Error processing payment tasks:", error.message);
        res.status(500).json({ error: "Failed to process payment tasks" });
      }
    } else {
      console.error("Unhandled event type:", event);
      res.status(400).json({ error: "Unhandled event type" });
    }
  } else {
    console.error("Invalid webhook signature");
    res.status(400).send("Invalid signature");
  }
});

app.post("/add-to-cart", verifyToken, async (req, res) => {
  const { p_id, name, price, quantity } = req.body;
  const customer_id = req.id;
  try {
    console.log("Fetching cart for customer_id:", customer_id);

    const { data: carts, error: fetchError } = await supabase
      .from("cart")
      .select("items")
      .eq("customer_id", customer_id);

    if (fetchError) {
      console.error("Error fetching cart:", fetchError.message);
      throw new Error("Supabase query failed while fetching cart.");
    }

    const cart = carts && carts.length > 0 ? carts[0] : null;

    if (cart) {
      console.log("Cart found for customer_id:", customer_id);
      let items = cart.items ? [...cart.items] : [];
      let found = false;

      items = items.map((item) => {
        if (item && item.p_id === p_id) {
          found = true;
          return { ...item, quantity: item.quantity + quantity };
        } else {
          return item;
        }
      });

      if (!found) {
        items.push({ p_id, name, quantity, price });
      }

      try {
        const { data: updatedData, error: updateError } = await supabase
          .from("cart")
          .update({ items })
          .eq("customer_id", customer_id)
          .select();

        if (updateError) {
          console.error("Error updating cart:", updateError.message);
          throw new Error("Supabase query failed while updating cart.");
        }

        res.status(201).json({
          message: "Successfully updated cart!",
          data: updatedData,
        });
      } catch (error) {
        console.error("Error updating cart:", error.message);
        res.status(500).json({
          message: "Couldn't update cart",
          error: error.message,
        });
      }
    } else {
      console.log("No cart found for customer_id, creating a new cart.");
      const items = [{ p_id, name, quantity: 1, price }];
      try {
        const { data: insertData, error: insertError } = await supabase
          .from("cart")
          .insert({ items, customer_id })
          .select();

        if (insertError) {
          console.error("Error creating cart:", insertError.message);
          throw new Error("Supabase query failed while creating cart.");
        }

        res.status(201).json({
          message: "Successfully created cart and added product!",
          data: insertData,
        });
      } catch (error) {
        console.error("Error creating cart:", error.message);
        res.status(500).json({
          message: "Couldn't create cart",
          error: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error in add-to-cart endpoint:", error.message);
    res.status(500).json({
      message: "Couldn't fetch cart",
      error: error.message,
    });
  }
});

app.post("/delete-from-cart", verifyToken, async (req, res) => {
  const { id } = req.body;
  const customer_id = req.id;

  try {
    const { data: carts, error: fetchError } = await supabase
      .from("cart")
      .select("items")
      .eq("customer_id", customer_id);
    const cart = carts && carts.length != 0 ? carts[0] : null;
    if (cart) {
      let items = cart.items?.length == 0 ? [] : cart.items;
      items = items.filter((item) => item && item.p_id !== id);
      console.log(items);
      try {
        const { data: updatedCart, error: updateError } = await supabase
          .from("cart")
          .update({ items })
          .eq("customer_id", customer_id)
          .select();
        if (updatedCart) {
          res.status(201).json({
            message: "Item successfully deleted !!!",
            data: updatedCart,
          });
        } else throw updateError;
      } catch (error) {
        res.status(500).json({
          message: "Item could not be deleted !!!",
          error: error,
        });
      }
    } else {
      throw fetchError;
    }
  } catch (error) {
    res.status(500).json({
      message: "Cart could not be fetched",
      error: error,
    });
  }
});

app.post("/delete-cart", verifyToken, async (req, res) => {
  const { customer_id } = req.body;
  try {
    const { data: carts, error: fetchError } = await supabase
      .from("cart")
      .select("items")
      .eq("customer_id", customer_id);
    const cart = carts && carts.length != 0 ? carts[0] : null;
    if (cart) {
      let items = cart.items?.length == 0 ? [] : cart.items;
      items = null;
      try {
        const { data: updatedCart, error: updateError } = await supabase
          .from("cart")
          .update({ items })
          .eq("customer_id", customer_id)
          .select();
        if (updatedCart) {
          res.status(201).json({
            message: "Cart successfully deleted !!!",
            data: updatedCart,
          });
        } else throw updateError;
      } catch (error) {
        res.status(500).json({
          message: "Cart could not be deleted !!!",
          error: error,
        });
      }
    } else {
      throw fetchError;
    }
  } catch (error) {
    res.status(500).json({
      message: "Cart could not be fetched",
      error: error,
    });
  }
});

app.post("/get-cart", verifyToken, async (req, res) => {
  const { customer_id } = req.body;
  try {
    const { data: carts, error: fetchError } = await supabase
      .from("cart")
      .select("items")
      .eq("customer_id", customer_id);
    if (fetchError) throw fetchError;
    if (carts) {
      res.status(201).json({ data: carts });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/get-products", async (req, res) => {
  try {
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("*");
    if (fetchError) throw fetchError;
    if (products) {
      res.status(201).json({ data: products });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/get-product", async (req, res) => {
  const { p_id } = req.body;
  try {
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", p_id);
    if (fetchError) throw fetchError;
    if (products) {
      res.status(201).json({ data: products });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
