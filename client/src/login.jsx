/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login(props) {
  const [type, settype] = useState(0);
  const [type2, settype2] = useState(0);
  const navigate = useNavigate();
  const [msg, setmsg] = useState("");
  const [userinput, setinput] = useState({ username: "", password: "" });
  const [clientinput, setclient] = useState({ username: "", password: "" });

  // Redirect if user is already logged in
  useEffect(() => {
    const val = sessionStorage.getItem("user");
    if (val) {
      navigate("home");
    }
  }, [navigate]);  // Added `navigate` to dependencies

  // Handles login
  function enter(event) {
    event.preventDefault();
    if (event.target.id === "Admin") {
      axios
        .post("https://test-gjac.onrender.com/login", {
          userinput,
          flag: "admin",
        })
        .then((res) => {
          if (res.data === "success") {
            sessionStorage.setItem("user", JSON.stringify(userinput));
            props.setinput(event.target.id);
            navigate("home");
            window.location.reload();
          } else {
            setmsg(res.data);
          }
        })
        //.catch((err) => {
          //console.error(err);
        //});
    } else {
      axios
        .post("https://test-gjac.onrender.com/login", {
          clientinput,
          flag: "client",
        })
        .then((res) => {
          if (res.data.Name) {
            sessionStorage.setItem("user", JSON.stringify(clientinput));
            sessionStorage.setItem(
              "filter",
              JSON.stringify({
                cs: "",
                ds: "",
                cis: "",
                ls: "",
                rs: "",
                ds: "",
              })
            );
            navigate("home");
            window.location.reload();
          } else {
            setmsg(res.data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  // Updates userinput state for Admin login
  function fillme(event) {
    setinput({ ...userinput, [event.target.name]: event.target.value });
  }

  // Updates clientinput state for Client login
  function fillmee(event) {
    setclient({ ...clientinput, [event.target.name]: event.target.value });
  }

  // Toggles between login forms
  function checkitt(event) {
    const container = document.getElementById("container-login");
    if (event.target.id === "signUp") {
      container.classList.add("right-panel-active");
    } else {
      container.classList.remove("right-panel-active");
    }
  }

  return (
    <div className="ok">
      <div className="container" id="container-login">
        <div className="form-container sign-up-container">
          <form>
            <h1>Client Login</h1>
            <div className="social-container">
              <a className="social">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="social">
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a className="social">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            <input
              type="email"
              placeholder="Enter username: Client"
              name="username"
              value={clientinput.username}
              onChange={fillmee}
            />
            <div style={{ width: "100%" }}>
              <input
                type={type === 0 ? "password" : "text"}
                placeholder="Enter Password: Client@12345"
                name="password"
                value={clientinput.password}
                onChange={fillmee}
              />
              <i
                id="togglePassword"
                className="fas fa-eye-slash"
                onClick={(event) => {
                  settype(type === 0 ? 1 : 0);
                  event.target.classList.toggle("fa-eye");
                  event.target.classList.toggle("fa-eye-slash");
                }}
                style={{
                  position: "absolute",
                  marginTop: "24px",
                  marginLeft: "-29px",
                  cursor: "pointer",
                }}
              ></i>
            </div>
            {msg && <p style={{ color: "red" }}>{msg}</p>}
            <button id="Client" onClick={enter}>
              Sign In
            </button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form>
            <h1>Admin Login</h1>
            <div className="social-container">
              <a className="social">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="social">
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a className="social">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your account</span>
            <input
              type="email"
              placeholder="Enter username: Admin"
              name="username"
              value={userinput.username}
              onChange={fillme}
            />
            <div style={{ width: "100%" }}>
              <input
                type={type2 === 0 ? "password" : "text"}
                placeholder="Enter password: Admin@123"
                name="password"
                value={userinput.password}
                onChange={fillme}
              />
              <i
                id="togglePassword"
                className="fas fa-eye-slash"
                onClick={(event) => {
                  settype2(type2 === 0 ? 1 : 0);
                  event.target.classList.toggle("fa-eye");
                  event.target.classList.toggle("fa-eye-slash");
                }}
                style={{
                  position: "absolute",
                  marginTop: "24px",
                  marginLeft: "-29px",
                  cursor: "pointer",
                }}
              ></i>
            </div>
            {msg && <p style={{ color: "red" }}>{msg}</p>}
            <button id="Admin" onClick={enter}>
              Sign In
            </button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={checkitt}>
                Admin Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" id="signUp" onClick={checkitt}>
                Client Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
