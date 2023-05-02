// Written by Grant Hendrickson for the Plantify Project

import Pin from "../Components/Pin";
import { useEffect, useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { IconButton } from "rsuite";
import { Link, useNavigate } from "react-router-dom";
import { Plus, CheckOutline } from "@rsuite/icons";

export default function PlantBase() {
  const BROWSEPLANTSURL =
    "https://us-central1-plantify-d36ed.cloudfunctions.net/server/browsePlants";

  const [plantList, setPlantList] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [plantPins, setPlantPins] = useState([]);

  const navigate = useNavigate();

  var numPlants = plantPins.length;

  // Check if a user is logged in
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        console.log(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      listen();
    };
  }, []);

  // If there is a user logged in, get their plants
  // This is mostly to prevent null errors before the user is loaded
  useEffect(() => {
    if (authUser) {
      console.log(authUser.uid);
      getUserPlants(authUser.uid);
    }
  }, [authUser]);

  // Get array of user's plants
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

  const toTodoList = () => {
    navigate("/pages/todoList.js", { replace: true });
  };

  return (
    <div className="plantbase-page">
      {authUser ? (
        <h1 id="your-plantbase">{`${authUser.displayName}'s Plantbase:`}</h1>
      ) : (
        <h1 id="your-plantbase">Your Plantbase:</h1>
      )}

      <div className="plantbase-button-container">
        <div className="plantbase-button">
          <Link to="/pages/addPlant.js">
            <IconButton
              className="plantbase-icon"
              icon={<Plus />}
              appearance="primary"
            />
          </Link>
          <p>Add Plant</p>
        </div>
        <div className="plantbase-button">
          <IconButton
            onClick={() => {
              toTodoList();
            }}
            className="plantbase-icon"
            icon={<CheckOutline />}
            appearance="primary"
          />
          <p>To-Dos</p>
        </div>
      </div>

      <div className="plantbase">
        {numPlants !== 1 ? (
          <h1 id="number-of-plants">{numPlants} Plants</h1>
        ) : (
          <h1 id="number-of-plants">{numPlants} Plant</h1>
        )}
        <div className="plantbase-container">{plantPins}</div>
      </div>
    </div>
  );
}
