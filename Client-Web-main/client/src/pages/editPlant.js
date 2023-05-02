import { Link, useNavigate, useLocation} from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import { IconButton } from "rsuite";
import { ArowBack } from "@rsuite/icons";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, uploadBytes} from "firebase/storage";

const EDIT_PLANT =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/edit_plant";

const DELETE_PLANT =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/del_plant";

const SEARCHUSERURL =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/search_users_or_plants";

export default function EditPlant()
{ 
  // ===============================  EDIT PLANT FUNCTIONALITY ===============================
  const navigate = useNavigate();
  const location = useLocation();

  const [authUser, setAuthUser] = useState("");
  const [userValues, setUserValues] = useState(null);

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

  // Get User Data & Plants
  useEffect(() => {
    if (authUser) {
      getUserValues(authUser.uid);
    }
  }, [authUser]);

  const getUserValues = (userId) => {
    fetch(SEARCHUSERURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: userId,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        setUserValues(resJson);
      })
      .catch((error) => console.error(error));
  };

  const initialValues = {
    plantId: "",
    plantname: "",
    species: "",
    description: "",
    userId: "",
    changingPhoto: false,
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [plantImgDetails, setPlantImgDetails] = useState(null);

  const [plantImgUrl, setPlantImgUrl] = useState("");
  
  const getPlantImg = async (url) => {
    const imageRef = ref(storage, url);
    const imgUrl = await getDownloadURL(imageRef);

    console.log(imgUrl);
    setPlantImgUrl(imgUrl);
  };

  const getPlantID = (url) => {
    // Splits URL by '/'
    const urlArr =  url.split("/");
    
    // Splits URL by '.' to get just the ID
    const pID =  urlArr[3].split(".");
    
    return pID[0];
  };

  const extractPlantID = () => {
    const pID = getPlantID(location.state.plantData.plant_url);
    console.log(pID);
    return pID;
  };
  
   useEffect(() => {
    if (userValues) {
      setFormValues({
        ...formValues,
        plantId: extractPlantID(),
        plantname: location.state.plantData.plantname,
        species: location.state.plantData.species,
        description: location.state.plantData.description,
        userId: location.state.plantData.userId,
      });
      getPlantImg(location.state.plantData.plant_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userValues]);

  // Put the user entered values into the array to send later
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    //console.log(formValues);
  };

  const handleSubmit = (e) => {
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  useEffect(() => {
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      handleEditPlant(formValues);
      console.log(formValues);
    }
  }, [formErrors, isSubmit, formValues]);

  // Input Validation
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

  // Deals with Image Upload
  const [imageUpload, setImageUpload] = useState(null);
  const [preview, setPreview] = useState();
  

  const UploadImage = useCallback(() => {
      if (imageUpload == null || plantImgDetails == null) return;

      const filePath = location.state.plantData.plant_url;
      console.log(filePath + "<- filepath");

      const imageRef = ref(storage, filePath);
      uploadBytes(imageRef, imageUpload)
        .then(() => {
          console.log("Image Uploaded!");
          navigate("/pages/profile.js", { replace: true });
        })
        .catch((error) => {
          console.log("Error Uploading Image", error);
        });
    }, [imageUpload,location.state.plantData.plant_url,navigate,plantImgDetails]);


  // Setting of Plant Image
  useEffect(() => {
    console.log(plantImgDetails); // this will output the updated value
    if (plantImgDetails !== null && imageUpload !== null) {
      UploadImage();
    }
  }, [plantImgDetails,imageUpload,UploadImage]);

  

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

  
  // =========================================================================================

  const handleEditPlant = (values) => {
    console.log(values)
    fetch(EDIT_PLANT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantId: values.plantId,
        plantname: values.plantname,
        species: values.species,
        description: values.description,
        userId: values.userId,
        changingPhoto: values.changingPhoto,
      }),
    })
    .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        setPlantImgDetails(resJson);
      })
      .catch((error) => console.error(error));
  };

  const handleDeletePlant = (values) => {
    console.log(values.userId);
    console.log(values.plantId);
    fetch(DELETE_PLANT, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: values.userId,
        plantId: values.plantId,
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
        <div className="plant-edit-icon">
          <button className="delete-button" onClick={() => {
            const confirmBox = window.confirm(
              "Do you really want to delete this Plant?"
            )
            if (confirmBox === true) {
              console.log("deleting");
              handleDeletePlant(formValues);
            }
            }}>
          </button>
        </div>
        <div className="upload-image-container">
          <div className="image-drop-box">
            <div className="dotted-box">
              <img
                id="user-uploaded-image"
                src={plantImgUrl}
                alt="new plant"
              />
              <input
                type="file"
                id="img-upload"
                onChange={onUploadImage}
              />
            </div>
            {imageUpload && (
              <img
                id="user-uploaded-image"
                src={preview}
                alt="plant"
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
        
        <div className="edit-plant-buttons-container">
          <div className="edit-user-buttons-container-half">
            <Link to="/pages/plantbase.js">
              <input
                id="edit-plant-cancel-button"
                type="button"
                value="Cancel"
              />
            </Link>
          </div>

          <div className="edit-plant-buttons-container-half">
            <input
              type="button"
              value="Confirm"
              onClick={() => {
                UploadImage();
                handleSubmit();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}