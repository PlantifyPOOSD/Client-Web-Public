import halfMonsteraImg from "../img/Monstera_half.png";
import care from "../img/care-about.png";
import share from "../img/share-about.png";

<link
  rel="stylesheet"
  href="https://www.w3schools.com/w3css/4/w3.css"
></link>;

export default function Home() {
  return (
    <div className="about">
      <div className="about-layout">
        <div className="half-Monstera">
          <img
            className="half-plant-background"
            src={halfMonsteraImg}
            alt=""
          />
        </div>
        <div className="about-container">
          <div className="about-item">
            <h1 className="about-header">Care for your plants.</h1>
            <p className="about-paragraph">
              <span>
                {" "}
                Learn by getting instructions <br></br>
                on how to care for your plants. <br></br>
              </span>
            </p>
            <img
              className="care"
              src={care}
              alt="care feature"
            />
          </div>
          <div className="about-item">
            <div className="build-text">
              <h1 className="about-header">Build a community.</h1>
              <p className="about-paragraph">
                <span>
                  {" "}
                  Show off your plantbase to<br></br>
                  your friends and other plant lovers.<br></br>
                </span>
              </p>
            </div>
            <img
              className="share"
              src={share}
              alt="share feature"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
