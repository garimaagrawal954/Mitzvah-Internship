import { React, useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

function ViewRecordsPage(props) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [s, sets] = useState(0);

  useEffect(() => {
    const val = JSON.parse(sessionStorage.getItem("user"));
    if (!val) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const val = JSON.parse(sessionStorage.getItem("user"));
        if (!val) return;

        // Get all devices (similar to /device-select)
        const devicesResponse = await axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/device-select", props);
        const devices = devicesResponse.data;

        const allRecords = [];

        // For each device, fetch additional info
        for (const device of devices) {
          const deviceId = device.uniqueId;

          const findPromise = axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/find", { id_view: deviceId });
          const checkiPromise = axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/checki", { id: deviceId });

          const [findRes, checkiRes] = await Promise.all([findPromise, checkiPromise]);

          const deviceData = {
            ...device,
            ...(findRes.data[0] || {}), // fallback to empty object
            status: checkiRes.data[0],   // ON / OFF
            fanstatus: checkiRes.data[1], // fan status if needed
          };

          allRecords.push(deviceData);
        }

        setRecords(allRecords);
      } catch (error) {
        console.error("Error fetching records", error);
      }
    }

    fetchData();
  }, [s]); // reloads when you click Search/Reload

  function display(event) {
    event.target.disabled = true;
    setTimeout(() => { event.target.disabled = false }, 2000);
    sets(s + 1);
  }

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const thTdStyle = {
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
  };

  const thStyle = {
    ...thTdStyle,
    backgroundColor: "#f2f2f2",
  };

  const trEvenStyle = {
    backgroundColor: "#f9f9f9",
  };

  return (
    <>
      <div className="search-bar">
        {/* Your Client, District, City, etc filters here */}
        <button id="search-button" onClick={display}>
          Search/Reload
        </button>
      </div>

      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Device Records</h1>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>SNo.</th>
              <th style={thStyle}>Device Name</th>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>District</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Sector</th>
              <th style={thStyle}>State</th>
              <th style={thStyle}>Pin Code</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Emergency</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.uniqueId} style={index % 2 === 0 ? trEvenStyle : {}}>
                <td style={thTdStyle}>{index + 1}</td>
                <td style={thTdStyle}>{record["device-name"]}</td>
                <td style={thTdStyle}>{record.uniqueId}</td>
                <td style={thTdStyle}>{record.client_select}</td>
                <td style={thTdStyle}>{record.district}</td>
                <td style={thTdStyle}>{record.city}</td>
                <td style={thTdStyle}>{record.location}</td>
                <td style={thTdStyle}>{record.sector}</td>
                <td style={thTdStyle}>{record.state}</td>
                <td style={thTdStyle}>{record.pincode}</td>

                {/* Dynamic Status Label */}
                <td style={thTdStyle}>
                  <span
                    style={{ padding: "5px", fontSize: "13px" }}
                    className={
                      "label label-" +
                      (record.status === "OFF" || !record.status
                        ? "warning"
                        : record.Power > 1000
                        ? "danger"
                        : "success")
                    }
                  >
                    {record.status === "OFF" || !record.status
                      ? "Inactive"
                      : record.Power > 1000
                      ? "Danger"
                      : "Active"}
                  </span>
                </td>

                {/* Emergency Button */}
                <td style={thTdStyle}>
                  <button
                    type="button"
                    className={`btn btn-${record.enum ? "danger" : "success"} mt-1`}
                    style={{ fontSize: "13px", padding: "5px" }}
                  >
                    {record.enum ? "Emergency" : "No Emergency"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViewRecordsPage;
