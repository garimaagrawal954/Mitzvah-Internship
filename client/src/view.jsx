import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function View(props) {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("OFF");
  const [deviceName, setDeviceName] = useState("");
  const [clientName, setClientName] = useState(""); // ✅ NEW

  // -------------------------------
  // FETCH DEVICE DATA
  // -------------------------------
  const fetchData = async () => {
    try {
      const [connRes, dataRes] = await Promise.all([
        axios.post("http://13.203.214.225:3000/checki", { id: props.id_view }),
        axios.post("http://13.203.214.225:3000/find", props)
      ]);

      setConnectionStatus(connRes.data?.[0] || "OFF");
      setData(dataRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // -------------------------------
  // TOGGLE STATUS + RELAY
  // -------------------------------
  const chit = async () => {
    if (!data[0]) return;

    const currentStatus = data[0].Status;

    try {
      await axios.post("http://13.203.214.225:3000/change", {
        id: props.id_view,
        st: currentStatus
      });

      await axios.post("http://13.203.214.225:3000/relayChange", {
        id: props.id_view,
        st: currentStatus
      });

      fetchData();
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to toggle device.");
    }
  };

  // -------------------------------
  // INITIAL LOAD + POLLING
  // -------------------------------
  useEffect(() => {
    if (props.login === "Out") {
      navigate("/home");
      return;
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);

    // ✅ Fetch device + client info
    axios.post("http://13.203.214.225:3000/device-select", {
      dname: props.id_view
    }).then(res => {
      if (res.data?.[0]) {
        setDeviceName(res.data[0]["device-name"] || "");
        setClientName(res.data[0]["client_select"] || ""); // ✅ NEW
      }
    }).catch(console.error);

    return () => clearInterval(interval);
  }, [props.id_view, props.login]);

  const isStatusOn = connectionStatus === "ON";
  const isDeviceOn = data[0]?.Status === 1;

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <>
      {data[0] ? (
        <div className="card-container">
          <div className="device-id">
            <h2 style={{  display: "inline" }}>
              Client: <span>{clientName}</span>
            </h2>

            <br />

            <h2 style={{ marginLeft: "-30px", display: "inline" }}>
              Device Id: <span>{deviceName}</span>
            </h2>

            <i
              className="fas fa-circle"
              style={{
                color: isStatusOn ? "green" : "red",
                marginLeft: "60px",
                fontSize: "10px"
              }}
            />
            <h4
              style={{
                color: isStatusOn ? "green" : "red",
                display: "inline",
                marginLeft: "5px",
                fontFamily: "cursive"
              }}
            >
              {isStatusOn ? "Online" : "Offline"}
            </h4>
          </div>

          <div className="separator"></div>

          <div className="value-container">
            {[
              ["Indoor_Temp", "thermometer-half", "Indoor Temperature", "°C"],
              ["Outdoor_Temp", "sun", "Outdoor Temperature", "°C"],
              ["Head_Count", "door-open", "Head Count", ""],
              ["RPM", "tachometer-alt", "RPM", ""],
              ["Power", "bolt", "Power", ""]
            ].map(([key, icon, label, unit]) => (
              <div key={key}>
                <div className="value-circle">
                  <div>
                    {isStatusOn && isDeviceOn ? Math.round(data[0][key] || 0) : ""}
                    {unit}
                  </div>
                  <div>
                    <i className={`fas fa-${icon}`}></i>
                  </div>
                </div>
                <div className="value-name">{label}</div>
              </div>
            ))}

            <div>
              <div className="value-circle">
                <div>{isDeviceOn ? "ON" : "OFF"}</div>
                <div><i className="fas fa-power-off"></i></div>
              </div>
              <div className="value-name">Status</div>
            </div>
          </div>

          <div className="button-container">
            {props.login === "Admin" && (
              <button onClick={chit}>Change Status</button>
            )}
            <button onClick={fetchData}>Refresh</button>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => navigate(`/device-history/${data[0].uniqueId}`)}
            >
              See History
            </button>
          </div>

          <hr />
          <p style={{ fontFamily: "Times New Roman", fontSize: "20px" }}>
            {data[0].current_dt
              ? "Last Updated Data on : " +
                format(new Date(data[0].current_dt), "yyyy-MM-dd HH:mm:ss")
              : "Can't fetch the last date and time"}
          </p>
        </div>
      ) : (
        <h2 align="center" style={{ fontFamily: "cursive", marginTop: "220px" }}>
          Oops!! Can't fetch the data. The device is not activated yet!...
        </h2>
      )}
    </>
  );
}

export default View;