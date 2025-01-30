import React, { useEffect, useState } from "react";
import "./products.css";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import ProductModal from "./Modal";
import { useLocation } from "react-router-dom";

const Products = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation(); 
  const [sortBy, setSortBy] = useState("");
  const [soaps, setSoaps] = useState([]);
  const [oils, setOils] = useState([]);
  const [toners, setToners] = useState([]);
  const [scrubs, setScrubs] = useState([]);
  const [shower_gel, setShower_gel] = useState([]);
  const [aloevera_gel, setAloevera_gel] = useState([]);
  const [facemasks, setFacemasks] = useState([]);
  const [lipbalms, setLipbalms] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterByCategory, setFilterByCategory] = useState("");
  const [showMoreSoaps, setShowMoreSoaps] = useState(false);
  const [showMoreOils, setShowMoreOils] = useState(false);
  const [showMoreToners, setShowMoreToners] = useState(false);
  const [showMoreScrubs, setShowMoreScrubs] = useState(false);
  const [showMoreShowerGel, setShowMoreShowerGel] = useState(false);
  const [showMoreAloveraGel, setShowMoreAloveraGel] = useState(false);
  const [showMoreFacemasks, setShowMoreFacemasks] = useState(false);
  const [showMoreLipbalms, setShowMoreLipbalms] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (location.state?.filterCategory) {
      setFilterByCategory(location.state.filterCategory);
    }
    if (location.state?.sortOption) {
      setSortBy(location.state.sortOption);
    }
  }, [location.state]);

  const openModal = (product) => {
    setSelectedProduct(product); 
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/get-products");
        console.log(response);
        const temp_soaps = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("soap")
        );
        setSoaps(temp_soaps);
        const temp_oils = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("oil")
        );
        setOils(temp_oils);
        const temp_toners = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("toner")
        );
        setToners(temp_toners);
        const temp_scrubs = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("scrub")
        );
        setScrubs(temp_scrubs);
        const temp_shower_gel = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("shower gel")
        );
        setShower_gel(temp_shower_gel);
        const temp_aloevera_gel = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("aloevera gel")
        );
        setAloevera_gel(temp_aloevera_gel);
        const temp_facemasks = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("face mask")
        );
        setFacemasks(temp_facemasks);
        const temp_lipbalms = response.data.data.filter((product) =>
          product.name.toLowerCase().includes("lip balm")
        );
        setLipbalms(temp_lipbalms);
      } catch (err) {
        console.error("Error fetching products:", err.message);
      }
    };

    fetchProducts();
  }, []);

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const sortProducts = (products, sortBy) => {
    const sortedProducts = [...products];
    if (sortBy === "available") {
      return sortedProducts.sort((a, b) => b.available - a.available);
    } else if (sortBy === "price") {
      return sortedProducts.sort((a, b) => a.price - b.price);
    }
    return products;
  };

  const filterAndSortProducts = (category, sortBy) => {
    let filteredProducts = {
      soaps: [],
      oils: [],
      toners: [],
      scrubs: [],
      shower_gel: [],
      aloevera_gel: [],
      facemasks: [],
      lipbalms: []
    };

    if (category === "hair") {
      filteredProducts.oils = oils;
      filteredProducts.aloevera_gel = aloevera_gel;
    } else if (category === "body") {
      filteredProducts.soaps = soaps;
      filteredProducts.shower_gel = shower_gel;
      filteredProducts.aloevera_gel = aloevera_gel;
    } else if (category === "face") {
      filteredProducts.soaps = soaps;
      filteredProducts.toners = toners;
      filteredProducts.scrubs = scrubs;
      filteredProducts.aloevera_gel = aloevera_gel;
      filteredProducts.facemasks = facemasks;
      filteredProducts.lipbalms = lipbalms;
    } else {
      filteredProducts.soaps = soaps;
      filteredProducts.oils = oils;
      filteredProducts.toners = toners;
      filteredProducts.scrubs = scrubs;
      filteredProducts.shower_gel = shower_gel;
      filteredProducts.aloevera_gel = aloevera_gel;
      filteredProducts.facemasks = facemasks;
      filteredProducts.lipbalms = lipbalms;
    }

    return {
      soaps: sortProducts(filteredProducts.soaps, sortBy),
      oils: sortProducts(filteredProducts.oils, sortBy),
      toners: sortProducts(filteredProducts.toners, sortBy),
      scrubs: sortProducts(filteredProducts.scrubs, sortBy),
      shower_gel: sortProducts(filteredProducts.shower_gel, sortBy),
      aloevera_gel: sortProducts(filteredProducts.aloevera_gel, sortBy),
      facemasks: sortProducts(filteredProducts.facemasks, sortBy),
      lipbalms: sortProducts(filteredProducts.lipbalms, sortBy)
    };
  };

  const handleIncrement = (maxLimit) => {
    setQuantity((prev) => (prev < maxLimit ? prev + 1 : prev));
  };
  
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  
  const handleConfirm = async (product) => {
    const authToken = localStorage.getItem("token");
    console.log(quantity);
    if (!authToken) {
      alert("User is not authenticated. Please log in.");
      return;
    }
    const payload = {
      p_id: product.id,
      name: product.name,
      price: product.price,
      quantity
    };
    try {
      const response = await axios.post(
        "http://localhost:5001/add-to-cart",
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.status === 201) {
        console.log("Cart updated successfully:", response.data.data);
        alert("Cart updated successfully");
      }

      setShowQuantitySelector(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        "Failed to add product to cart. Please try again."
      );
    }
  };

  const handleCancel = () => {
    setShowQuantitySelector(null);
    setQuantity(1);
  };

  const renderProducts = (products, showMore, setShowMore) => (
    <>
      <div className="product-grid">
        {products.slice(0, showMore ? products.length : 4).map((product, index) => {
          const isExpanded = showQuantitySelector === product; // Check if the tile should be expanded
          return (
            <div key={index} className={`product-card ${isExpanded ? "expanded" : ""}`}>
             {product.quantity < 30 && (
  <div className="product-stock-alert">⚠️ Going out of stock!</div>
)}

              <img src={product.images[0]} alt={product.name} className="product-image" onClick={() => openModal(product)} />

              <div className="product-details text-left">
                <h6 className="product-name">{product.name}</h6>
                <p className="product-price">Price: Rs {product.price}</p>
                <h5>{product.quantity}</h5>
              </div>

              {/* Cart Icon with Expansion Control */}
              <div
                className="cart-icon"
                onClick={() => {
                  setShowQuantitySelector(isExpanded ? null : product); // Toggle expansion
                  setQuantity(1);
                }}
              >
                <FaShoppingCart />
              </div>

              {/* Quantity Selector (Visible only when expanded) */}
              {isExpanded && (
                <div className="quantity-selector">
                  <div className="quantity-controls">
                    <button onClick={handleDecrement} >-</button>
                    <span>{quantity}</span>
                    <button onClick={() => handleIncrement(product.quantity)} style={{display:"flex",justifyContent:"center",alignItems:"center"}}>+</button>

                  </div>
                  <div className="quantity-actions">
                    <button onClick={() => handleConfirm(product)} className="confirm-btn">Confirm</button>
                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {products.length > 4 && (
        <button className="see-more-btn" onClick={() => setShowMore(!showMore)}>
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </>
  );

  const filteredProducts = filterAndSortProducts(filterByCategory, sortBy);

  return (
    <div className="product-container">
      <h1 className="custom-tagline">Feel the best version of you</h1>

      <div className="filter-container-wrapper">
        <div className="filter-sort-row">
          <div className="filter-container">
            <label htmlFor="filter">Filter By: </label>
            <select
              id="filter"
              value={filterByCategory}
              onChange={(e) => {
                setFilterByCategory(e.target.value);
                setSortBy("");
              }}
            >
              <option value="">All Products</option>
              <option value="hair">Hair</option>
              <option value="body">Body</option>
              <option value="face">Face</option>
            </select>
          </div>
          {filterByCategory && (
            <div className="sort-container">
              <label htmlFor="sort">Sort By: </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Select</option>
                <option value="price">Price</option>
                <option value="available">Availability</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {filteredProducts.soaps.length > 0 && (
        <>
          <h2>Soaps</h2>
          {renderProducts(filteredProducts.soaps, showMoreSoaps, setShowMoreSoaps)}
        </>
      )}

      {filteredProducts.oils.length > 0 && (
        <>
          <h2>Oils</h2>
          {renderProducts(filteredProducts.oils, showMoreOils, setShowMoreOils)}
        </>
      )}

      {filteredProducts.toners.length > 0 && (
        <>
          <h2>Toners</h2>
          {renderProducts(filteredProducts.toners, showMoreToners, setShowMoreToners)}
        </>
      )}

      {filteredProducts.scrubs.length > 0 && (
        <>
          <h2>Scrubs</h2>
          {renderProducts(filteredProducts.scrubs, showMoreScrubs, setShowMoreScrubs)}
        </>
      )}

      {filteredProducts.shower_gel.length > 0 && (
        <>
          <h2>Shower Gels</h2>
          {renderProducts(filteredProducts.shower_gel, showMoreShowerGel, setShowMoreShowerGel)}
        </>
      )}

      {filteredProducts.aloevera_gel.length > 0 && (
        <>
          <h2>Aloe Vera Gel</h2>
          {renderProducts(filteredProducts.aloevera_gel, showMoreAloveraGel, setShowMoreAloveraGel)}
        </>
      )}

      {filteredProducts.facemasks.length > 0 && (
        <>
          <h2>Facemasks</h2>
          {renderProducts(filteredProducts.facemasks, showMoreFacemasks, setShowMoreFacemasks)}
        </>
      )}

      {filteredProducts.lipbalms.length > 0 && (
        <>
          <h2>Lip Balms</h2>
          {renderProducts(filteredProducts.lipbalms, showMoreLipbalms, setShowMoreLipbalms)}
        </>
      )}

      <ProductModal product={selectedProduct} onClose={closeModal} />
    </div>
  );
};

export default Products;