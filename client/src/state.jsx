import React, { useEffect, useState } from "react";
import axios from "axios";

function State(props) {
  const [data, setdata] = useState([]);
  function callit(event) {
    props.change(event.target.id, event.target.value);
  }
  useEffect(() => {
    if (props.login == "Admin" && data != []) {
    axios.get("https://mitzvah-software-for-smart-air-curtain.onrender.com/state-select").then((res) => {
      setdata(res.data);
    });
  }
  });

  return (
    <select id="state-select" onChange={callit} value={props.ss} disabled={props.login == "Client"}>
      <option id="2" value="">
      {props.login == "Admin" ? "Select State" : props.ss}
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
export default State;