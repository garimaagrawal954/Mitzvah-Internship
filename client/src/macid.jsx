import react,{useState,useEffect} from "react";
import axios from "axios";
import "./index.css";
function Macid(props){
    const [data, setdata] = useState([]);
  function callit(event) {
    props.change(event.target.id, event.target.value);
  }
  useEffect(() => {
        axios.post("https://test-gjac.onrender.com/device-select", props).then((res) => {
      setdata(res.data);
    });
  },[]);
    return(
    <select id="macid-select" onChange={callit} value={props.dname}>
    <option id="5" value="">Select Device Id</option>
      {data.map((ele) => {
        if((props.cs=="" || ele["client_select"]==props.cs) && (props.ds=="" || ele["district"]==props.ds) && (props.cis=="" || ele["city"]==props.cis) && (props.ls=="" || ele["location"]==props.ls) && (props.refname=="" || ele["device-name"]==props.refname)){
            return(<option key={ele["uniqueId"]||null} id={ele["uniqueId"]} value={ele["uniqueId"]}>
                {ele["uniqueId"]}
              </option>)
        }
      })}
    </select>)
}
export default Macid;