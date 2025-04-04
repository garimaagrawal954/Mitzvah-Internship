import React,{useState,useEffect} from 'react'
import axios from "axios";
function Refid(props) {
    const [data, setdata] = useState([]);
    function callit(event) {
      props.change(event.target.id, event.target.value);
    }
    useEffect(() => {
          axios.post("https://test-gjac.onrender.com/device-select", props).then((res) => {
        res.data.sort((a,b)=>{b['device-name'].localeCompare(a['device-name'])})
        setdata(res.data);
      });
    },[]);
      return(
      <select id="refid-select" onChange={callit} value={props.refname}>
      <option id="6" value="">Select Reference Id</option>
        {data.map((ele) => {
          if((props.cs=="" || ele["client_select"]==props.cs) && (props.ds=="" || ele["district"]==props.ds) && (props.cis=="" || ele["city"]==props.cis) && (props.ls=="" || ele["location"]==props.ls) && (props.dname=="" || ele["uniqueId"]==props.dname)){
              return(<option key={ele["uniqueId"]||null} id={ele["uniqueId"]} value={ele["device-name"]}>
                  {ele["device-name"]}
                </option>)
          }
        })}
      </select>)
}

export default Refid;