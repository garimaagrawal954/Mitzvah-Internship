import { React, useState, useEffect } from "react";
import axios from "axios";
function Delcl(props) {
  const [formdata, setformdata] = useState({
    mac: "",
    name: "",
    username: "",
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [done, setdone] = useState(-1);
  const handleChange = (event) => {
    setShowForm(false);
    setMessage("");
    const { id, value } = event.target;
    setformdata((prev) => ({ ...prev, [id]: value }));
  };
  const handleSearch = () => {
    if (!formdata.username) {
      setMessage("Please enter a existing username.");
      setShowForm(false);
    }
    else{
      // console.log("Hi");
    axios
      .post("https://test-gjac.onrender.com/get-name", {
        username: formdata.username,
      })
      .then((res) => {
        if (!(res.data=="Invalid")) {
          setMessage("User found. Are you sure you want to delete this user?");
          setShowForm(true);
        } else {
          setMessage("User not found.");
          setShowForm(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("An error occurred while searching for the user.");
        setShowForm(false);
      });}
  };
  function deleteit() {
    axios
      .post("https://test-gjac.onrender.com/delete-client", {
        username: formdata.username,
      })
      .then((res) => {
        setdone(1);
      })
      .catch((err) => {
        setdone(0);
        console.log(err);
      });
  }
  useEffect(() => {
    if (done != -1) {
      if (done == 1) {
        setMessage("User Removed Successfully");
        setShowForm(false);
      } else {
        setMessage("Some Error Occurred. Please try again");
      }
    }
    setdone(-1);
  }, [done]);
  return (
    <div
      id="slider"
      style={props.slide === 1 ? { right: "0px" } : { right: "-360px" }}
    >
      <div id="header">
        <h2 onClick={props.here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Remove a User</h2>
        <p>Enter the username of user you want to remove.</p>
        <div className="custom-select-container">
          <input
            type="text"
            id="username"
            placeholder="Enter username of user"
            value={formdata.username}
            onChange={handleChange}
            autoComplete="off"
            style={{
              color: "black",
              paddingRight: "100px",
              paddingTop: "5px",
              marginBottom: "10px",
            }}
            required
          />
          <button
            style={{ marginTop: "20px" }}
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {message && (
          <p
            style={{
              color: message.includes("not found") ? "red" : "green",
              paddingTop: "10px",
            }}
          >
            {message}
          </p>
        )}
        {showForm && (
          <button
            type="button"
            className="btn btn-danger mt-2"
            onClick={deleteit}
          >
            Remove client
          </button>
        )}
      </div>
    </div>
  );
}

export default Delcl;
