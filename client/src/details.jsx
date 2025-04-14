import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Details() {
  const { id } = useParams(); // Get device ID from URL
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        // First API call
        const mainRes = await axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/device-select", {
          deviceId: id,
        });

        let deviceData = mainRes.data.length > 0 ? mainRes.data[0] : null;

        if (deviceData) {
          // Second API call
          const statusRes = await axios.post("https://mitzvah-software-for-smart-air-curtain.onrender.com/find", {
            id_view: id,
          });

          if (statusRes.data.length > 0) {
            deviceData = {
              ...deviceData,
              Status: statusRes.data[0].Status,
              current_dt: statusRes.data[0].current_dt,
            };
          }

          setDevice(deviceData);
        }
      } catch (err) {
        console.error("Error fetching device:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!device) return <p style={{ padding: "20px" }}>Device not found.</p>;

  const isActive = device?.Status === 1 || device?.Status === "1";

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{ color: "#333" }}>Device Details</h2>
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
            <td style={tdStyle}>{device["device-name"] || "N/A"}</td>
            <td style={tdStyle}>{device["client_select"] || "Client 1"}</td>
            <td style={tdStyle}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{
                  height: "10px",
                  width: "10px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "green" : "red",
                  display: "inline-block",
                  marginRight: "8px"
                }}></span>
                {isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td style={tdStyle}>{device.current_dt ? new Date(device.current_dt).toLocaleString() : "N/A"}</td>
            <td style={tdStyle}>{device.location || "N/A"}</td>
            <td style={tdStyle}>📥 ⬜</td>
          </tr>
        </tbody>
      </table>
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
