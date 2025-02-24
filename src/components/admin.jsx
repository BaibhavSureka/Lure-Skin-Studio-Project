import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: "",
    productPrice: "",
    arrivalDate: "",
    description: "",
    benefits: "",
    usageStorage: "",
    loadedWith: "",
    disclaimer: "",
    quantity: "",
    category: "body",
    images: [],
  });
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(false); 


  const categories = ["body", "face", "hair", "skincare", "fragrance"];

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized access. Please login.");
        navigate("/login");
        return;
      }
    
      try {
        console.log(token);
        const response = await axios.get("https://lure-skin-studio.onrender.com/verify_admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.status === 200) {
          setIsAdmin(true);
        } else {
          alert(response.data?.error || "You are not authorized to access this page.");
          navigate("/login");
        }
        
      } catch (err) {
        console.error("Error verifying admin token:", err?.response?.data || err.message);
        alert(err?.response?.data?.error || "An error occurred. Please try again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    

    verifyAdmin();
  }, [navigate,axios]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized. Please login.");
      return;
    }
  
    const productData = {
      name: formData.productName,
      price: formData.productPrice,
      arrival_date: formData.arrivalDate,
      description: formData.description,
      benefits: formData.benefits.split("\n"),
      usage_storage: formData.usageStorage.split("\n"),
      loaded_with: formData.loadedWith.split("\n"),
      disclaimer: formData.disclaimer.split("\n"),
      images: formData.images,
      quantity: formData.quantity,
      category: formData.category,
    };
  
    try {
      const response = await axios.post("https://lure-skin-studio.onrender.com/upload", productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 201) {
        alert("Product uploaded successfully!");
        handleClear();
      } else {
        setError(response.data.message || "Failed to upload product.");
      }
    } catch (error) {
      console.error("Error uploading product:", error.response?.data || error.message);
      setError("An error occurred while uploading the product.");
    }
  };
  

  const handleClear = () => {
    setFormData({
      productName: "",
      productPrice: "",
      arrivalDate: "",
      description: "",
      benefits: "",
      usageStorage: "",
      loadedWith: "",
      disclaimer: "",
      quantity: "",
      category: "body",
      images: null,
    });
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
  
    setImageLoading(true); // Start loading
    try {
      const response = await axios.post("https://lure-skin-studio.onrender.com/upload/pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const uploadedImageUrl = response.data.picUrl;
  
      if (uploadedImageUrl) {
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, uploadedImageUrl],
        }));
        console.log("Image uploaded successfully:", uploadedImageUrl);
      } else {
        alert("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      alert("Failed to upload image. Please try again.");
    } finally {
      setImageLoading(false); // Stop loading
    }
  };
  
  

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-page">
      <h1>Admin Panel - Add Product</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="product-form">
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Product Price:</label>
          <input
            type="number"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Arrival Date:</label>
          <input
            type="date"
            name="arrivalDate"
            value={formData.arrivalDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Benefits:</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Usage & Storage:</label>
          <textarea
            name="usageStorage"
            value={formData.usageStorage}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Loaded With:</label>
          <textarea
            name="loadedWith"
            value={formData.loadedWith}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Disclaimer:</label>
          <textarea
            name="disclaimer"
            value={formData.disclaimer}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
        <label>Product Image:</label>
        <input
          type="file"
          name="images"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          disabled={imageLoading} // Disable input when loading
          required
        />
        {imageLoading && <span className="spinner">Uploading...</span>} {/* Add loading indicator */}
      </div>

        <div className="buttons">
          <button type="submit">Add Product</button>
          <button type="button" onClick={handleClear} className="clear-button">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default Admin;