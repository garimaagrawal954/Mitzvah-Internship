import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function View(props) {
  const navigate = useNavigate();
  const [data, setdata] = useState([]);
  const [con, setcon] = useState('');
  const [deviceName, setDeviceName] = useState('');

  // ✅ Toggle device relay status via backend and send to ESP32
  async function chit() {
    if (!data[0]) return;

    const currentStatus = data[0]["Status"]; // 0 or 1

    try {
      // 1. Call your existing backend logic to change status
      const res = await axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/change", {
        id: props.id_view,
        st: currentStatus
      });
      console.log("Status changed:", res.data);

      // 2. Call /relayChange to send relayStatus to ESP32 over WebSocket
      const relayRes = await axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/relayChange", {
        id: props.id_view,
        st: currentStatus
      });
      console.log("Relay status sent:", relayRes.data);

      // ✅ Refresh data from backend
      chitt();
    } catch (err) {
      console.error("Error toggling status or sending relay:", err);
      alert("Failed to toggle or send relay status.");
    }
  }

  // 🔄 Refresh data from backend
  function chitt() {
    axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/checki", {
      id: props.id_view
    }).then((res) => {
      setcon(res.data);
    }).catch((e) => {
      console.error("Error fetching connection info:", e);
    });

    axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/find", props)
      .then((res) => {
        setdata(res.data);
      }).catch((e) => {
        console.error("Error fetching device data:", e);
      });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      document.getElementById("refresh_button").click();
    }, 4050);

    if (props.login === "Out") {
      navigate("/home");
    } else {
      chitt();
      axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/device-select", {
        dname: props.id_view
      })
        .then((res) => {
          if (res.data.length && res.data[0]) {
            setDeviceName(res.data[0]["device-name"]);
          }
        })
        .catch(console.error);
    }

    return () => clearInterval(interval);
  }, [props]);

  useEffect(() => {
    if (data[0] && data[0].Power !== undefined) {
      updateFailureStatus(data[0].Power);
    }
  }, [data]);

  function updateFailureStatus(power) {
    axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/check-power", {
      id: props.id_view,
      power: power,
    }).catch(err => {
      console.log("Error updating Failed_Device.", err);
    });
  }

  const isStatusOn = con[0] === "ON";

  const isDeviceOn = data[0]?.Status === 1;


  return (
    <>
      {data[0] ? (
        <div className="card-container">
          <div className="device-id">
            <h2 style={{ marginLeft: "-30px", display: 'inline' }}>
              Device Name: <span>{deviceName || ''}</span>
            </h2>
            <i className="fas fa-circle" style={{ color: isStatusOn? "green" : "red", marginLeft: "60px", fontSize: "10px" }}></i>
            <h4 style={{ color: isStatusOn ? "green" : "red", display: 'inline', marginLeft: '5px', fontFamily: 'cursive' }}>
              {isStatusOn ? "Online" : "Offline"}
            </h4>
          </div>

          <div className="separator"></div>

          <div className="value-container">
            <div>
              <div className="value-circle">
                <div>{isStatusOn&&isDeviceOn ? Math.round(data[0]["Indoor_Temp"]) : ''}°C</div>
                <div><i className="fas fa-thermometer-half"></i></div>
              </div>
              <div className="value-name">Indoor Temperature</div>
            </div>
            <div>
              <div className="value-circle">
                <div>{isDeviceOn ? "ON" : "OFF"}</div>
                <div><i className="fas fa-power-off"></i></div>
              </div>
              <div className="value-name">Status</div>
            </div>
            <div>
              <div className="value-circle">
                <div>{isStatusOn&&isDeviceOn ? Math.round(data[0]["Outdoor_Temp"]) : ''}°C</div>
                <div><i className="fas fa-sun"></i></div>
              </div>
              <div className="value-name">Outdoor Temperature</div>
            </div>
            <div>
              <div className="value-circle">
                <div>{isStatusOn&&isDeviceOn ? data[0]["Head_Count"] || 0 : ''}</div>
                <div><i className="fas fa-door-open"></i></div>
              </div>
              <div className="value-name">Head Count</div>
            </div>
            <div>
              <div className="value-circle">
                <div>{isStatusOn&&isDeviceOn ? Math.round(data[0]["RPM"]) || 0 : ''}</div>
                <div><i className="fas fa-tachometer-alt"></i></div>
              </div>
              <div className="value-name">RPM</div>
            </div>
            <div>
              <div className="value-circle">
                <div>{isStatusOn&&isDeviceOn? Math.round(data[0]["Power"]) || 0 : ''}</div>
                <div><i className="fas fa-bolt"></i></div>
              </div>
              <div className="value-name">Power</div>
            </div>
          </div>

          <div className="button-container">
            {props.login === "Admin" && (
              <button onClick={chit}>
                Change Status
              </button>
            )}
            <button onClick={chitt} id="refresh_button">
              Refresh
            </button>
            <button
              id="check_table"
              style={{ marginLeft: '10px' }}
              onClick={() =>
                navigate(`/device-history/${data[0].uniqueId}`)
              }
            >
              See History
            </button>
          </div>

          <hr />
          <p style={{ fontFamily: 'Times New Roman', fontSize: '20px' }}>
            {data[0]["current_dt"]
              ? "Last Updated Data on : " + format(new Date(data[0]["current_dt"]), "yyyy-MM-dd HH:mm:ss")
              : "Can't fetch the last date and time"}
          </p>
        </div>
      ) : (
        <h2 align='center' style={{ fontFamily: 'cursive', marginTop: '220px' }}>
          Oops!! Can't fetch the data. The device is not activated yet!...
        </h2>
      )}
    </>
  );
}

export default View;
