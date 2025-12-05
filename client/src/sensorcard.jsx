import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

function SensorCard(props) {
  const [stat, setStat] = useState([]);
  const [statCpy, setStatCpy] = useState([]);
  const navigate = useNavigate();

  function viewit(event) {
    props.ok(event);
  }

  useEffect(() => {
    if (props.login === "Client" || props.login === "Admin") {
      document.getElementById("all").checked = true;

      axios.post("http://13.203.214.225:3000/device-select", props).then(async (res) => {
        const deviceList = res.data;
        const newStat = [];
        const newStatCpy = [];

        await Promise.all(
          deviceList.map(async (ele) => {
            try {
              const resu = await axios.post("http://13.203.214.225:3000/find", { id_view: ele.uniqueId });
              const nres = await axios.post("http://13.203.214.225:3000/check-emergency", { id: ele.uniqueId });
              const cres = await axios.post("http://13.203.214.225:3000/checki", { id: ele.uniqueId });

              const merged = Object.assign(resu.data[0] || {}, ele, {
                status: nres.data[0],
                fanstatus: nres.data[1],
                enum: nres.data.emergency,
                connectionInfo: cres.data[0]
              });

              newStat.push({ [ele.uniqueId]: [merged] });
              newStatCpy.push({ [ele.uniqueId]: [merged] });
            } catch (err) {
              console.error(err);
            }
          })
        );

        setStat(newStat);
        setStatCpy(newStatCpy);
      });
    }
  }, [props]);

  function checkOnline(device) {
    return device?.connectionInfo === "ON" && device?.Status === 1;
  }

  function filterit(event) {
    if (event.target.value === "All") {
      setStatCpy(stat);
    } else if (event.target.value === "active") {
      setStatCpy(stat.filter((ele) => {
        const device = ele[Object.keys(ele)[0]][0];
        return checkOnline(device);
      }));
    } else if (event.target.value === "inactive") {
      setStatCpy(stat.filter((ele) => {
        const device = ele[Object.keys(ele)[0]][0];
        return !checkOnline(device);
      }));
    } else {
      setStatCpy(stat.filter((ele) => ele[Object.keys(ele)[0]][0]["Power"] >= 1000));
    }
  }

  async function chitst(event) {
    let isChecked = event.target.checked;
    const deviceId = event.target.id;
    const relayStatus = isChecked ? 0 : 1;

    try {
      await axios.post("http://13.203.214.225:3000/change", {
        id: deviceId,
        st: relayStatus,
      });

      event.target.checked = isChecked;

      await axios.post("http://13.203.214.225:3000/relayChange", {
        id: deviceId,
        st: relayStatus,
      });

      console.log("Relay status sent");
    } catch (err) {
      console.error("Error changing status or sending relay:", err);
      alert("Failed to change relay status.");
    }
  }

  return (
    <>
      <div className="table-wrapper table-striped">
        <div className="table-title">
          <div className="row">
            <div className="col-sm-3">
              <h2>Filtered Results ({statCpy.length})</h2>
            </div>
            <div className="col-sm-9">
              <div className="btn-group" data-toggle="buttons">
                <label className="btn btn-info active" style={{ paddingRight: "35px", paddingLeft: "15px" }}>
                  <input type="radio" name="status" value="All" onClick={filterit} defaultChecked id="all" />
                  All
                </label>
                <label className="btn btn-success" style={{ paddingRight: "59px", paddingLeft: "15px" }}>
                  <input type="radio" name="status" value="active" onClick={filterit} />
                  Active
                </label>
                <label className="btn btn-warning" style={{ paddingRight: "68px", paddingLeft: "10px" }}>
                  <input type="radio" name="status" value="inactive" onClick={filterit} />
                  Inactive
                </label>
                <label className="btn btn-danger" style={{ paddingRight: "68px", paddingLeft: "10px" }}>
                  <input type="radio" name="status" value="expired" onClick={filterit} />
                  Danger
                </label>

                {props.login === "Admin" && (
                  <button
                    className="btn btn-primary"
                    id="view-records-button"
                    onClick={() => navigate("/view-records")}
                    style={{
                      padding: "5px 15px 5px 5px",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Records
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Scrollable container for table */}
        <div
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            maxWidth: "100%",
            paddingBottom: "10px", // Ensures scrollbar stays visible above footer
            marginBottom: "30px",  // Adds space so scrollbar doesn't get hidden
          }}
        >
          <table
            className="table table-striped table-hover tableeee"
            style={{
              minWidth: "1500px",  // Force horizontal scroll if screen smaller
              width: "1500px",
            }}
          >
            <thead>
              <tr style={{ fontSize: "16px", fontFamily: "sans-serif" }}>
                <th style={{ textAlign: "center" }}><u>SNo.</u></th>
                <th style={{ textAlign: "center" }}><u>Device-name</u></th>
                <th style={{ textAlign: "center" }}><u>ID</u></th>
                <th style={{ textAlign: "center" }}><u>Client</u></th>
                <th style={{ textAlign: "center" }}><u>District</u></th>
                <th style={{ textAlign: "center" }}><u>City</u></th>
                <th style={{ textAlign: "center" }}><u>Location</u></th>
                <th style={{ textAlign: "center" }}><u>Sector</u></th>
                <th style={{ textAlign: "center" }}><u>State</u></th>
                <th style={{ textAlign: "center" }}><u>Pin Code</u></th>
                {props.login === "Admin" && (
                  <th style={{ textAlign: "center" }}><u>Change Status</u></th>
                )}
                <th style={{ textAlign: "center" }}><u>Status</u></th>
                <th style={{ textAlign: "center" }}><u>Emergency</u></th>
                <th style={{ textAlign: "center" }}><u>View</u></th>
              </tr>
            </thead>
            <tbody>
              {statCpy.map((ele, index) => {
                const device = ele[Object.keys(ele)[0]][0];
                const isOnline = checkOnline(device);

                return (
                  <tr style={{ textAlign: "center" }} key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{device["device-name"]}</td>
                    <td>{device["uniqueId"]}</td>
                    <td>{device["client_select"]}</td>
                    <td>{device["district"]}</td>
                    <td>{device["city"]}</td>
                    <td>{device["location"]}</td>
                    <td>{device["sector"]}</td>
                    <td>{device["state"]}</td>
                    <td>{device["pincode"]}</td>

                    {props.login === "Admin" && (
                      <td>
                        <div className="toggle-container">
                          <label className="switch">
                            <input
                              type="checkbox"
                              id={device["uniqueId"]}
                              onChange={chitst}
                              checked={device["Status"]}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      </td>
                    )}

                    <td>
                      <div className="d-flex flex-column align-items-center">
                        <span
                          style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "13px" }}
                          className={
                            "label label-" +
                            (!isOnline
                              ? "warning"
                              : device["Power"] > 1000
                              ? "danger"
                              : "success")
                          }
                        >
                          {!isOnline
                            ? "Inactive"
                            : device["Power"] > 1000
                            ? "Danger"
                            : "Active"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          "btn btn-" + (device["enum"] ? "danger" : "success") + " mt-1"
                        }
                      >
                        <i
                          className={
                            "bi bi-" +
                            (device["enum"] ? "exclamation" : "check") +
                            "-circle icon-style emergency-icon"
                          }
                        ></i>{" "}
                        {device["enum"] ? "Emergency" : "No emergency"}
                      </button>
                    </td>

                    <td>
                      <NavLink to="/view">
                        <button
                          onClick={viewit}
                          login={props.login}
                          className="view-button btn btn-sm manage"
                          id="view-button"
                          name={Object.keys(ele)[0]}
                        >
                          View
                        </button>
                      </NavLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SensorCard;