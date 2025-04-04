import { React, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types"; // To add prop validation

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
  const [district, setDistrict] = useState([]);
  const [city, setCity] = useState([]);
  const [location, setLocation] = useState([]);
  const [formValues, setFormValues] = useState({
    district: "",
    city: "",
    location: "",
  });
  const [dropdowns, setDropdowns] = useState({
    district: false,
    city: false,
    location: false,
  });

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));

    if (id === "district") {
      fetchDistricts(value);
    } else if (id === "location") {
      fetchLocations(value);
    } else if (id === "city") {
      fetchCities(value);
    }
  };

  const fetchDistricts = (value) => {
    axios.post("https://test-gjac.onrender.com/get-dist", { dis_name: value })
      .then((res) => {
        setDistrict(res.data);
      });
  };

  const fetchLocations = (value) => {
    axios.get("https://test-gjac.onrender.com/location-select")
      .then((res) => {
        const filteredLocations = res.data.filter((name) =>
          name.toLowerCase().includes(value.toLowerCase())
        );
        setLocation(filteredLocations.length > 0 ? filteredLocations : [value]);
      });
  };

  const fetchCities = (value) => {
    axios.post("https://test-gjac.onrender.com/get-cities", { name: value })
      .then((res) => {
        setCity(res.data.results);
      });
  };

  const handleDropdownClick = (id, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
    toggleDropdown(id, false);
  };

  const toggleDropdown = (id, state) => {
    setDropdowns((prevDropdowns) => ({
      ...prevDropdowns,
      [id]: state,
    }));
    if (state) {
      let eventt = { target: { id: id, value: "" } };
      handleInputChange(eventt);
    }
  };

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
    if (chaname === 1 && changing === 1 && checkpw === 1 && formData.login !== "" &&
      ((formData.login === "Client" && formValues.district !== "" && formValues.location !== "" && formValues.city !== "") || (formData.login === "Admin"))) {
      const dataToSend = formData.login === "Client" ? { ...formData, ...formValues } : formData;
      axios.post("https://test-gjac.onrender.com/add2", dataToSend)
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
        axios.post("https://test-gjac.onrender.com/get-name", {
          username: formData.username,
          client_name: formData.name,
        }).then((res) => {
          setchan(res.data === "Invalid" || formData.username === "" ? 1 : 0);
        });
      }
    } else if (called === -1) {
      setpw(
        formData.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/)
          ? 1
          : 0
      );
    } else if (called === -2 && formData.name) {
      axios.post("https://test-gjac.onrender.com/get-name", { client_name: formData.name })
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
      id="slider" onClick={(e) => hideall(e)}
      style={
        slide === 1
          ? { transition: "right 0.5s ease-in-out", right: "0", overflow: "hidden" }
          : { transition: "right 0.5s ease-in-out", right: "-360px", overflow: "hidden" }
      }
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
        <p>Please fill out the form below and we will get back to you as soon as possible.</p>
        <form id="contact-form" onSubmit={adcl}>
          <input
            name="username"
            type="email"
            placeholder="Enter username / email"
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
            <p>A combination of uppercase, lowercase letters, numbers, and symbols.</p>
          </ul>
          <div style={{ paddingLeft: "80px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                <input type="radio" name="ok" id="Admin" onClick={(e) => { setme(0); selectone(e); }} required />
                <label style={{ color: "black", marginLeft: "5px" }} htmlFor="Admin">Admin</label>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input type="radio" name="ok" id="Client" onClick={(e) => { setme(1); selectone(e); }} />
                <label style={{ color: "black", marginLeft: "5px" }} htmlFor="Client">Client</label>
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
              <DropdownInput
                id="district"
                label="Select District"
                value={formValues.district}
                options={district}
                isOpen={dropdowns.district}
                handleInputChange={handleInputChange}
                handleDropdownClick={handleDropdownClick}
                toggleDropdown={toggleDropdown}
              />
              <DropdownInput
                id="city"
                label="Select City"
                value={formValues.city}
                options={city}
                isOpen={dropdowns.city}
                handleInputChange={handleInputChange}
                handleDropdownClick={handleDropdownClick}
                toggleDropdown={toggleDropdown}
              />
              <DropdownInput
                id="location"
                label="Select Location"
                value={formValues.location}
                options={location}
                isOpen={dropdowns.location}
                handleInputChange={handleInputChange}
                handleDropdownClick={handleDropdownClick}
                toggleDropdown={toggleDropdown}
              />
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

// Common styles
const checkStyle = { marginLeft: "10px" };
const pwStyle = { marginLeft: "10px" };
const nameStyle = { marginLeft: "10px" };
const submitButtonStyle = { backgroundColor: "#149ddd", border: "none", borderRadius: "4px", padding: "10px 20px" };

function DropdownInput({ id, label, value, options, isOpen, handleInputChange, handleDropdownClick, toggleDropdown }) {
  return (
    <div className="dropdown" style={{ marginTop: "30px" }}>
      <input
        id={id}
        type="text"
        className="dropdown-toggle"
        placeholder={label}
        value={value}
        onClick={() => toggleDropdown(id, true)}
        onChange={handleInputChange}
      />
      {isOpen && (
        <ul className="dropdown-menu" style={{ display: "block" }}>
          {options.map((option, idx) => (
            <li key={idx} onClick={() => handleDropdownClick(id, option)}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

DropdownInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleDropdownClick: PropTypes.func.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
};

export default Adclient;
