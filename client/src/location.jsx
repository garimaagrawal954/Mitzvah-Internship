import React, { useState, useEffect } from "react";
import axios from "axios";

function Location(props) {
  const [data, setdata] = useState([]);

  function callit(event) {
    props.change(event.target.id, event.target.value);
  }

  useEffect(() => {
    if (
      (props.login === "Admin" || props.login === "Client") &&
      props.cs !== "" &&
      data.length === 0
    ) {
      axios
        .post("http://13.203.214.225:3000/location-select", { client: props.cs })
        .then((res) => {
          setdata(res.data);
        });
    }
  }, [props.login, props.cs]);

  return (
    <select id="location-select" value={props.ls} onChange={callit}>
      <option id="4" value="">
        Select Location
      </option>
      {data.map((ele) => (
        <option key={ele} id={ele} value={ele}>
          {ele}
        </option>
      ))}
    </select>
  );
}

export default Location;