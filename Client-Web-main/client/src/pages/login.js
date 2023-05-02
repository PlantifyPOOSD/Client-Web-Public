import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase.ts";

const Login = () => {
  const navigate = useNavigate();
  const initialValues = {
    email: "",
    password: "",
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
    console.log("IN handleSubmit");
    e.preventDefault();
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  useEffect(() => {
    console.log("IN USE EFFECT");
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      // console.log("CALLING VALIDATE FROM USE EFFECT");
      validate(formValues);
      console.log(formValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const validate = (values) => {
    console.log("IN VALIDATE");
    console.log(formValues);
    const errors = {};
    if (values.email === "") {
      errors.email = "*Email is blank";
    }
    if (values.password === "") {
      errors.password = "*Password is blank";
    }
    if (values.email !== "" && values.password !== "") {
      signInWithEmailAndPassword(auth, values.email, values.password)
        .then((userCredential) => {
          console.log(userCredential);
          navigate("/pages/home.js", { replace: true });
        })
        .catch((error) => {
          console.log("INVALID CREDENTIALS IN VALIDATE");
          setFormErrors({ ...formErrors, password: "INVALID CREDENTIALS" });
          return errors;
        });
    }
    return errors;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 id="plantify">Plantify.</h1>
          <h2>Sign in to get started using Plantify</h2>
          <hr />
        </div>

        <div
          id="login-input"
          className="input-group"
        >
          <label htmlFor="Email">Email</label>
          <input
            type="text"
            name="email"
            id="login-email"
            value={formValues.email}
            onChange={handleChange}
          />
          <p className="error">{formErrors.email}</p>
          <label htmlFor="Password">Password
            <Link
              className="forgot-password"
              to="/pages/resetPass.js"
            >
              Forgot password?
            </Link>
          </label>
          
         
          <input
            type="password"
            name="password"
            id="login-password"
            value={formValues.password}
            onChange={handleChange}
          />
          <p className="error">{formErrors.password}</p>
          <Link to="/pages/authDetails.js">
            <input
              type="button"
              value="Login"
              onClick={handleSubmit}
            />
          </Link>
        </div>

        <Link
          className="login-register-swap"
          to="/pages/register.js"
        >
          Don't have an account yet?
        </Link>
      </div>
    </div>
  );
};

export default Login;
