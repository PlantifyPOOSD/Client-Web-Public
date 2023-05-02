import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconButton } from "rsuite";
import { ArowBack } from "@rsuite/icons";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";

import Todo from "../Components/todo.js";

export default function TodoList() {
  const BROWSEPLANTSURL =
    "https://us-central1-plantify-d36ed.cloudfunctions.net/server/browsePlants";

  const [plantList, setPlantList] = useState([]);
  const [authUser, setAuthUser] = useState(null);

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

  // Make sure we get correct plant list
  useEffect(() => {
    if (plantList) {
      console.log(plantList);
    }
  }, [plantList]);

  // get the URL to a specific plant img
  const getPlantImg = async (url) => {
    const imageRef = ref(storage, url);
    const imgUrl = await getDownloadURL(imageRef);

    return imgUrl;
  };

  // Checks if a date is today
  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  // Checks if a date is tomorrow
  const isTomorrow = (someDate) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      someDate.getDate() === tomorrow.getDate() &&
      someDate.getMonth() === tomorrow.getMonth() &&
      someDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Create an array of plants to water today
  const [plantsToday, setPlantsToday] = useState([]);
  useEffect(() => {
    if (plantList) {
      const imgPromises = plantList.map((plant) =>
        getPlantImg(plant.plantData.plant_url)
      );
      Promise.all(imgPromises).then((imgUrls) => {
        const plantTodoList = plantList.map((plant, index) => {
          const dateOfNextWater = new Date(
            plant.plantData.nextWateringDate._seconds * 1000
          );
          const today = isToday(dateOfNextWater);

          if (today) {
            return (
              <Todo
                plant={plant}
                imgUrl={imgUrls[index]}
                plantName={plant.plantData.plantname}
                key={index}
              />
            );
          } else {
            return null;
          }
        });
        setPlantsToday(plantTodoList.filter((plant) => plant !== null));
      });
    }
  }, [plantList]);

  // Create an array of plants to water tomorrow
  const [plantsTomorrow, setPlantsTomorrow] = useState([]);
  useEffect(() => {
    if (plantList) {
      const imgPromises = plantList.map((plant) =>
        getPlantImg(plant.plantData.plant_url)
      );
      Promise.all(imgPromises).then((imgUrls) => {
        const plantTodoList = plantList.map((plant, index) => {
          const dateOfNextWater = new Date(
            plant.plantData.nextWateringDate._seconds * 1000
          );
          const today = isTomorrow(dateOfNextWater);

          if (today) {
            return (
              <Todo
                plant={plant}
                imgUrl={imgUrls[index]}
                plantName={plant.plantData.plantname}
                key={index}
              />
            );
          } else {
            return null;
          }
        });
        setPlantsTomorrow(plantTodoList.filter((plant) => plant !== null));
      });
    }
  }, [plantList]);

  return (
    <div className="todo-page">
      <Link to="/pages/plantbase.js">
        <IconButton
          className="plantbase-icon"
          id="back-icon"
          icon={<ArowBack />}
          appearance="primary"
        />
      </Link>
      <h1 className="todo-list-header">To-Dos:</h1>
      <div className="todo-list">
        <h1 className="todo-header">Water Today:</h1>
        <div className="todo-list-container">
          {plantsToday.length !== 0 ? (
            plantsToday
          ) : (
            <h1 className="no-plants-message">No plants to water today!</h1>
          )}
        </div>
        <h1 className="todo-header">Water Tomorrow:</h1>
        <div className="todo-list-container">
          {plantsTomorrow.length !== 0 ? (
            plantsTomorrow
          ) : (
            <h1 className="no-plants-message">No plants to water tomorrow!</h1>
          )}
        </div>
      </div>
    </div>
  );
}
