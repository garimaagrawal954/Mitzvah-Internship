import React, { useEffect, useState } from "react";
import axios from "axios";

function District(props) {
  const [data, setdata] = useState([]);
  function callit(event) {
    props.change(event.target.id, event.target.value);
  }
  useEffect(() => {
    if (props.login == "Admin" && data != []) {
    axios.get("https://test-gjac.onrender.com/district-select").then((res) => {
      setdata(res.data);
    });
  }
  });

  return (
    <select id="district-select" onChange={callit} value={props.ds} disabled={props.login == "Client"}>
      <option id="2" value="">
      {props.login == "Admin" ? "Select District" : props.ds}
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
export default District;
