import React from "react";
import img1 from "../attachments/attachments1/i9.png";
import img2 from "../attachments/attachments1/i10.png";
import img3 from "../attachments/attachments1/i11.png";
import img4 from "../attachments/attachments1/i12.png";
import img5 from "../Product Images/soaps/French Green Clay.png";

const Insta = () => {
  const imageStyle = {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease-in-out",
  };

  return (
    <div className="w-screen my-5 py-5 px-4">
      <h4
        className="text-center py-3"
        style={{
          fontFamily: "'Rockwell', 'Prata', serif",
          fontSize: "40px",
          marginBottom: "30px",
          fontWeight: "bold",
          color: "#2d2d2d",
        }}
      >
        Follow us on Instagram
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[img1, img2, img3, img4, img5].map((img, index) => (
          <img
            key={index}
            src={img}
            style={imageStyle}
            alt={`Instagram ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Insta;
