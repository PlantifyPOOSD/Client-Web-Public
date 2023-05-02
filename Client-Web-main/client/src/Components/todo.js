// Written by Grant Hendrickson for the Plantify Project

import { useEffect, useState } from "react";
import { auth } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Todo({ plant, imgUrl, plantName }) {
  const navigate = useNavigate();

  const EDIT_PLANT =
    "https://us-central1-plantify-d36ed.cloudfunctions.net/server/edit_plant";

  const [authUser, setAuthUser] = useState("");

  // Login checker
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

  console.log(plant);

  const getPlantID = (url) => {
    // Splits URL by '/'
    const urlArr = url.split("/");

    // Splits URL by '.' to get just the ID
    const pID = urlArr[3].split(".");

    return pID[0];
  };

  const extractPlantID = () => {
    const pID = getPlantID(plant.plantData.plant_url);
    console.log(pID);
    return pID;
  };

  const handleWater = () => {
    const waterDate = new Date();
    console.log(waterDate);

    const plantId = extractPlantID();
    console.log(plantId);

    console.log(authUser.uid);

    fetch(EDIT_PLANT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantId: plantId,
        dateWatered: waterDate,
        userId: authUser.uid,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        navigate("/pages/plantbase.js", { replace: true });
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="todo">
      <img
        className="todo-pic"
        src={imgUrl}
        alt={plantName}
      />
      <h2 className="todo-name">{plantName}</h2>
      <input
        className="todo-water-button"
        type="button"
        value="water"
        onClick={handleWater}
      />
    </div>
  );
}
