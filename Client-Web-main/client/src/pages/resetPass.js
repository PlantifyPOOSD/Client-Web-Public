import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ResetPass = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');

    const [successfulLogin, setSuccessfulLogin] = useState(false);

    
    const handleChange = (e) => {
        setEmail({email: e.target.value});
        console.log(email);
      };
    
    const passwordReset = () =>{
        sendPasswordResetEmail(auth, email.email)
        .then(() => {
            console.log("email sent successfuly");

            // Set the login in order to show the message
            setSuccessfulLogin(true);
            // Have a 2 second delay 
            const secondsDelay = 5;
            setTimeout(() => setSuccessfulLogin(false), secondsDelay * 1000);
            setTimeout(() => navigate("/pages/login.js"), (secondsDelay) * 1000);
            console.log("successful Login: " + successfulLogin);
        })
        .catch((error) => {
            console.log(error.message);
        });
    }

    function generateMessage() {

        if (successfulLogin)
        {
            return (
                <div>  
                    <h2 className="success">Success! Password reset sent to email</h2>
                    <hr />
                </div>
            );
        }    
        else
        {
            return (
                <div>  
                    <h2 className="error">Error! Failed to send reset to email</h2>
                    <hr />
                </div>
            );
        }
    }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 id="plantify">Plantify.</h1>
          <h2>Enter your email below to reset your password</h2>
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
            onChange={handleChange}
            placeholder="example@gmail.com"
            />
            <input
                type="button"
                value="Send"
                onClick={passwordReset}
                
            />
            
        </div>
        <div>{successfulLogin && generateMessage()}</div>
      </div>
    </div>
  );
};

export default ResetPass;
