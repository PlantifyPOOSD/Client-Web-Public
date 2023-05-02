// Written by Grant Hendrickson for the Plantify Project

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";

import defaultPFP from "../img/defaultPFP.jpeg";

const SEARCHUSERURL =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/get_user_data";

const UPDATEUSERURL =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/update_user";

const ADDPROFILEPICURL =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/add_profile_pic";

function EditUser() {
  const navigate = useNavigate();

  const [userValues, setUserValues] = useState(null);
  const [authUser, setAuthUser] = useState(null);
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
      getUserValues(authUser.uid);
      getUserPic(authUser.uid).then((imgUrl) => setUserPic(imgUrl));
    }
  }, [authUser]);

  // Get the URL of the user's Profile Picture
  const getUserPic = async (uid) => {
    const imageLocation = "users/" + uid + "/profilePic/" + uid + ".jpg";
    const imageRef = ref(storage, imageLocation);
    const imgUrl = await getDownloadURL(imageRef);

    console.log(imgUrl);
    return imgUrl;
  };

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

  const initialValues = {
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (userValues) {
      setFormValues({
        ...formValues,
        firstName: userValues.user.firstName,
        lastName: userValues.user.lastName,
        username: userValues.user.username,
        bio: userValues.user.bio,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userValues]);

  // Put the user entered values into the array to send later
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = () => {
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  useEffect(() => {
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      handleEditUser(formValues);
      handleProfilePicUpload(authUser.uid);
      console.log(formValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const handleEditUser = (values) => {
    console.log(`${authUser.uid}`);
    fetch(UPDATEUSERURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: `${authUser.uid}`,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        bio: values.bio,
      }),
    })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error(error));
  };

  // Deal with Image Upload
  const [userImgDetails, setUserImgDetails] = useState(null);
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

  const handleProfilePicUpload = (userId) => {
    fetch(ADDPROFILEPICURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        setUserImgDetails(resJson);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    console.log(userImgDetails); // this will output the updated value
    if (userImgDetails !== null && imageUpload !== null) {
      UploadImage();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImgDetails]);

  const UploadImage = () => {
    if (imageUpload == null || userImgDetails == null) return;

    const filePath = userImgDetails.pfp_url;
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
  };

  const validate = (values) => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = "*First Name is blank";
    }

    if (values.lastName === "") {
      errors.lastName = "*Last Name is blank";
    }

    if (values.username === "") {
      errors.username = "*Username is blank";
    } else {
      var userCheck = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{5,32}$/g;
      if (userCheck.test(values.username) === false) {
        errors.username = "* Username is invalid";
      }
    }

    return errors;
  };

  return (
    <div className="edit-user-page">
      <div className="edit-user-container">
        <div className="edit-user-pic-container">
          <div className="edit-user-pic-and-preview">
            <input
              type="file"
              id="user-img-upload"
              onChange={onUploadImage}
            />
            <img
              id="edit-profile-pic"
              src={defaultPFP}
              alt="profile"
            />
            {imageUpload && (
              <img
                id="user-uploaded-profile-pic"
                src={preview}
                alt="profile"
              />
            )}
          </div>

          <div className="change-pic-button-container">
            <input
              id="change-pic-button"
              type="file"
              onChange={onUploadImage}
            />
          </div>
        </div>

        <div className="edit-user-name-container">
          <div className="edit-user-name-container-half">
            <label
              className="edit-user-label"
              htmlFor="First-Name"
            >
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              id="edit-first-name"
              value={formValues.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="edit-user-name-container-half">
            <label
              className="edit-user-label"
              htmlFor="Last-Name"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="edit-last-name"
              value={formValues.lastName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="edit-user-bio-container">
          <label htmlFor="User-Bio">Bio</label>
          <textarea
            type="text"
            name="bio"
            id="edit-user-bio"
            value={formValues.bio}
            onChange={handleChange}
          />
        </div>

        <div className="edit-user-username-container">
          <label htmlFor="Username">Username</label>
          <input
            type="text"
            name="username"
            id="edit-username"
            value={formValues.username}
            onChange={handleChange}
          />
        </div>

        <div className="edit-user-buttons-container">
          <div className="edit-user-buttons-container-half">
            <Link to="/pages/profile.js">
              <input
                id="edit-user-cancel-button"
                type="button"
                value="Cancel"
              />
            </Link>
          </div>

          <div className="edit-user-buttons-container-half">
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

export default EditUser;
