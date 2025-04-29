import { React, useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Client from "./client";
import District from "./district";
import City from "./city";
import Location from "./location";
import SensorCard from "./sensorcard";
import axios from "axios";
import Macid from "./macid";
import Refid from "./refid";
import "./index.css";

function Home(props) {
  const navigate = useNavigate();
  const [s, sets] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);  // State to track if the user is admin

  useEffect(() => {
    const val = JSON.parse(sessionStorage.getItem("user"));
    let val2 = JSON.parse(sessionStorage.getItem("filter"));
    if (!val2) {
      sessionStorage.setItem("filter", JSON.stringify({ cs: "", ds: "", cis: "", ls: "", rs: "", ms: "" }));
    }
    if (!val) {
      navigate("/");
    } else {
      axios
        .post("https://mitzvah-software-for-smart-air-curtain.onrender.com/get-name", {
          username: val.username,
          password: val.password,
        })
        .then((res) => {
          if (res.data.flag === "client") {
            props.setcs(res.data.name);
            props.setcis(res.data.city);
            props.setls(res.data.location);
            props.setds(res.data.district);
            setTimeout(() => {
              props.setlogin("Client");
            }, 10);
          } else if (res.data.flag === "admin") {
            // Call the /user-role API to check if the user is an admin
            axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/user-role", { name: val.username })
              .then(response => {
                if (response.data.role === "admin") {
                  setIsAdmin(true);  // Set user as admin
                } else {
                  setIsAdmin(false);  // Set user as non-admin
                }
              })
              .catch(err => {
                console.error("Error checking user role", err);
              });

            console.log(val2);
            props.setcs(val2.cs);
            props.setls(val2.ls);
            props.setcis(val2.cis);
            props.setds(val2.ds);
            props.setdname(val2.ms);
            props.setrefname(val2.rs);
            setTimeout(() => {
              props.setlogin("Admin");
            }, 10);
          } else {
            sessionStorage.clear();
            navigate("/");
          }
        });
    }
  }, [props.login]);

  // Refresh every 50 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      sets(prev => prev + 1);  
    }, 3000000);  

    return () => clearInterval(interval);  
  }, []);

  function display(event) {
    event.target.disabled = true;
    setTimeout(() => { event.target.disabled = false }, 2000);
    sets(s + 1);
  }

  function change(id, val) {
    if (id === "client-select") {
      props.setcs(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.cs = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    } else if (id === "district-select") {
      props.setds(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.ds = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    } else if (id === "city-select") {
      props.setcis(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.cis = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    } else if (id === "macid-select") {
      props.setdname(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.ms = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    } else if (id === "refid-select") {
      props.setrefname(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.rs = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    } else {
      props.setls(val);
      let val2 = JSON.parse(sessionStorage.getItem("filter"));
      val2.ls = val;
      sessionStorage.setItem("filter", JSON.stringify(val2));
    }
  }

  return (
    <>
      <div className="search-bar">
        <Client change={change} cs={props.cs} login={props.login} />
        <District ds={props.ds} change={change} login={props.login} />
        <City cis={props.cis} change={change} login={props.login} />
        <Location ls={props.ls} change={change} login={props.login} />
        <Macid dname={props.dname} cs={props.cs} ls={props.ls} change={change} ds={props.ds} cis={props.cis} refname={props.refname} login={props.login} />
        <Refid dname={props.dname} refname={props.refname} cs={props.cs} ls={props.ls} change={change} ds={props.ds} cis={props.cis} login={props.login} />
        <button id="search-button" onClick={display}>
          Search/Reload
        </button>
        {/* View Records Button - Only visible for Admin */}
      {isAdmin && (
          <button className="btn btn-primary" id="view-records-button" onClick={() => navigate("/view-records")}>
            View Records
          </button>
        )}
      </div>
      
        

      <SensorCard
        ok={props.ok}
        s={s}
        id_view={props.id_view}
        ls={props.ls}
        cs={props.cs}
        ds={props.ds}
        cis={props.cis}
        isLf={props.isLf}
        login={props.login}
        dname={props.dname}
        refname={props.refname}
        sets={sets}
      />
    </>
  );
}

export default Home;
