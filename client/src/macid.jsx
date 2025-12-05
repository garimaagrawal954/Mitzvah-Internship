import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function Macid(props) {
  const [data, setData] = useState([]);

  function callit(event) {
    props.change(event.target.id, event.target.value);
  }

  useEffect(() => {
    // Prepare only filter-related data for backend
    const payload = {
      cs: props.cs,
      ds: props.ds,
      cis: props.cis,
      ls: props.ls,
      dname: "",       // You only want to fetch by filters, not exact match
      refname: ""      // So leave device-name & refname blank
    };

    axios.post("http://13.203.214.225:3000/device-select", payload)
      .then((res) => {
        setData(res.data || []);
      })
      .catch((err) => {
        console.error("Macid dropdown fetch failed:", err);
      });
  }, [props.cs, props.ds, props.cis, props.ls]); // refetch when filters change

  return (
    <select id="macid-select" onChange={callit} value={props.dname}>
      <option value="">Select Device Id</option>
      {data.map((ele) => (
        <option key={ele["uniqueId"]} id="macid-select" value={ele["uniqueId"]}>
          {ele["uniqueId"]}
        </option>
      ))}
    </select>
  );
}

export default Macid;