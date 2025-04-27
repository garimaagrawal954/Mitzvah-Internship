import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Generate some dummy data for the last 30 days
function generateDummyData() {
  const data = [];
  const currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0], // 'YYYY-MM-DD'
      head_count: Math.floor(Math.random() * 100),
      indoor_temp: (Math.random() * 5 + 20).toFixed(2),
      outdoor_temp: (Math.random() * 10 + 15).toFixed(2),
      power: (Math.random() * 50 + 100).toFixed(2),
      rpm: Math.floor(Math.random() * 5000),
      failed_status: Math.random() > 0.9,
    });
  }

  return data;
}

function DeviceHistory() {
  const { id } = useParams(); // Get device ID from URL
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = () => {
      const data = generateDummyData();
      setHistory(data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 🔍 Filter and sort by date descending
  const filteredData = history
    .filter((item) => {
      const itemDate = new Date(item.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(`Filtered Report - Device ${id}`, 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [["Date", "Head Count", "Indoor Temp", "Outdoor Temp", "Power", "RPM", "Failed"]],
      body: filteredData.map((item) => [
        item.date,
        item.head_count,
        item.indoor_temp,
        item.outdoor_temp,
        item.power,
        item.rpm,
        item.failed_status ? "Yes" : "No",
      ]),
    });

    doc.save(`device-${id}-filtered-history.pdf`);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading ⏳...</p>;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ color: "#333" }}>History of device - {id}</h2>

      {/* 🔍 Date Filter Inputs */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Start Date:{" "}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:{" "}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <button
        onClick={downloadPDF}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "10px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Download Filtered PDF
      </button>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            marginBottom: "70px",
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
            color: "#000",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Head Count</th>
              <th style={thStyle}>Indoor Temp</th>
              <th style={thStyle}>Outdoor Temp</th>
              <th style={thStyle}>Power</th>
              <th style={thStyle}>RPM</th>
              <th style={thStyle}>Failed</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.date}</td>
                <td style={tdStyle}>{item.head_count}</td>
                <td style={tdStyle}>{item.indoor_temp}°C</td>
                <td style={tdStyle}>{item.outdoor_temp}°C</td>
                <td style={tdStyle}>{item.power} W</td>
                <td style={tdStyle}>{item.rpm}</td>
                <td style={tdStyle}>{item.failed_status ? "Yes" : "No"}</td>
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
