import { React, useEffect, useState } from "react";
import axios from "axios";

function Changeform(props) {
  const [formData, setFormData] = useState({ newpass: "", confpass: "" });
  const [done,setdone]=useState(0);
  const [message,setmessage]=useState("");
  function handleChange(event) {
    setdone(0);
    setmessage("");
    setFormData((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
  }
  function chpaas(event) {
    // console.log("Ok")
    event.preventDefault();
    if(formData.newpass.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
      )){
    if ((formData.confpass == formData.newpass)) {
      axios
        .post("https://test-gjac.onrender.com/add2", {
          password: formData.confpass,
          username: JSON.parse(sessionStorage.getItem("user")).username,
          name: props.cs,
          district:props.ds,
          location:props.ls,
          city:props.cis,
          login: props.login,
        })
        .then((res) => {
            setdone(1)
        })
        .catch((err) => {
            setdone(2)
        });
    } else {
        setdone(3)
    }
}
else{
    setdone(4);
}
  }
  useEffect(()=>{
    if(done!=0){
        if(done==1){
            setmessage("Password Changed Successfully");
        }
        if(done==2){
            setmessage("Some error Occurred. Please try again");
        }
        if(done==3){
            setmessage("Passwords are not matching");
        }
        if(done==4){
            setmessage("Password is not strong. Ensure length is at least 8 and there is at least one uppercase, lowercase, numeric and special characters")
        }
    }
  },[done])
  return (
    <div
      id="slider"
      style={
        props.slide === 1
          ? {
              transition: "right 0.5s ease-in-out",
              right: "0",
              overflow: "hidden",
            }
          : {
              transition: "right 0.5s ease-in-out",
              right: "-360px",
              overflow: "hidden",
            }
      }
    >
      <div id="header">
        <h2 onClick={props.here}>
          <i
            id="Cross"
            style={{ marginLeft: "-300px", cursor: "pointer" }}
            className="fas fa-times"
          ></i>
        </h2>
        <h2 style={{ marginTop: "-43px" }}>Change Password</h2>
        <p>
          Please fill out the form below and we will get back to you as soon as
          possible.
        </p>
        <form id="contact-form" onSubmit={chpaas}>
          <input
            name="dname"
            type="text"
            placeholder="Enter New Password"
            id="newpass"
            onChange={handleChange}
            value={formData.newpass}
            required
          />
          <input
            name="demail"
            type="password"
            placeholder="Confirm the Password"
            id="confpass"
            value={formData.confpass}
            onChange={handleChange}
            required
          />
          <p style={done==1?{color:"green"}:{color:"red"}}>{message}</p>
          <button type="submit">Change It !</button>
        </form>
      </div>
    </div>
  );
}

export default Changeform;
