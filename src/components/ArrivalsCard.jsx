import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";

const ArrivalsCard = ({
  img,
  name,
  price,
  id,
  description,
  isExpanded,
  onExpand,
  onCartClick,
  onTileClick,
  maxQuantity,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity((prev) => {
      if (prev < maxQuantity) {
        return prev + 1;
      } else {
        alert(`Maximum quantity available: ${maxQuantity}`);
        return prev;
      }
    });
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = async () => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      alert("User is not authenticated. Please log in.");
      return;
    }

    const payload = {
      p_id: id,
      name: name,
      price: price,
      quantity,
    };

    try {
      const response = await axios.post(
        "https://lure-skin-studio.onrender.com/add-to-cart",
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Cart updated successfully");
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Failed to add product to cart. Please try again."
      );
    }
  };

  const handleCancel = () => {
    setQuantity(1);
    onExpand(false);
  };

  return (
    <div
      className={`card ${isExpanded ? "expanded" : ""}`}
      style={{
        textAlign: "center",
        width: "90%",
        maxWidth: "360px",
        minHeight: "470px",
        backgroundColor: "#f9dcdc",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "12px",
        position: "relative",
        transition: "height 0.3s ease, transform 0.2s",
        overflow: "hidden",
        height: isExpanded ? "640px" : "450px",
      }}
    >
      {maxQuantity === 0 ? (
    <p className="out-of-stock">Out of Stock!</p>
    ) : maxQuantity <= 5 && (
    <p className="product-stock-alert">Going out of stock</p>
    )}
      <img
        src={img}
        alt={name}
        className="product-image"
        style={{ width: "100%", height: "300px", objectFit: "cover", cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onTileClick();
        }}
      />
      <h3 className="product-name" style={{ fontSize: "1.2em", margin: "8px 0" }}>
        {name}
      </h3>
      <p className="product-price" style={{ fontSize: "1em" }}>
        Price: {price}
      </p>

      <div
        className="cart-icon"
        style={{ marginTop: "8px", cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onCartClick();
        }}
      >
        <FaShoppingCart />
      </div>

      {isExpanded && (
        <div
          className="quantity-selector"
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f9dcdc",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <div className="quantity-controls" style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <button onClick={handleDecrement} style={{ padding: "4px 8px", fontSize: "16px" }}>-</button>
            <span>{quantity}</span>
            <button onClick={handleIncrement} style={{ padding: "4px 8px", fontSize: "16px" }}>+</button>
          </div>

          <div className="quantity-actions" style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px" }}>
            <button onClick={handleConfirm} className="confirm-cart-btn" style={{ backgroundColor: "#e37c8e", color: "#fff", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Confirm</button>
            <button onClick={handleCancel} className="cancel-cart-btn" style={{ backgroundColor: "#e37c8e", color: "#fff", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrivalsCard;
