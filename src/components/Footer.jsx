import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../attachments/logo2.png";
import { FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer id="footer" className="mt-5">
      <div className="container">
        <div className="row d-flex flex-wrap justify-content-between py-5">
          
          {/* Logo and Description Section */}
          <div className="col-md-4 col-sm-6 text-center text-md-start">
            <div className="footer-menu footer-menu-001">
              <div className="footer-intro mb-4">
                <img
                  src={logo}
                  alt="logo"
                  onClick={handleLogoClick}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <p>
                <em>Feel the best version of you</em>
              </p>
              <div className="social-links">
                <ul className="list-unstyled d-flex justify-content-center justify-content-md-start gap-4">
                  <li>
                    <a
                      href="https://www.instagram.com/lure_skinstudio?igsh=bW80bmoydDBvaHM3"
                      className=""
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram size={32} className="svg-color" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-md-2 col-sm-6 text-center text-md-start">
            <div className="footer-menu footer-menu-002">
              <h5 className="widget-title text-uppercase mb-4">Quick Links</h5>
              <ul className="menu-list list-unstyled text-uppercase border-animation-left fs-6">
                <li className="menu-item mb-2">
                  <Link to="/" className="item-anchor" onClick={scrollToTop}>
                    Home
                  </Link>
                </li>
                <li className="menu-item mb-2">
                  <Link to="/products" className="item-anchor" onClick={scrollToTop}>
                    Shop
                  </Link>
                </li>
                <li className="menu-item mb-2">
                  <Link to="/blog" className="item-anchor" onClick={scrollToTop}>
                    Blog
                  </Link>
                </li>
                <li className="menu-item mb-2">
                  <Link to="/policy" className="item-anchor" onClick={scrollToTop}>
                    Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="col-md-3 col-sm-6 text-center text-md-start">
            <div className="footer-menu footer-menu-004 border-animation-left">
              <h5 className="widget-title text-uppercase mb-4">Contact Us</h5>
              <div className="contact-info">
                <p className="d-flex justify-content-center justify-content-md-start align-items-center mb-2">
                  <FaPhoneAlt className="me-2" />
                  <a href="tel:+918778081625" className="item-anchor">
                    +91 8778081625
                  </a>
                </p>
                <p className="d-flex justify-content-center justify-content-md-start align-items-center mb-2">
                  <FaEnvelope className="me-2" />
                  <a href="mailto:swathika5656@gmail.com" className="item-anchor">
                    swathika5656@gmail.com
                  </a>
                </p>
              </div>
              <div className="address mt-4">
                <h5 className="widget-title text-uppercase mb-3">Address</h5>
                <p className="mb-0">
                  Erode, Tamil Nadu, <br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-top py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p></p>
            </div>
            <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
              <p>© 2025 Lure Skin Studio. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
