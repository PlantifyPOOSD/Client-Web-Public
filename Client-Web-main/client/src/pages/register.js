import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const URL =
  "https://us-central1-plantify-d36ed.cloudfunctions.net/server/registerUser";

function Register() {
  const initialValues = {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
  };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    // console.log(formValues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formValues);
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  useEffect(() => {
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      handleRegister(formValues);

      console.log(formValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const [isBetween8And32Chars, setIsBetween8And32Chars] = useState(false);
  const [hasUppercaseLetter, setHasUppercaseLetter] = useState(false);
  const [hasSpecialCharacter, setHasSpecialCharacter] = useState(false);
  const [hasDigit, setHasDigit] = useState(false);

  const validate = (values) => {
    setIsBetween8And32Chars(false);
    setHasUppercaseLetter(false);
    setHasSpecialCharacter(false);
    setHasDigit(false);

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
      var userCheck = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{4,32}$/g;
      if (userCheck.test(values.username) === false) {
        errors.username = "* Username must be between 5-32 characters";
      }
    }

    if (values.password === "") {
      errors.password = "*Password is blank";
    } else {
      // Checks for 8-32 characters long
      // At least 1 digit, 1 Special Character
      var passCheck =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/;

      if (passCheck.test(values.password) === false) {
        errors.password =
          "* Please make sure your password meets all the requirements.";
        // Check if password is between 8-32 characters
        if (
          (values.password.length >= 8 && values.password.length <= 32) ===
          false
        ) {
          setIsBetween8And32Chars(true);
        } else {
          setIsBetween8And32Chars(false);
        }

        // Check if password has at least one uppercase letter
        if (/[A-Z]/.test(values.password) === false) {
          setHasUppercaseLetter(true);
        } else {
          setHasUppercaseLetter(false);
        }

        // Check if password has at least one special character
        if (/[@#$%^&+=]/.test(values.password) === false) {
          setHasSpecialCharacter(true);
        } else {
          setHasSpecialCharacter(false);
        }

        // Check if password has at least one digit
        if (/\d/.test(values.password) === false) {
          setHasDigit(true);
        } else {
          setHasDigit(false);
        }
      }
    }

    if (values.email === "") {
      errors.email = "*Email Address is blank";
    } else {
      var emailCheck = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-z]+$/g;
      if (emailCheck.test(values.email) === false) {
        errors.email = "*Email Address is not valid";
      }
    }

    return errors;
  };

  // ============================ EMAIL VERIFICATION ============================
  const auth = getAuth();
  const navigate = useNavigate();
  const [successfulRegister, setSuccessfulRegister] = useState(false);

  function VerifyEmail(userEmail) {
    const actionCodeSettings = {
      url: "https://plantify-d36ed.firebaseapp.com",
      handleCodeInApp: true,
    };
    sendSignInLinkToEmail(auth, userEmail, actionCodeSettings)
      .then(() => {
        console.log("link sent successfuly");
        // Set the login in order to show the message
        setSuccessfulRegister(true);
        // Have a 2 second delay
        const secondsDelay = 5;
        setTimeout(() => setSuccessfulRegister(false), secondsDelay * 1000);
        setTimeout(() => navigate("/pages/login.js"), secondsDelay * 1000);
        console.log("successful Register: " + successfulRegister);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function generateMessage() {
    if (successfulRegister) {
      return (
        <div>
          <h2 className="success">
            Please check your email inbox for verification
          </h2>
          <hr />
        </div>
      );
    } else {
      return (
        <div>
          <h2 className="error">Error! Email verification failed.</h2>
          <hr />
        </div>
      );
    }
  }
  // =========================================================================

  const handleRegister = (values) => {
    // console.log(firstName + " " + lastName + " " + username + " " + password + " " + email);
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        username: values.username,
        password: values.password,
      }),
    })
      .then((data) => {
        console.log(data);
        VerifyEmail(values.email);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="register-page">
      {/* <pre>{JSON.stringify(formValues, undefined, 2)}</pre> */}
      <div className="register-container">
        <div className="container-half">
          <div className="register-header">
            <h1 id="plantify">Plantify.</h1>
            <h2>Create an account to get started using Plantify</h2>
            <hr />
          </div>

          <div
            id="register-input"
            className="input-group"
          >
            <label htmlFor="First-Name">First Name</label>
            <input
              type="text"
              name="firstName"
              id="register-first-name"
              value={formValues.firstName}
              // onChange={(e) => setFirstName(e.target.value)}
              onChange={handleChange}
            />
            <p className="error">{formErrors.firstName}</p>

            <label htmlFor="Last-Name">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="register-last-name"
              value={formValues.lastName}
              // onChange={(e) => setLastName(e.target.value)}
              onChange={handleChange}
            />
            <p className="error">{formErrors.lastName}</p>
          </div>
        </div>

        <div className="container-half">
          <div
            id="register-input"
            className="input-group"
          >
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              name="email"
              id="register-email"
              value={formValues.email}
              // onChange={(e) => setEmail(e.target.value)}
              onChange={handleChange}
            />
            <p className="error">{formErrors.email}</p>

            <label htmlFor="Username">Username</label>
            <input
              type="text"
              name="username"
              id="register-username"
              value={formValues.username}
              // onChange={(e) => setUsername(e.target.value)}
              onChange={handleChange}
            />
            <p className="error">{formErrors.username}</p>

            <label htmlFor="Password">Password</label>
            <input
              type="password"
              name="password"
              id="register-password"
              value={formValues.password}
              // onChange={(e) => setPassword(e.target.value)}
              onChange={handleChange}
            />
            <p className="error">{formErrors.password}</p>
            <br></br>
            <div>
              <ul className="error">
                {isBetween8And32Chars && (
                  <li className="error-li">
                    *Password must be between 8-32 characters
                  </li>
                )}
                {hasUppercaseLetter && (
                  <li className="error-li">
                    *Password must contain at least one uppercase letter
                  </li>
                )}
                {hasSpecialCharacter && (
                  <li className="error-li">
                    *Password must contain at least one special character
                    (@#$%^&+=)
                  </li>
                )}
                {hasDigit && (
                  <li className="error-li">
                    *Password must contain at least one digit
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <Link to="/pages/home.js">
          <input
            id="register-button"
            type="button"
            value="Register"
            onClick={handleSubmit}
          />
        </Link>
        <Link
          className="login-register-swap"
          to="/pages/login.js"
        >
          <span>
            <br></br>Already have an account?
          </span>
        </Link>
        <div>{successfulRegister && generateMessage()}</div>
      </div>
    </div>
  );
}

export default Register;
