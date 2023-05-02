// Written by Grant Hendrickson for the Plantify Project

import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { IconButton } from "rsuite";
import { SortUp, ArowBack } from "@rsuite/icons";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";

const ADD_PLANT =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/add_plant";

export default function AddPlant() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState("");

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
    plantname: "",
    species: "",
    description: "",
    userId: "",
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [plantImgDetails, setPlantImgDetails] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    //console.log(formValues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  useEffect(() => {
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      handleAddPlant(formValues);
      console.log(formValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const validate = (values) => {
    const errors = {};

    if (!values.plantname) {
      errors.firstName = "*Plant name is blank";
    }

    if (!values.species) {
      errors.firstName = "*Species is blank";
    }

    if (!values.description) {
      errors.firstName = "*Description is blank";
    }

    return errors;
  };

  const handleAddPlant = (values) => {
    fetch(ADD_PLANT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantname: values.plantname,
        species: values.species,
        description: values.description,
        userId: authUser.uid,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        setPlantImgDetails(resJson);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    console.log(plantImgDetails); // this will output the updated value
    if (plantImgDetails !== null && imageUpload !== null) {
      UploadImage();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantImgDetails]);

  // Deal with image upload
  const [imageUpload, setImageUpload] = useState(null);
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!imageUpload) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(imageUpload);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageUpload]);

  const onUploadImage = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImageUpload(undefined);
      return;
    }

    setImageUpload(e.target.files[0]);
  };

  const UploadImage = () => {
    console.log(imageUpload);

    if (imageUpload == null || plantImgDetails == null) return;

    const filePath = plantImgDetails.plantUrl;
    console.log(filePath + " <- filepath");

    const imageRef = ref(storage, filePath);
    uploadBytes(imageRef, imageUpload)
      .then(() => {
        console.log("Image Uploaded!");
        navigate("/pages/plantbase.js", { replace: true });
      })
      .catch((error) => {
        console.log("Error Uploading Image", error);
      });
  };

  return (
    <div className="add-plant-page">
      <Link to="/pages/plantbase.js">
        <IconButton
          className="plantbase-icon"
          id="back-icon"
          icon={<ArowBack />}
          appearance="primary"
        />
      </Link>

      <div className="add-plant-container">
        <div className="upload-image-container">
          <div className="image-drop-box">
            <div className="dotted-box">
              <input
                type="file"
                id="img-upload"
                onChange={onUploadImage}
              />
              <div className="upload-button-container">
                <IconButton
                  className="plantbase-icon"
                  id="upload-icon"
                  icon={<SortUp />}
                  appearance="primary"
                />
                <h1 id="upload-text">Upload</h1>
              </div>
            </div>
            {imageUpload && (
              <img
                id="user-uploaded-image"
                src={preview}
                alt="your plant"
              />
            )}
          </div>
        </div>
        <div className="upload-text-container">
          <input
            type="text"
            id="plant-name"
            name="plantname"
            placeholder="Give your plant a name"
            value={formValues.plantname}
            onChange={handleChange}
          />
          <input
            type="text"
            id="plant-species"
            name="species"
            placeholder="Plant species"
            value={formValues.species}
            onChange={handleChange}
          />
          <textarea
            type="text"
            id="plant-description"
            name="description"
            placeholder="Add a description..."
            value={formValues.description}
            onChange={handleChange}
          />
        </div>

        <input
          type="button"
          value="Save"
          id="save-button"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
