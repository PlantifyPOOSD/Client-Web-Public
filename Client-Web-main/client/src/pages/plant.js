import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import moment from "moment";
import { IconButton } from "rsuite";
import { ArowBack } from "@rsuite/icons";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import sun from "../img/sun.png";
import waterDrop from "../img/waterdrop.png";

export default function Plant() {
  const location = useLocation();
  const navigate = useNavigate();
  const SEARCH_PLANT = `https://us-central1-plantify-d36ed.cloudfunctions.net/server/search_plant/${location.state.plantData.species}`;
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

  const initialValues = {
    plantCycle: "",
    plantId: "",
    plantName: "",
    scientificName: "",
    sunlight: [],
    water: "",
  };

  const [plantValues, setPlantValues] = useState(initialValues);

  const getSuggestedCare = () => {
    console.log(location.state.plantData.species);
    console.log(SEARCH_PLANT);
    fetch(SEARCH_PLANT)
      .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        console.log(resJson.plantInfo);
        setPlantValues({
          ...plantValues,
          plantCycle: resJson.plantInfo.plantCycle,
          plantId: resJson.plantInfo.plantId,
          plantName: resJson.plantInfo.plantName,
          scientificName: resJson.plantInfo.scientificName,
          sunlight: resJson.plantInfo.sunlight,
          water: resJson.plantInfo.water,
        });
      })
      .catch((error) => {
        console.error(error);
        setPlantValues({
          ...plantValues,
          plantCycle: "*Could not find plant species",
          plantId: "*Could not find plant species",
          plantName: "*Could not find plant species",
          scientificName: "*Could not find plant species",
          sunlight: ["*Could not find plant species"],
          water: "*Could not find plant species",
        });
      });
  };

  useEffect(() => {
    getSuggestedCare();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(plantValues);

  function getSunlightInstruction() {
    return plantValues.sunlight && plantValues.sunlight.length > 0 ? (
      <div className="suggestion">
        <ul>
          {plantValues.sunlight.map((sunlight, idx) => (
            <li key={idx}>{sunlight}</li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="suggestion">
        {plantValues.sunlight && plantValues.sunlight.length === 0
          ? "No sunlight requirements found."
          : plantValues.sunlight
          ? "Loading sunlight requirements..."
          : null}
      </div>
    );
  }

  // get the URL to a specific plant img
  const [plantImgUrl, setPlantImgUrl] = useState("");
  const getPlantImg = async (url) => {
    const imageRef = ref(storage, url);
    const imgUrl = await getDownloadURL(imageRef);

    console.log(imgUrl);

    setPlantImgUrl(imgUrl);
  };

  // Make edits to a plant
  const handleEdit = () => {
    // get the current plant data
    const plantData = location.state.plantData;

    // navigate to a new page for editing the plant data
    navigate("/pages/editPlant.js", { state: { plantData } });
  };

  // call the getPlantImg function on component mount
  useEffect(() => {
    getPlantImg(location.state.plantData.plant_url);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get Last Watered and When to Water Next
  const dateLastWatered = new Date(
    location.state.plantData.dateWatered._seconds * 1000
  );
  const howLongSinceWater = moment(dateLastWatered).fromNow();

  const nextWateringDate = new Date(
    location.state.plantData.nextWateringDate._seconds * 1000
  );
  const whenToWater = moment(nextWateringDate).fromNow();

  console.log(location.state);

  const getPlantID = (url) => {
    // Splits URL by '/'
    const urlArr = url.split("/");

    // Splits URL by '.' to get just the ID
    const pID = urlArr[3].split(".");

    return pID[0];
  };

  const extractPlantID = () => {
    const pID = getPlantID(location.state.plantData.plant_url);
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
    <div className="plant-page">
      <Link to="/pages/plantbase.js">
        <IconButton
          className="plantbase-icon"
          id="back-icon"
          icon={<ArowBack />}
          appearance="primary"
        />
      </Link>

      <div className="plant-container">
        <div className="plant-edit-icon">
          <button
            className="edit-button"
            type="submit"
            onClick={handleEdit}
          ></button>
        </div>
        <div className="plant-image-container">
          <img
            className="plant-image"
            src={plantImgUrl}
            alt=""
          />
        </div>
        <div className="plant-bio-container">
          <h1 className="single-plant-header">
            {location.state.plantData.plantname}
          </h1>
          <p id="single-plant-description">
            {location.state.plantData.description}
          </p>
          <h1 className="single-plant-header">Suggested Care:</h1>
          <div className="plant-SuggestedCare-container">
            <div className="care-container">
              <div className="suggestion-type">
                <img
                  className="suggestion-icon "
                  src={waterDrop}
                  alt="Watering: "
                />
                <h2 className="suggestion-header">Water:</h2>
              </div>

              <div className="suggestion">{plantValues.water}</div>
            </div>

            <div className="care-container">
              <div className="suggestion-type">
                <img
                  className="suggestion-icon"
                  src={sun}
                  alt="Sunlight: "
                />
                <h2 className="suggestion-header">Sunlight:</h2>
              </div>

              <div className="suggestion">{getSunlightInstruction()}</div>
            </div>
          </div>
          <h1 className="single-plant-header">Progress:</h1>
          <div className="care-container">
            <div className="suggestion-type">
              <div className="watering-progress-container">
                <h2 className="watering-header">Last Watered:</h2>
                <div className="date-last-watered">{howLongSinceWater}</div>
              </div>

              <div className="watering-progress-container">
                <h2 className="watering-header">When to Water Next:</h2>
                <div className="date-last-watered">{whenToWater}</div>
              </div>
            </div>
            <div className="water-button-container">
              <input
                className="water-button"
                type="button"
                value="water"
                onClick={handleWater}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
