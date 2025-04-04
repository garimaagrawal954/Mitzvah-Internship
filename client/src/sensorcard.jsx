import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
function SensorCard(props) {
  const [stat, setstat] = useState([]);
  const [statcpy, setstatcpy] = useState([]);
  function viewit(event) {
    props.ok(event);
  }

  useEffect(() => {
    if (props.login == "Client" || props.login == "Admin") {
      document.getElementById("all").checked = true;
      axios.post("https://test-gjac.onrender.com/device-select", props).then((res) => {
        setstat([]);
        setstatcpy([]);
        res.data.map((ele) => {
          axios
            .post("https://test-gjac.onrender.com/find", {
              id_view: ele["uniqueId"],
            })
            .then((resu) => {

                axios
                  .post("https://test-gjac.onrender.com/checki", {
                    id: ele["uniqueId"],
                  })
                  .then((nres) => {
                    setstat((prev) => {
                      return [
                        ...prev,
                        {
                          [ele["uniqueId"]]: [
                            Object.assign(resu.data[0]||{}, ele, {
                              status: nres.data[0],
                              fanstatus:nres.data[1]
                            }),
                          ],
                        },
                      ];
                    });
                    setstatcpy((previ) => {
                      // console.log(ele,"Tanmay");
                      return [
                        ...previ,
                        {
                          [ele["uniqueId"]]: [Object.assign(resu.data[0]||{}, ele)],
                        },
                      ];
                    });
                  });
            });
          });
      });
    }
  }, [props]);

  function filterit(event) {
    if (event.target.value == "All" ) {
      setstatcpy(stat);
    } else if (event.target.value == "active") {
      setstatcpy(
        stat.filter((ele) => {
          return ele[Object.keys(ele)[0]][0]["status"] == "ON";
        })
      );
    }else if (event.target.value == "inactive") {
      setstatcpy(
        stat.filter((ele) => {
          return ele[Object.keys(ele)[0]][0]["status"] == "OFF";
        })
      );
    } else {
      setstatcpy(
        stat.filter((ele) => {
          return ele[Object.keys(ele)[0]][0]["Power"] >= 1000;
        })
      );
    }
  }
  function chitst(event) {
    let i=event.target.checked;
    axios.post("https://test-gjac.onrender.com/change",{id:event.target.id,st:event.target.checked?0:1}).then((res)=>{if(i){
      event.target.checked=true;
    }
  else{
    event.target.checked=false;
  }}).catch((err)=>{console.log(err)})
  }
  return (
    <>
      <div class="table-wrapper table-striped">
        <div class="table-title">
          <div class="row">
            <div class="col-sm-3"><h2>Filtered Results ({statcpy.length})</h2></div>
            <div class="col-sm-9">
              <div class="btn-group" data-goggle="buttons">
                <label
                  class="btn btn-info active"
                  style={{ paddingRight: "35px", paddingLeft: "15px" }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="All"
                    onClick={filterit}
                    defaultChecked
                    id="all"
                  />
                  All
                </label>
                <label
                  class="btn btn-success"
                  style={{ paddingRight: "59px", paddingLeft: "15px" }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    onClick={filterit}
                  />
                  Active
                </label>
                <label
                  class=" btn btn-warning"
                  style={{ paddingRight: "68px", paddingLeft: "10px" }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    onClick={filterit}
                  />
                  Inactive
                </label>
                <label
                  class=" btn btn-danger"
                  style={{ paddingRight: "68px", paddingLeft: "10px" }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="expired"
                    onClick={filterit}
                  />
                  Danger
                </label>
              </div>
            </div>
          </div>
        </div>
        <table class=" table table-striped table-hover tableeee">
          <thead>
            <tr style={{ fontSize: "16px", fontFamily: "sans-serif" }}>
              <th style={{ textAlign: "center" }}>
                <u>SNo.</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>Device-name</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>ID</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>Client</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>District</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>City</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>Location</u>
              </th>
              {props.login == "Admin" ? (
                <th style={{ textAlign: "center" }}>
                  <u>Change Status</u>
                </th>
              ) : null}
              <th style={{ textAlign: "center" }}>
                <u>Status</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>Emergency</u>
              </th>
              <th style={{ textAlign: "center" }}>
                <u>View</u>
              </th>
            </tr>
          </thead>
          <tbody>
            {statcpy.map((ele, index) => {
              return (
                <tr style={{ textAlign: "center" }} data-status="active" key={index + 1}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["device-name"]}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["uniqueId"]}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["client_select"]}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["district"]}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["city"]}</td>
                  <td style={{ textAlign: "center" }}>{ele[Object.keys(ele)[0]][0]["location"]}</td>
                  {props.login == "Admin" ? (
                    <td style={{ textAlign: "center" }}>
                      <div class="toggle-container">
                        <label class="switch">
                          <input
                            type="checkbox"
                            id={ele[Object.keys(ele)[0]][0]["uniqueId"]}
                            onChange={chitst}
                            checked={ele[Object.keys(ele)[0]][0]["Status"]}
                          />
                          <span class="slider round"></span>
                        </label>
                      </div>
                    </td>
                  ) : null}
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        fontSize: "13px",
                      }}
                      className={
                        "label label-" +
                        (ele[Object.keys(ele)[0]][0]["status"] == "OFF" || !ele[Object.keys(ele)[0]][0]["status"]
                        ? "warning":ele[Object.keys(ele)[0]][0]["Power"] > 1000
                          ? "danger"
                          : "success")
                      }
                    >
                      {ele[Object.keys(ele)[0]][0]["status"] == "OFF" || !ele[Object.keys(ele)[0]][0]["status"]
                        ? "Inactive":ele[Object.keys(ele)[0]][0]["Power"] > 1000
                          ? "Danger"
                          : "Active"}
                    </span>
                  </td>
                  <td><button type="button" className={"btn btn-"+(ele[Object.keys(ele)[0]][0]["enum"]?"danger":"success")+" mt-1"}>
            <i className={"bi bi-"+(ele[Object.keys(ele)[0]][0]["enum"]?"exclamation":"check")+"-circle icon-style emergency-icon"}></i> {ele[Object.keys(ele)[0]][0]["enum"]?"Emergency":"No emergency"}
        </button></td>
                  <td style={{ textAlign: "center" }}>
                    <NavLink to="/view">
                      <button
                        onClick={viewit}
                        login={props.login}
                        class="view-button btn btn-sm manage"
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
    </>
  );
}
export default SensorCard;  