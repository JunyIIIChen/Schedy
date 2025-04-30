import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import signin1 from "../Component/Assets/signin1.png";
// import signin2 from "../Component/Assets/signin2.png";

const LoginSignup = () => {

  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({username:"",email:"",password:""});

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    }

  const login = async () => {
    let dataObj;
    await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {dataObj=data});
      console.log(dataObj);
      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        window.location.replace("/homepage");
      }
      else
      {
        alert(dataObj.errors)
      }
  }

  const signup = async () => {
    let dataObj;
    await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {dataObj=data});

      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        window.location.replace("/OnboardingPage");
      }
      else
      {
        alert(dataObj.errors)
      }
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up"?<input type="text" placeholder="Your name" name="username" value={formData.username} onChange={changeHandler}/>:<></>}
          <input type="email" placeholder="Email address" name="email" value={formData.email} onChange={changeHandler}/>
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={changeHandler}/>
        </div>

        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>

        {state==="Login"?
        <p className="loginsignup-login">Create an account? <span onClick={()=>{setState("Sign Up")}}>Click here</span></p>
        :<p className="loginsignup-login">Already have an account? <span onClick={()=>{setState("Login")}}>Login here</span></p>}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
      </div>
      <div className="loginsignup-right">
        <img className="signin-image frame8" src={signin1} alt=""/>
        {/*<img className="frame8" src={signin2} alt=""/>*/}

      </div>
    </div>
  );
};

export default LoginSignup;
