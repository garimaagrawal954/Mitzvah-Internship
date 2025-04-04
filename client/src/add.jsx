import React, { useState } from "react";
import axios from "axios";
import "./index.css";

function Add(props) {
  const [client, setClient] = useState([]);
  const [city, setCity] = useState([]);
  const [district, setDistrict] = useState([]);
  const [location, setLocation] = useState([]);
  const [flag, setFlag] = useState("");
  const [formValues, setFormValues] = useState({
    client: "",
    macAddress: "",
    device_name:""
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
    axios.get("https://test-gjac.onrender.com/client-select").then((res) => {
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
    if(state){
      let eventt={target:{id:id,value:""}}
      handleInputChange(eventt)
    }
  };
  const checkAdd = (event) => {
    event.preventDefault();
    const { client, macAddress, device_name } = formValues;

    if (!client || !macAddress || !device_name) {
      setFlag("Please fill all the fields");
    } 
    else if (macAddress.length !== 17) {
      setFlag(
        "Invalid Mac-Address Provided (Ensure there are no extra spaces before and after the written id)"
      );
    }
    else if(device_name.length !== 8 || ! /^\d+$/.test(device_name)){
      setFlag(
        "Invalid Device-name provided. Ensure the format is MMYYSSSS (M-> Month, Y-> Year, S-> Serial Number) and all the letters are digits only"
      );
    }
     else {
      axios
        .post("https://test-gjac.onrender.com/devicecheck", {
          id: macAddress,device_name:device_name
        })
        .then((res) => {
          if (res.data != "Ok") {
            // console.log(res.data);
            setFlag(res.data);
          } else {
            axios
              .post("https://test-gjac.onrender.com/add-data", formValues)
              .then((res) => {setFlag("Device Added Successfully")})
              .catch((err) => setFlag("Some Error Occured!"));
          }
        });
    }
  };
  function hideall(event) {
    if (event.target.id == "" || event.target.id == "header") {
      toggleDropdown("client", false);
    }
  }
  return (
    <div
      id="slider"
      style={props.slide === 1 ? { right: "0px" } : { right: "-360px" }}
      onClick={hideall}
    >
      <div id="header" style={{ height: '400px', overflowY:'auto' }}>
        <h2 onClick={props.here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Add New Device</h2>
        <p>
          Add the new devices for the listed clients. Can't find the client? Then, Create a new one first !!
        </p>
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
              required
            />
            {dropdowns.client && (
              <div className="custom-select-dropdown">
                {client.map((ele, index) => (
                  <div
                    key={index}
                    onClick={() => handleDropdownClick("client", ele)}
                  >
                    {ele}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            name="dname"
            type="text"
            placeholder="Enter Mac-address"
            id="macAddress"
            value={formValues.macAddress}
            onChange={handleInputChange}
            required
          />
          <input
            name="dname"
            type="text"
            placeholder="Enter Device name (MMYYSSSS)"
            id="device_name"
            value={formValues.device_name}
            onChange={handleInputChange}
            required
          />
          <p
            style={
              flag != "Device Added Successfully"
                ? { color: "red" }
                : { color: "green" }
            }
          >
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
