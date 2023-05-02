import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link
        id="plantify"
        to="pages/home.js"
      >
        Plantify.
      </Link>

      <ul className="nav-links">
        <li className="nav-item">
          <Link to="/pages/about.js">About</Link>
        </li>
      </ul>

      <div className="navbar-spacer"></div>

      <ul className="nav-links">
        <li className="nav-item">
          <Link to="/pages/login.js">Login</Link>
        </li>
        <div className="register-button-box">
          <li className="nav-item">
            <Link
              id="register-button"
              to="/pages/register.js"
            >
              Register
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  );
}
