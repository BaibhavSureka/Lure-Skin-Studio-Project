import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { MdDelete } from "react-icons/md";
import '../components/Cart.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("token");
      let customer_id;
      if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
      }

      try {
        try {
          const decodedToken = jwtDecode(token);
          customer_id = decodedToken.id;
          if (!customer_id) {
            throw new Error("Customer ID not found in token");
          }
        } catch (error) {
          console.error("Error decoding token:", error.message);
          alert("Invalid token. Please log in again.");
          return;
        }
      
        const response = await axios.post(
          "http://localhost:5001/get-cart",
          { customer_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        if (response.data?.data?.length > 0 && response.data.data[0]?.items) {
          const items = response.data.data[0].items.map(item => ({
            product_name: item.name,
            p_id: item.p_id,
            MRP: item.price,
            quantity: item.quantity
          }));
          setCartItems(items);
        } else {
          setCartItems([]); // Ensure cart is empty instead of throwing an error
          console.warn("Cart is empty.");
        }
      } catch (error) {
        console.error("Error fetching cart:", error.response?.data || error.message);
        alert("Failed to load cart items.");
      }
      
    };

    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.MRP), 0);
  };

  const handlePayment = async () => {
    const authToken = localStorage.getItem("token");
  
    if (!authToken) {
      alert("User is not authenticated. Please log in.");
      return;
    }
  
    const orderDetails = cartItems.map(item => ({
      productName: item.product_name,
      price: item.MRP,
      quantity: item.quantity,
    }));

  
    const jsonData = {
      amount: calculateTotal(),
      customerName,
      customerContact,
      customerEmail,
      orderDetails,
    };
  
    try {
      const response = await axios.post(
        "http://localhost:5001/create-and-send-payment-link",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Payment link created successfully:", response.data);
        alert(
          `Payment link created successfully! Please complete your payment: ${response.data.paymentLink}`
        );
  
      } else {
        console.error("Unexpected response status:", response.status);
        alert("Failed to create payment link. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment link:", error.response?.data || error.message);
      alert(
        error.response?.data?.error ||
        "Failed to create payment link. Please try again."
      );
    }
  };

const clearCart = async () => {
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    alert("User is not authenticated. Please log in.");
    return;
  }

  try {
    const decodedToken = jwtDecode(authToken);
    const customer_id = decodedToken?.id;

    if (!customer_id) {
      alert("Invalid token. Unable to find customer ID.");
      return;
    }

    const response = await axios.post(
      "http://localhost:5001/delete-cart",
      { customer_id },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.status === 201) {
      console.log("Cart successfully deleted:", response.data);
      alert(response.data.message);
      setCartItems([]);
    } else {
      console.error("Unexpected response status:", response.status);
      alert("Failed to delete the cart. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting cart:", error.response?.data || error.message);
    alert(
      error.response?.data?.message ||
      "Failed to delete the cart. Please try again."
    );
  }
};

const handleDelete = async (item) => {
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    alert("User is not authenticated. Please log in.");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5001/delete-from-cart",
      { id: item.p_id },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.status === 201) {
      alert(response.data.message);

      setCartItems((prevItems) =>
        prevItems.filter((cartItem) => cartItem.p_id !== item.p_id)
      );
    } else {
      console.error("Unexpected response status:", response.status);
      alert("Failed to delete the item. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting item:", error.response?.data || error.message);
    alert(
      error.response?.data?.message ||
      "Failed to delete the item. Please try again."
    );
  }
};


  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h2>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Cumulative Price</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>Rs {item.MRP}</td>
                    <td>Rs {item.quantity * item.MRP}</td>
                    <td><MdDelete onClick={()=>handleDelete(item)} style={{cursor:"pointer"}}/></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">Total</td>
                  <td>Rs {calculateTotal()}</td>
                </tr>
              </tfoot>
            </table>
            <button className="clear-button" onClick={clearCart}>Clear Cart</button>
          </>
        )}
        <div className="checkout-section">
          <h3>Customer Details:</h3>
          <div className="form-row">
            <label>Name</label>
            <input
              type="text"
              placeholder="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Contact Number</label>
            <input
              type="text"
              placeholder="Contact Number: Add +91 before your contact number"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          <button className="payment-button" onClick={handlePayment}>Go to Payment</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
