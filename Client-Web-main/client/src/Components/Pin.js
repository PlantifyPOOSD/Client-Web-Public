// Written by Grant Hendrickson for the Plantify Project

import React from "react";
import { useNavigate } from "react-router-dom";

function Pin({ plant, imgUrl, plantName }) {
  // set up navigate
  const navigate = useNavigate();

  // Navigate to plant and pass current plant as state
  const toPlantPage = () => {
    console.log(plant);
    navigate("/pages/plant.js", { state: plant });
  };

  return (
    <div className="pin">
      <img
        className="main-pic"
        src={imgUrl}
        alt={plantName}
        onClick={() => {
          toPlantPage();
        }}
      />

      <div className="plant-pin-name-container">
        <h1 className="pin-plant-name">{plantName}</h1>
      </div>
    </div>
  );
}

export default Pin;
