import React from "react";
import { useLocation } from "react-router-dom";

function Details() {
  const location = useLocation();
  const device = location.state?.deviceData;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{ color: "#333" }}>Device Details</h2>
      {device ? (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Device ID</th>
              <th style={thStyle}>Device Name</th>
              <th style={thStyle}>Client Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>{device.uniqueId}</td>
              <td style={tdStyle}>{device.Device_Name || "N/A"}</td>
              <td style={tdStyle}>{device.Client || "Client 1"}</td>
              <td style={tdStyle}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{
                    height: "10px",
                    width: "10px",
                    borderRadius: "50%",
                    backgroundColor: device.Status === 1 ? "green" : "gray",
                    display: "inline-block",
                    marginRight: "8px"
                  }}></span>
                  {device.Status === 1 ? "Active" : "Error"}
                </span>
              </td>
              <td style={tdStyle}>{device.current_dt}</td>
              <td style={tdStyle}>{device.Location || "N/A"}</td>
              <td style={tdStyle}>📥 ⬜</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#666" }}>No device data found.</p>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#f0f0f0",
  textAlign: "center"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center"
};

export default Details;
