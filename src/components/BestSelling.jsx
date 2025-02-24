import React, { useState, useEffect } from "react";
import ArrivalsCard from "./ArrivalsCard";
import ProductModal from "./Modal";
import "./BestSelling.css";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

const BestSelling = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null); // Track expanded card

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const getAllProducts = async () => {
      try {
        const response = await axios.get("https://lure-skin-studio.onrender.com/get-products");
        const allProducts = response.data.data;
        const sortedProducts = allProducts
          .sort((a, b) => b.quantity_sold - a.quantity_sold)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: `Rs ${product.price}`,
            img: product.images[0],
            ...product,
          }));

        setProducts(sortedProducts.slice(0, 6));
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    getAllProducts();
  }, []);

  const visibleItemsCount = 3;

  const nextProduct = () => {
    if (products.length > visibleItemsCount) {
      setCurrentIndex((prev) => (prev + 1) % (products.length - visibleItemsCount + 1));
    }
  };

  const prevProduct = () => {
    if (products.length > visibleItemsCount) {
      setCurrentIndex((prev) => (prev === 0 ? products.length - visibleItemsCount : prev - 1));
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = (event) => {
    if (event) event.stopPropagation();
    setSelectedProduct(null);
  };

  const handleCardExpand = (product) => {
    setExpandedProduct((prev) => (prev === product ? null : product));
  };

  return (
    <div className="arrivals-section open-up" style={{ width: "100vw" }} data-aos="zoom-out">
      <h2 className="section-title text-uppercase mb-0">BEST SELLING</h2>
      <div className="carousel-container">
        <button
          className="arrow-btn left-arrow"
          onClick={prevProduct}
          disabled={products.length <= visibleItemsCount}
        >
          ←
        </button>

        <div
          className="carousel"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItemsCount)}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={`arrivals-card ${expandedProduct === product ? "expanded" : ""}`}
            >
              <ArrivalsCard
                img={product.img}
                name={product.name}
                price={product.price}
                id={product.id}
                description={product.description}
                isExpanded={expandedProduct === product}
                onExpand={() => handleCardExpand(product)}
                onCartClick={() => handleCardExpand(product)}
                onTileClick={() => openModal(product)}
                maxQuantity={product.quantity}
              />

            </div>
          ))}
        </div>

        <button
          className="arrow-btn right-arrow"
          onClick={nextProduct}
          disabled={products.length <= visibleItemsCount}
        >
          →
        </button>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          maxQuantity={selectedProduct.quantity}
        />
      
      )}
    </div>
  );
};

export default BestSelling;