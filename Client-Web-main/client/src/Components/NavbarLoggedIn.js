import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Firebase functions
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";

export default function NavbarLoggedIn() {
  const [authUser, setAuthUser] = useState("");
  const [userPic, setUserPic] = useState("");

  // Check if a user is logged in
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      listen();
    };
  }, []);

  // If there is a user logged in, get their data and plants
  // This is mostly to prevent null errors before the user is loaded
  useEffect(() => {
    if (authUser) {
      getUserPic(authUser.uid).then((imgUrl) => setUserPic(imgUrl));
    }
  }, [authUser]);

  // Get the URL of the user's Profile Picture
  const getUserPic = async (uid) => {
    try {
      const imageLocation = "users/" + uid + "/profilePic/" + uid + ".jpg";
      const imageRef = ref(storage, imageLocation);
      const imgUrl = await getDownloadURL(imageRef);
      return imgUrl;
    } catch (error) {
      // Gets default image from a default account
      if (error.code === "storage/object-not-found") {
        const imageRef = ref(
          storage,
          "users/cW7b3Of2fUfJriVf4MfPsmmmhJF3/profilePic/cW7b3Of2fUfJriVf4MfPsmmmhJF3.jpg"
        );
        const imgUrl = await getDownloadURL(imageRef);
        return imgUrl;
      } else {
        console.log("Unexpected error:", error);
      }
    }
  };

  return (
    <nav className="navbar">
      <Link
        id="plantify"
        to="/"
      >
        Plantify.
      </Link>

      <ul className="nav-links">
        <li className="nav-item">
          <Link to="/pages/about.js">About</Link>
        </li>
      </ul>

      <div className="navbar-spacer"></div>

      <Link to="/pages/profile.js">
        <img
          id="navbar-profile-pic"
          src={userPic}
          alt="profile"
        />
      </Link>
    </nav>
  );
}
