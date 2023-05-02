// Written by Grant Hendrickson for the Plantify Project

import React from "react";
import Pin from "../Components/Pin";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Firebase functions
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Profile() {
  const navigate = useNavigate();
  const SEARCHUSERURL =
    "https://us-central1-plantify-d36ed.cloudfunctions.net/server/get_user_data";

  const BROWSEPLANTSURL =
    "https://us-central1-plantify-d36ed.cloudfunctions.net/server/browsePlants";

  const [userValues, setUserValues] = useState(null);
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
      console.log(authUser.uid);
      getUserValues(authUser.uid);
      getUserPlants(authUser.uid);
      getUserPic(authUser.uid).then((imgUrl) => setUserPic(imgUrl));
      console.log(userPic);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Get the values of the current user
  const getUserValues = (userId) => {
    fetch(SEARCHUSERURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        setUserValues(resJson);
      })
      .catch((error) => console.error(error));
  };

  // Get User's plantbase
  const [plantList, setPlantList] = useState([]);
  const [plantPins, setPlantPins] = useState([]);

  const getUserPlants = (userId) => {
    fetch(BROWSEPLANTSURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        setPlantList(resJson.plants);
      })
      .catch((error) => console.error(error));
  };

  // get the URL to a specific plant img
  const getPlantImg = async (url) => {
    const imageRef = ref(storage, url);
    const imgUrl = await getDownloadURL(imageRef);

    return imgUrl;
  };

  // Create an array of Pins using the list of user's plants
  useEffect(() => {
    if (plantList) {
      const imgPromises = plantList.map((plant) =>
        getPlantImg(plant.plantData.plant_url)
      );
      Promise.all(imgPromises).then((imgUrls) => {
        const plantPins = plantList.map((plant, index) => {
          return (
            <Pin
              plant={plant}
              imgUrl={imgUrls[index]}
              plantName={plant.plantData.plantname}
              key={index}
            />
          );
        });
        setPlantPins(plantPins);
      });
    }
  }, [plantList]);

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

  // OG code for Profile Picture
  // const getUserPic = async (uid) => {
  //   const imageLocation = "users/" + uid + "/profilePic/" + uid + ".jpg";
  //   const imageRef = ref(storage, imageLocation);
  //   const imgUrl = await getDownloadURL(imageRef);

  //   console.log(imgUrl);
  //   return imgUrl;
  // };

  const userLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
        navigate("/pages/home.js");
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="profile-page">
      <div className="profile-left">
        <div className="bio-container">
          <div className="profile-header">
            <img
              id="pfp"
              src={userPic}
              alt="profile-pic"
            />
            {authUser && userValues && (
              <h1 id="profile-username">{`${userValues.user.username}`}</h1>
            )}
          </div>
          {authUser &&
            userValues &&
            (userValues.user.bio ? (
              <p>{`${userValues.user.bio}`}</p>
            ) : (
              <p>No bio yet.</p>
            ))}
        </div>
        <div className="profile-button-container">
          <Link to="/pages/EditUser.js">
            <input
              className="profile-button"
              type="button"
              value="Edit Profile"
            />
          </Link>
          <Link to="pages/home.js">
            <input
              className="profile-button"
              type="button"
              value="Logout"
              onClick={userLogout}
            />
          </Link>
        </div>
      </div>
      <div className="profile-right">
        <Link
          id="profile-plantbase-link"
          to="/pages/plantbase.js"
        >
          {authUser && userValues && (
            <h1 id="username's-plants">{`${userValues.user.firstName}'s Plants:`}</h1>
          )}
        </Link>
        <div className="profile-plantbase-container">{plantPins}</div>
      </div>
    </div>
  );
}

export default Profile;
