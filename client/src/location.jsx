import React, { useState, useEffect } from "react";
import axios from "axios";

function Location(props) {
  const [data, setdata] = useState([]);
  function callit(event) {
    props.change(event.target.id, event.target.value);
  }
  useEffect(() => {
    if (props.login == "Admin" && data != []) {
    axios.get("https://test-gjac.onrender.com/location-select").then((res) => {
      setdata(res.data);
    });
  }
  });
  return (
    <select id="location-select" value={props.ls} onChange={callit} disabled={props.login == "Client"}>
      <option id="4" value="">
      {props.login == "Admin" ? "Select Location" : props.ls}
      </option>
      {data.map((ele) => {
        return (
          <option key={ele} id={ele} value={ele}>
            {ele}
          </option>
        );
      })}
    </select>
  );
}
export default Location;
