import React from "react";
import "../components/extra.css";
import img1 from "../attachments/attachments2/img8.png";

const Extra = () => {
  return (
    <div className="relative" style={{ height: "150vh", width: "100%" }}>
      <div className="absolute top-0 left-0 w-full h-full flex">
        <div
          style={{ backgroundImage: `url(${img1})`, backgroundSize: "cover" }}
          className="w-1/2 h-full"
        ></div>
        <div
          style={{ backgroundImage: `url(${img1})`, backgroundSize: "cover" }}
          className="w-1/2 h-full"
        ></div>
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          border: "3px solid white",
          padding: "12px",
          backgroundColor: "rgba(0, 0, 0, 0.4)", 
        }}
      >
        <h2
          style={{ color: "#FFFFFF", fontSize: "4rem" }}
          className="prata-regular my-2"
        >
          SKIN CARE
        </h2>
        <button
          style={{
            color: "#FFFFFF",
            fontSize: "1rem",
            letterSpacing: "0.03rem",
          }}
          className="prata-regular bg-transparent px-1.5 py-3 w-2/5 shop-btn"
        >
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default Extra;
