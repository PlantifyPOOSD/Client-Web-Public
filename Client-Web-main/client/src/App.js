// Components
import Navbar from "./Components/Navbar";
import NavbarLoggedIn from "./Components/NavbarLoggedIn";

// CSS for Pages
import "./App.css";
import "./css/home.css";
import "./css/loginRegister.css";
import "./css/plant.css";
import "./css/profile.css";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import AuthDetails from "./pages/authDetails";
import PlantBase from "./pages/plantbase";
import AddPlant from "./pages/addPlant";
import EditPlant from "./pages/editPlant";
import Plant from "./pages/plant";
import About from "./pages/about";
import Profile from "./pages/profile";
import EditUser from "./pages/EditUser";
import AuthSuccess from "./pages/authSuccess";
import AuthError from "./pages/authError";
import TodoList from "./pages/todoList";
import ResetPass from "./pages/resetPass";

// Utility
import { Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase.ts";

function App() {
  const [authUser, setAuthUser] = useState(null);
  
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

  return (
    <div className="App">
      {authUser ? <NavbarLoggedIn /> : <Navbar />}

      <div className="container">
        <Routes>
          <Route
            exact
            path="/"
            element={<Home />}
          />
          <Route
            path="pages/home.js"
            element={<Home />}
          />
          <Route
            path="pages/about.js"
            element={<About />}
          />
          <Route
            path="pages/plantbase.js"
            element={<PlantBase />}
          />
          <Route
            path="pages/login.js"
            element={<Login />}
          />
          <Route
            path="pages/register.js"
            element={<Register />}
          />
          <Route
            path="pages/authDetails.js"
            element={<AuthDetails />}
          />
          <Route
            path="pages/addPlant.js"
            element={<AddPlant />}
          />
          <Route
            path="pages/editPlant.js"
            element={<EditPlant />}
          />
          <Route
            path="pages/plant.js"
            element={<Plant />}
          />
          <Route
            path="pages/profile.js"
            element={<Profile />}
          />
          <Route
            path="pages/EditUser.js"
            element={<EditUser />}
          />
          <Route
            path="pages/authSuccess.js"
            element={<AuthSuccess />}
          />
          <Route
            path="pages/authError.js"
            element={<AuthError />}
          />

          <Route
            path="pages/todoList.js"
            element={<TodoList />}
          />
    
        <Route
            path="pages/resetPass.js"
            element={<ResetPass />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
