/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setinput }) {
  const [userInput, setUserInput] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const val = sessionStorage.getItem("user");
    if (val) navigate("home");
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMsg("");

    try {
      debugger;

      const roleResponse = await axios.post("http://13.203.214.225:3000/user-role", {
        name: userInput.username,
      });

      const role = roleResponse.data.role;
      const flag = role === "client" ? "client" : "admin";

      const res = await axios.post("http://13.203.214.225:3000/login", {
        [flag === "client" ? "clientinput" : "userinput"]: userInput,
        flag,
      });

      if (res.data === "success" || res.data.Name) {
        sessionStorage.setItem("user", JSON.stringify(userInput));
        if (flag === "client") {
          sessionStorage.setItem(
            "filter",
            JSON.stringify({
              cs: "",
              ds: "",
              cis: "",
              ls: "",
              rs: "",
            })
          );
        }
        setinput && setinput(flag);
        navigate("home");
        window.location.reload();
      } else {
        setMsg(res.data);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMsg("Login failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "top",
        background: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(to top right, #00c853, #00e676)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          maxHeight: "400px",
          marginTop: "80px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h1>
          <span style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
            Enter your credentials
          </span>

          <input
            type="text"
            placeholder="Username"
            name="username"
            value={userInput.username}
            onChange={(e) =>
              setUserInput({ ...userInput, username: e.target.value })
            }
            required
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={userInput.password}
              onChange={(e) =>
                setUserInput({ ...userInput, password: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
            <i
              className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#777",
              }}
            />
          </div>

          {msg && (
            <p style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>
              {msg}
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2575fc",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1a5ed8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2575fc")}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
