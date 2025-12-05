import React, { useState, useEffect } from "react";
import axios from "axios";

function Refid(props) {
  const [data, setData] = useState([]);

  function callit(event) {
    props.change(event.target.id, event.target.value);
  }

  useEffect(() => {
    // Send all filters properly to backend
    const payload = {
      cs: props.cs,
      ds: props.ds,
      cis: props.cis,
      ls: props.ls,
      dname: props.dname || "",    // Optional: only if filtering by mac
      refname: ""                  // Empty to fetch all device-names
    };

    axios
      .post("http://13.203.214.225:3000/device-select", payload)
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a["device-name"].localeCompare(b["device-name"])
        );
        setData(sorted);
      })
      .catch((err) => console.error("Refid dropdown error:", err));
  }, [props.cs, props.ds, props.cis, props.ls, props.dname]);

  return (
    <select id="refid-select" onChange={callit} value={props.refname}>
      <option value="">Select Reference Id</option>
      {data.map((ele) => (
        <option
          key={ele["uniqueId"]}
          id="refid-select"
          value={ele["device-name"]}
        >
          {ele["device-name"]}
        </option>
      ))}
    </select>
  );
}

export default Refid;