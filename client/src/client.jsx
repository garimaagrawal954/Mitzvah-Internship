import { React, useEffect, useState } from "react";
import axios from "axios";

function Client(props) {
  const [data, setdata] = useState([]);

  function callit(event) {
    props.change(event.target.id, event.target.value);
  }

  useEffect(() => {
    if (props.login === "Admin") {
      axios.get("http://13.203.214.225:3000/client-select").then((res) => {
        setdata(res.data);
      });
    } else if (props.login === "Client") {
      // For Client login, populate with their own value so other filters work
      setdata([props.cs]);
    }
  }, [props.login, props.cs]);

  return (
    <select
      id="client-select"
      onChange={callit}
      disabled={props.login === "Client"}
      value={props.cs}
    >
      <option key="1a" id="1" value="">
        {props.login === "Admin" ? "Select Client" : props.cs}
      </option>
      {data.map((item) => (
        <option key={item} id={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export default Client;