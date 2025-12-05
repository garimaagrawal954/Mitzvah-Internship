import { React, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

function Adclient({ slide, here }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    login: "",
  });
  const [changing, setchan] = useState(0);
  const [chaname, setname] = useState(0);
  const [checkpw, setpw] = useState(0);
  const [called, setcall] = useState(0);
  const [done, setdone] = useState(-1);
  const [message, setmessage] = useState("");
  const [me, setme] = useState(0);

  function handleChange(event) {
    setmessage("");
    setFormData((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
    if (event.target.id === "username") {
      setcall(1);
    } else if (event.target.id === "name") {
      setcall(-2);
    } else {
      setcall(-1);
    }
  }

  function adcl(event) {
    event.preventDefault();
    if (
      chaname === 1 &&
      changing === 1 &&
      checkpw === 1 &&
      formData.login !== "" &&
      (formData.login === "Client" || formData.login === "Admin")
    ) {
      axios
        .post("http://13.203.214.225:3000/add2", formData)
        .then(() => {
          setdone(1);
          setchan(0);
          setname(0);
        })
        .catch(() => {
          setdone(0);
        });
    } else {
      setdone(-2);
    }
  }

  useEffect(() => {
    if (called === 1) {
      if (formData.username) {
        axios
          .post("http://13.203.214.225:3000/get-name", {
            username: formData.username,
            client_name: formData.name,
          })
          .then((res) => {
            setchan(res.data === "Invalid" || formData.username === "" ? 1 : 0);
          });
      }
    } else if (called === -1) {
      setpw(
        formData.password.match(
          /^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[^a-zA-Z0-9])(?!.*\s).{8,15}$/
        )
          ? 1
          : 1
      );
    } else if (called === -2 && formData.name) {
      axios
        .post("http://13.203.214.225:3000/get-name", { client_name: formData.name })
        .then((res) => {
          setname(res.data === "Ok name" ? 1 : 0);
        });
    }
    setcall(0);
  }, [called, formData]);

  useEffect(() => {
    if (done !== -1) {
      setmessage(
        done === 1
          ? "Client Added Successfully"
          : done === -2
          ? "All fields are mandatory and must be correct and unique fulfilling all the criteria."
          : done === 3
          ? "A Client with this name already exists."
          : "Some error occurred. Please try again"
      );
    }
    setdone(-1);
  }, [done]);

  function selectone(event) {
    setmessage("");
    setFormData((prev) => ({
      ...prev,
      login: event.target.id,
    }));
  }

  return (
    <div
      id="slider"
      onClick={(e) => hideall(e)}
      style={{
        position: "fixed",
        top: 400,
        right: slide === 1 ? "0" : "-360px",
        height: "70vh",
        width: "100%",
        maxWidth: "360px",
        backgroundColor: "#fff",
        zIndex: 999,
        overflowY: "auto",
        transition: "right 0.5s ease-in-out",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div id="header">
        <h2 onClick={here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Add New User</h2>
        <p>
          Please fill out the form below and we will get back to you as soon as
          possible.
        </p>
        <form id="contact-form" onSubmit={adcl}>
          <input
            name="username"
            type="text"
            placeholder="Enter username"
            id="username"
            onChange={handleChange}
            required
          />
          {changing === 1 ? (
            <i className="fas fa-check-circle text-success" style={checkStyle}></i>
          ) : (
            <i className="fas fa-times-circle text-danger" style={checkStyle}></i>
          )}
          <input
            name="password"
            type="text"
            placeholder="Provide a strong password"
            id="password"
            onChange={handleChange}
            required
          />
          {checkpw === 1 ? (
            <i className="fas fa-check-circle text-success" style={pwStyle}></i>
          ) : (
            <i className="fas fa-times-circle text-danger" style={pwStyle}></i>
          )}
          <ul style={{ color: "black" }}>
            <p>At least 8 characters long password</p>
            <p>
              A combination of uppercase, lowercase letters, numbers, and
              symbols.
            </p>
          </ul>
          <div style={{ paddingLeft: "80px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{ display: "flex", alignItems: "center", marginRight: "20px" }}
              >
                <input
                  type="radio"
                  name="ok"
                  id="Admin"
                  onClick={(e) => {
                    setme(0);
                    selectone(e);
                  }}
                  required
                />
                <label style={{ color: "black", marginLeft: "5px" }} htmlFor="Admin">
                  Admin
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="radio"
                  name="ok"
                  id="Client"
                  onClick={(e) => {
                    setme(1);
                    selectone(e);
                  }}
                />
                <label style={{ color: "black", marginLeft: "5px" }} htmlFor="Client">
                  Client
                </label>
              </div>
            </div>
          </div>
          {me === 1 && (
            <>
              <input
                type="text"
                placeholder="Enter Unique Client Name"
                id="name"
                onChange={handleChange}
                required
              />
              {chaname === 1 ? (
                <i className="fas fa-check-circle text-success" style={nameStyle}></i>
              ) : (
                <i className="fas fa-times-circle text-danger" style={nameStyle}></i>
              )}
            </>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            id="form-submit"
            style={submitButtonStyle}
          >
            Submit
          </button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

Adclient.propTypes = {
  slide: PropTypes.number.isRequired,
  here: PropTypes.func.isRequired,
};

const checkStyle = { marginLeft: "10px" };
const pwStyle = { marginLeft: "10px" };
const nameStyle = { marginLeft: "10px" };
const submitButtonStyle = {
  backgroundColor: "#149ddd",
  border: "none",
  borderRadius: "4px",
  padding: "10px 20px",
};

export default Adclient;