import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function Update(props) {
  const [formdata, setformdata] = useState({
    mac: "",
    client: "",
    macAddress: "",
    device_name: "",
  });
  const [dropdowns, setDropdowns] = useState({
    client: false,
  });
  const [clientOptions, setClient] = useState([]);
  const [message, setMessage] = useState("");
  const [flag, setFlag] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [temp_dn, settemp_dn] = useState("");

  const handleChange = (event) => {
    setFlag("")
    const { id, value } = event.target;
    setformdata((prev) => ({ ...prev, [id]: value }));

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

  const handleSearch = () => {
    if (!formdata.mac) {
      setMessage("Please enter a MAC address.");
      setShowForm(false);
      return;
    }

    axios
      .post("https://test-gjac.onrender.com/devicecheck", {
        id: formdata.mac,
      })
      .then((res) => {
        if (res.data != "Ok") {
          settemp_dn(res.data["device-name"])
          setMessage("Device found. You can update the details.");
          setformdata({
            client: res.data.client_select,
            macAddress: res.data.uniqueId,
            device_name: res.data["device-name"],
          });
        } else {
          setMessage("Device not found. Remove any extra spaces");
          setShowForm(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("An error occurred while searching for the device.");
        setShowForm(false);
      });
  };
  const handleDropdownClick = (id, value) => {
    setformdata((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
    // console.log(id);
    toggleDropdown(id, false);
  };
  useEffect(() => {
    if (message == "Device found. You can update the details.") {
      setShowForm(true);
    }
  }, [message]);

  const handleUpdate = (event) => {
    event.preventDefault();
    const { client, macAddress, device_name } =
      formdata;
    if (!client ||  !macAddress || !device_name) {
      setMessage("Please fill all the fields.");
      return;
    } else if (macAddress.length !== 17) {
      setFlag(
        "Invalid Mac-Address Provided (Ensure there are no extra spaces before and after the written id)"
      );
    } else if (device_name.length !== 8 || !/^\d+$/.test(device_name)) {
      setFlag(
        "Invalid Device-name provided. Ensure the format is MMYYSSSS (M-> Month, Y-> Year, S-> Serial Number) and all the letters are digits only"
      );
    } else {
      axios
        .post("https://test-gjac.onrender.com/devicecheck", {
          device_name: device_name,
        })
        .then((res) => {
          if (res.data != "Ok" && temp_dn!=device_name) {
            // console.log(res.data);
            setFlag(res.data);
          } else {
            axios
              .post("https://test-gjac.onrender.com/add-data", formdata)
              .then((res) => {
                setFlag("Device Updated Successfully");
              })
              .catch((err) => setFlag("Some Error Occured!"));
          }
        });
    }
    // axios
    //   .post("https://test-gjac.onrender.com/update-device", { mac, client, city, district, location })
    //   .then((res) => {
    //     setMessage(res.data.message || "Device updated successfully.");
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     setMessage("An error occurred while updating the device.");
    //   });
  };
  const toggleDropdown = (id, state) => {
    setDropdowns((prevDropdowns) => ({
      ...prevDropdowns,
      [id]: state,
    }));
  };
  function hideall(event) {
    // console.log(event.target.id);
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
      <div id="header">
        <h2 onClick={props.here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Update a Device</h2>
        <p>Enter the MAC address to find the device you want to update.</p>
        <div className="custom-select-container">
          <input
            type="text"
            id="mac"
            placeholder="Enter Mac-address"
            value={formdata.mac}
            onChange={handleChange}
            autoComplete="off"
            style={{ color: "black", paddingRight: "100px", paddingTop: "5px" }}
            required
          />
          <button
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
          <form id="contact-form" onSubmit={handleUpdate}>
            <div className="custom-select-container">
              <input
                type="text"
                id="client"
                placeholder="Change Client Name"
                value={formdata.client}
                onChange={handleChange}
                onFocus={() => toggleDropdown("client", true)}
                required
              />
              {dropdowns.client && (
                <div className="custom-select-dropdown">
                  {clientOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleDropdownClick("client", option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="custom-select-container">
              <input
                type="text"
                id="device_name"
                placeholder="Enter Device name"
                value={formdata.device_name}
                onChange={handleChange}
                required
              />
            </div>
            <p
              style={
                flag != "Device Updated Successfully"
                  ? { color: "red" }
                  : { color: "green" }
              }
            >
              {flag}
            </p>
            <button type="submit">Update Device</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Update;
