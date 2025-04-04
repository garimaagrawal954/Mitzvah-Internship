import React, { useState, useEffect } from "react";
import axios from "axios";
function City(props) {
  const [data, setdata] = useState([]);
  function callit(event) {
    props.change(event.target.id, event.target.value);
  }
  var ds = props.ds;
  useEffect(() => {
    if (props.login == "Admin" && data != []) {
    axios.get("https://test-gjac.onrender.com/city-select").then((res) => {
      setdata(res.data);
    });
  }
  });

  return (
    <>
      <select id="city-select" onChange={callit} value={props.cis} disabled={props.login == "Client"}>
        <option id="3" value="">
        {props.login == "Admin" ? "Select City" : props.cis}
        </option>
        {data.map((ele) => {
          return (
            <option key={ele} id={ele} value={ele}>
              {ele}
            </option>
          );
        })}
      </select>
    </>
  );
}
export default City;
