import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import "./modal.css";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // Fix: Use default export.

const ProductModal = ({ product, onClose, maxQuantity }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  if (!product) return null;

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

  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = () => {
    setShowQuantitySelector(true);
  };

  const confirmAddToCart = async () => {
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        alert("User is not authenticated. Please log in.");
        return;
      }

      let customer_id;
      try {
        const decodedToken = jwtDecode(authToken);
        customer_id = decodedToken.id;
        if (!customer_id) throw new Error("Customer ID not found in token");
      } catch (error) {
        console.error("Error decoding token:", error.message);
        alert("Invalid token. Please log in again.");
        return;
      }

      const payload = {
        p_id: product.id,
        name: product.name,
        price: product.price,
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
          // console.log("Cart updated successfully:", response.data.data);
          alert("Cart updated successfully");
        }
      } catch (error) {
        console.error("Error adding to cart:", error.response?.data || error.message);
        alert(
          error.response?.data?.message ||
            "Failed to add product to cart. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      alert("Failed to add product to cart. Please try again.");
    } finally {
      setQuantity(1);
      setShowQuantitySelector(false);
      handleClose();
    }
  };

  const cancelAddToCart = () => {
    setQuantity(1);
    setShowQuantitySelector(false);
  };

  const handleClose = () => {
    setQuantity(1);
    setShowQuantitySelector(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={handleClose}>
          X
        </button>
        <div className="modal-details">
          <div className="modal-image-container">
            <div className="slide-image">
              <img
                src={product.images?.[currentImageIndex] || ""}
                alt={product.name || "Product Image"}
                className="modal-image"
              />
            </div>
          </div>

          <div className="modal-info">
            <h2>{product.name || "Product Name"}</h2>
            <p>
              <strong>Price:</strong> Rs {product.price || "N/A"}
            </p>

            <ul>
              <strong>Description:</strong>
              <p>{product.description}</p>
            </ul>

            <ul>
              <strong>Benefits:</strong>
              {(product.benefits || []).map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
            <ul>
              <strong>Usage & Storage:</strong>
              {(product.usage_storage || []).map((usage, idx) => (
                <li key={idx}>{usage}</li>
              ))}
            </ul>
            <ul>
              <strong>Loaded With:</strong>
              {(product.loaded_with || []).map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
            <ul>
              <strong>Disclaimer:</strong>
              {(product.disclaimer || []).map((disclaimer, idx) => (
                <li key={idx}>{disclaimer}</li>
              ))}
            </ul>

            {!showQuantitySelector ? (
              <button className="cart-btn" onClick={handleAddToCartClick}>
                Add to Cart <FaShoppingCart />
              </button>
            ) : (
              <div className="quantity-selector">
                <div className="quantity-controls">
                  <button onClick={handleDecrement}>-</button>
                  <span>{quantity}</span>
                  <button onClick={handleIncrement}>+</button>
                </div>

                {/* Warning Messages */}
                {maxQuantity <= 5 && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "14px",
                      marginTop: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {maxQuantity === 1
                      ? "Only 1 item left in stock!"
                      : `Only ${maxQuantity} items left in stock!`}
                  </p>
                )}

                <div className="quantity-actions">
                  <button onClick={confirmAddToCart} className="confirm-cart-btn">
                    Confirm
                  </button>
                  <button onClick={cancelAddToCart} className="cancel-cart-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
