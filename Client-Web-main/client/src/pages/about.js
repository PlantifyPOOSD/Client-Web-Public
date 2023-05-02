import React from "react";
import halfMonsteraImg from "../img/Monstera_half.png";
import MeetOurTeam from "../Components/MeetOurTeam";

<link
  rel="stylesheet"
  href="https://www.w3schools.com/w3css/4/w3.css"
></link>;

export default function About() {
  return (
    <div className="about">
      <div className="about-layout">
        <div className="about-us-container">
          <h1 id="about-us-header">About Us</h1>
          <p className="about-us-body">
            We are a group of students from the University of Central Florida.
            During a software development course, we were tasked with creating a
            Web and Mobile app from scratch throughout half of our Spring 2023
            semester. From this project, Plantify was born.
          </p>
        </div>
        <div className="half-Monstera">
          <img
            className="half-plant-background"
            src={halfMonsteraImg}
            alt=""
          />
        </div>
        <div className="about-devs-container">
          <MeetOurTeam />
        </div>
      </div>
    </div>
  );
}
