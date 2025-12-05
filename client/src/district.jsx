import React, { useEffect, useState } from "react";
import axios from "axios";

function District(props) {
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
        .post("http://13.203.214.225:3000/district-select", { client: props.cs })
        .then((res) => {
          setdata(res.data);
        });
    }
  }, [props.login, props.cs]);

  return (
    <select id="district-select" onChange={callit} value={props.ds}>
      <option id="2" value="">
        Select District
      </option>
      {data.map((ele) => (
        <option key={ele} id={ele} value={ele}>
          {ele}
        </option>
      ))}
    </select>
  );
}

export default District;