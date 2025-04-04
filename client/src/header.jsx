import React, { useState } from "react";
import Contact from "./contact";
import Add from "./add";
import Update from "./update";
import Delete from "./delete";
import Adclient from "./adclient";
import Delcl from "./delcl";
import Changeform from "./changeform";
function Header(props) {
  const comps={Contact,Add}
  const [formdata,setformdata]=useState("");
  const [slide,setslide]=useState(0);
  function dropit(event) {
    if (event.target.classList.contains("dropdown-toggle")) {
      event.target.classList.toggle("toggle-change");
    } else if (
      event.target.classList.contains("dropdown-toggle")
    ) {
      event.target.parentElement.classList.toggle("toggle-change");
    }
  }
  function logmeout(){
    sessionStorage.clear();
    props.setlogin("Out");
    window.location.reload();
  }
  function here(event){
    setTimeout(()=>{
      setslide(slide==0?1:0);
    },10);
    if(event.target.id!="Cross"){
      setformdata(event.target.id);}
  }
  return (
    <header className="navbar">
      <img
        id="mitz_logo"
        src="https://m.media-amazon.com/images/S/aplus-seller-content-images-us-east-1/A21TJRUUN4KGV/A1RYKQ2GSJVIL/23268fa0-0b21-422e-8352-c15a080a667c._CR0,0,600,180_PT0_SX600__.png"
        alt="Logo"
        style={{width:'230px'}}
      />
      <h1>Mitzvah Engg.(India) Pvt. Limited</h1>
      {props.login!="Out"?
      <div className="profile-menu">
        <div className="nav-item dropdown" onClick={dropit}>
          <a
            className="nav-link dropdown-toggle"
            id="navbarDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="profile-pic">
              <img src="./src/image.png" alt="Profile Picture" />
            </div>
          </a>
          <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
          <li>
              <a className="dropdown-item">
              <i className="fas fa-user fa-fw"></i> Username: <b>{props.login=="Admin"?"Admin":props.cs}</b>
              </a>
            </li>
            <li style={{marginBottom:"-10px"}}>
  <button onClick={here} className="btn btn-success" id="ChangePassword" style={{width:"233px",height:"40px",borderRadius:"0px"}}>
    <i style={{marginLeft:"-50px"}} className="fas fa-key fa-fw"></i> Change Password
  </button>
</li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            {props.login=="Admin"?
            <>
            <li>
              <a className="dropdown-item" href="#" id="Add" onClick={here}>
                <i className="fas fa-sliders-h fa-fw"></i> Add/Link a Device
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#" id="Update" onClick={here}>
              <i className="fas fa-sync fa-fw"></i> Update a Device
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#" id="Delete" onClick={here}>
                <i className="fas fa-cog fa-fw"></i> Delete/Unlink a Device
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a className="dropdown-item" href="#" id="New client" onClick={here}>
              <i class="fas fa-user-plus fa-fw"></i>
 Add a new User
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#" id="Delete client" onClick={here}>
              <i class="fas fa-user-minus fa-fw"></i>
 Remove a client
              </a>
            </li>
            </>
            :null}
            <li>
              <a className="dropdown-item" href="#" id="Contact" onClick={here}>
              <i class="fas fa-envelope fa-fw"></i> Contact Us
              </a>
            </li>
            <li style={{marginBottom:"-10px"}}>
  <button className="btn btn-secondary" onClick={logmeout} id="logit" style={{width:"233px",height:"40px",borderRadius:"0px"}}>
    <i style={{marginLeft:"-108px"}} className="fas fa-sign-out-alt fa-fw"></i> Log Out
  </button>
</li>
          </ul>
        </div>
      </div>
      :null}
      {formdata=="Add"?<Add here={here} slide={slide}></Add>:formdata=="Contact"?<Contact here={here} slide={slide}></Contact>:formdata=="Update"?<Update here={here} slide={slide}></Update>:formdata=="Delete"?<Delete here={here} slide={slide}></Delete>:formdata=="New client"?<Adclient here={here} slide={slide}></Adclient>:formdata=="Delete client"?<Delcl here={here} slide={slide}></Delcl>:<Changeform login={props.login} cs={props.cs} ls={props.ls} ds={props.ds} cis={props.cis} here={here} slide={slide}></Changeform>}
    </header>
  );
}
export default Header;