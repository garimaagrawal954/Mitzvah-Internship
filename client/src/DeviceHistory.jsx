import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Fetch data from API
const fetchData = async (uniqueId, startDate, endDate) => {
  const url = new URL(`https://mitzvah-software-for-smart-air-curtain.onrender.com/items/${uniqueId}`);
  if (startDate && endDate) {
    url.searchParams.append("startDate", startDate);
    url.searchParams.append("endDate", endDate);
  }

  const response = await fetch(url);
  const data = await response.json();
  console.log("Fetched data.", data);
  return data.items;
};

function DeviceHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deviceName, setDeviceName] = useState(''); // NEW

  // Convert date string to Unix timestamp (milliseconds)
  const convertToTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.getTime();
  };

  // Fetch history and device name
  useEffect(() => {
    const fetchDeviceInformation = async () => {
      try {
        setLoading(true);
        // First fetch history
        const startTimestamp = convertToTimestamp(startDate);
        const endTimestamp = convertToTimestamp(endDate);
        const data = await fetchData(id, startTimestamp, endTimestamp);
        setHistory(data);

        // Then fetch the device's name
        const res = await fetch("https://mitzvah-software-for-smart-air-curtain.onrender.com/device-select", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dname: id })
        });
        const resData = await res.json();

        if (resData.length > 0) {
          setDeviceName(resData[0]["device-name"]);
        } else {
          setDeviceName(id);
        }
      } catch (error) {
        console.error("Error fetching device history.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInformation();
  }, [id, startDate, endDate]);

  // Filter and sort by date descending
  const filteredData = history
    .filter((item) => {
      const itemDate = new Date(item.current_dt);
      const itemTimestamp = itemDate.getTime();

      // Apply filters if dates are set
      const start = startDate ? convertToTimestamp(startDate) : null;
      const end = endDate ? convertToTimestamp(endDate) : null;

      if (start && itemTimestamp < start) return false;
      if (end && itemTimestamp > end) return false;

      return true;
    })
    .sort((a, b) => new Date(b.current_dt) - new Date(a.current_dt));

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(`Filtered Report - Device ${deviceName}`, 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Date",
          "Head Count",
          "Indoor Temp",
          "Outdoor Temp",
          "Power",
          "RPM",
          "Failed",
        ],
      ],
      body: filteredData.map((item) => [
        new Date(item.current_dt).toLocaleDateString(), // Format timestamp to readable
        item.Head_Count,
        item.Indoor_Temp,
        item.Outdoor_Temp,
        item.Power,
        item.RPM,
        item.Failed_Device ? "Yes" : "No",
      ]),
    });

    doc.save(`device-${deviceName}-filtered-history.pdf`);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading ⏳...</p>;

  return (
    <div
      style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{ color: "#333" }}>History of device - {deviceName}</h2>

      {/* 🔍 Date Filter Inputs */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <button
        onClick={downloadPDF}
        style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", marginBottom: "20px", cursor: "pointer" }}>
        Download Filtered PDF
      </button>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ marginBottom: "70px", width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", color: "#000", boxShadow: "0 0 10px rgb(0 0 0 / 0.1)" }}>
          <thead>
            <tr>
              <th style={thStyle}>
                Date
              </th>
              <th style={thStyle}>
                Head Count
              </th>
              <th style={thStyle}>
                Indoor Temp
              </th>
              <th style={thStyle}>
                Outdoor Temp
              </th>
              <th style={thStyle}>
                Power
              </th>
              <th style={thStyle}>
                RPM
              </th>
              <th style={thStyle}>
                Failed
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                    {new Date(item.current_dt).toLocaleDateString()}
                </td>
                <td style={tdStyle}>{item.Head_Count}</td>
                <td style={tdStyle}>{item.Indoor_Temp}°C</td>
                <td style={tdStyle}>{item.Outdoor_Temp}°C</td>
                <td style={tdStyle}>{item.Power} W</td>
                <td style={tdStyle}>{item.RPM}</td>
                <td style={tdStyle}>{item.Failed_Device ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#f0f0f0",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
  fontFamily: "monospace",
};

export default DeviceHistory;
