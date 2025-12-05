// Add.jsx
import React, { useState } from "react";
import axios from "axios";
import "./index.css";

function Add(props) {
  const [client, setClient] = useState([]);
  const [flag, setFlag] = useState("");
  const [formValues, setFormValues] = useState({
    client: "",
    macAddress: "",
    device_name: "",
    district: "",
    city: "",
    location: "",
    sector: "",
    state: "",
    pincode: ""
  });
  const [dropdowns, setDropdowns] = useState({
    client: false,
  });

  const handleInputChange = (event) => {
    setFlag("");
    const { id, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));

    if (id === "client") {
      fetchClients(value);
    }
  };

  const fetchClients = (value) => {
    axios.get("http://13.203.214.225:3000/client-select").then((res) => {
      const filteredClients = res.data.filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setClient(filteredClients.length > 0 ? filteredClients : []);
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

  const checkAdd = (event) => {
    event.preventDefault();
    const {
      client,
      macAddress,
      device_name,
    } = formValues;

    if (!client || !macAddress || !device_name) {
      setFlag("Please fill all the required fields (Client, MAC, Device Name)");
    } else if (macAddress.length !== 17) {
      setFlag("Invalid Mac-Address Provided (Ensure no extra spaces)");
    } else if (device_name.length !== 8 || !/^\d+$/.test(device_name)) {
      setFlag("Invalid Device-name. Format should be MMYYSSSS (8 digits).");
    } else {
      axios
        .post("http://13.203.214.225:3000/devicecheck", {
          id: macAddress,
          device_name: device_name
        })
        .then((res) => {
          if (res.data !== "Ok") {
            setFlag(res.data);
          } else {
            axios
              .post("http://13.203.214.225:3000/add-data", formValues)
              .then(() => setFlag("Device Added Successfully"))
              .catch(() => setFlag("Some Error Occurred!"));
          }
        });
    }
  };

  function hideall(event) {
    if (event.target.id === "" || event.target.id === "header") {
      toggleDropdown("client", false);
    }
  }

  return (
    <div
      id="slider"
      style={props.slide === 1 ? { right: "0px" } : { right: "-360px" }}
      onClick={hideall}
    >
      <div id="header" style={{ height: '90vh', overflowY: 'auto' }}>
        <h2 onClick={props.here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Add New Device</h2>
        <p>Add the new devices for the listed clients. Can't find the client? Create one first!</p>
        <form id="contact-form">
          <div className="custom-select-container">
            <input
              type="text"
              id="client"
              placeholder="Choose the Client Name"
              value={formValues.client}
              onFocus={() => toggleDropdown("client", true)}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {dropdowns.client && (
              <div className="custom-select-dropdown">
                {client.map((ele, index) => (
                  <div key={index} onClick={() => handleDropdownClick("client", ele)}>
                    {ele}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Enter Mac-address"
            id="macAddress"
            value={formValues.macAddress}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter Device name (MMYYSSSS)"
            id="device_name"
            value={formValues.device_name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter District (optional)"
            id="district"
            value={formValues.district}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter City (optional)"
            id="city"
            value={formValues.city}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter Location (optional)"
            id="location"
            value={formValues.location}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter Sector (optional)"
            id="sector"
            value={formValues.sector}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter State (optional)"
            id="state"
            value={formValues.state}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter Pincode (optional)"
            id="pincode"
            value={formValues.pincode}
            onChange={handleInputChange}
          />

          <p style={flag !== "Device Added Successfully" ? { color: "red" } : { color: "green" }}>
            {flag}
          </p>
          <button type="submit" onClick={checkAdd}>
            Add the Device
          </button>
        </form>
      </div>
    </div>
  );
}

export default Add;