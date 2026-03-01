import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

const fetchHistory = async (uniqueId, startDate, endDate) => {
  const url = new URL(`http://13.203.214.225:3000/items/${uniqueId}`);
  if (startDate && endDate) {
    url.searchParams.append("startDate", startDate);
    url.searchParams.append("endDate", endDate);
  }
  const res = await fetch(url);
  return res.json();
};

const fetchDeviceInfo = async (id) => {
  const res = await fetch("http://13.203.214.225:3000/device-select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dname: id })
  });
  return res.json();
};

function DeviceHistory() {
  const { id } = useParams();

  const [history, setHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Device metadata
  const [clientName, setClientName] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const toTimestamp = (d) => (d ? new Date(d).getTime() : null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch history
      const historyRes = await fetchHistory(
        id,
        toTimestamp(startDate),
        toTimestamp(endDate)
      );
      setHistory(historyRes.items || []);
      setTotalCount(historyRes.count || 0);

      // Fetch device info
      const deviceRes = await fetchDeviceInfo(id);
      if (deviceRes.length > 0) {
        setDeviceName(deviceRes[0]["device-name"]);
        setClientName(deviceRes[0]["client_select"]);
        setLocation(deviceRes[0]["location"]);
        setCity(deviceRes[0]["city"]);
        setState(deviceRes[0]["state"]);
      } else {
        setDeviceName(id);
      }

      setLoading(false);
    };

    loadData();
  }, [id, startDate, endDate]);

  const sortedData = [...history].sort(
    (a, b) => b.current_dt - a.current_dt
  );

  /* ================= PDF ================= */
  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(10);
    doc.text(`Client Name: ${clientName}`, 10, 15);
    doc.text(`Device Name: ${deviceName}`, 10, 21);
    doc.text(`Location: ${location}, ${city}, ${state}`, 10, 27);

    autoTable(doc, {
      startY: 32,
      head: [[
        "Date",
        "Time",
        "Head Count",
        "Indoor Temp",
        "Outdoor Temp",
        "Power",
        "RPM",
        "Failed"
      ]],
      body: sortedData.map(item => {
        const d = new Date(item.current_dt);
        return [
          d.toLocaleDateString(),
          d.toLocaleTimeString(),
          item.Head_Count,
          item.Indoor_Temp,
          item.Outdoor_Temp,
          item.Power,
          item.RPM,
          item.Failed_Device ? "Yes" : "No"
        ];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 175, 80], textColor: 255 }
    });

    doc.save(`device-${deviceName}-history.pdf`);
  };

  /* ================= CSV ================= */
  const exportCSV = () => {
    const rows = [
      ["Date", "Time", "Head Count", "Indoor Temp", "Outdoor Temp", "Power", "RPM", "Failed"]
    ];

    sortedData.forEach(item => {
      const d = new Date(item.current_dt);
      rows.push([
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        item.Head_Count,
        item.Indoor_Temp,
        item.Outdoor_Temp,
        item.Power,
        item.RPM,
        item.Failed_Device ? "Yes" : "No"
      ]);
    });

    const blob = new Blob(
      [rows.map(r => r.join(",")).join("\n")],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `device-${deviceName}-history.csv`);
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
      <h2>Device History</h2>

      {/* DEVICE INFO */}
      <h3>Client Name: {clientName}</h3>
      <h3>Device Name: {deviceName}</h3>
      <h3>Location: {location}, {city}, {state}</h3>

      {/* DATE FILTER */}
      <div style={{ marginBottom: 15 }}>
        <label>
          Start Date:&nbsp;
          <input type="date" onChange={e => setStartDate(e.target.value)} />
        </label>
        &nbsp;&nbsp;
        <label>
          End Date:&nbsp;
          <input type="date" onChange={e => setEndDate(e.target.value)} />
        </label>
      </div>

      {/* TOTAL COUNT */}
      <p style={{ fontWeight: "bold" }}>
        Total Records: {totalCount}
      </p>

      <button
        onClick={downloadPDF}
        style={{ marginRight: 10, padding: "8px 16px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 5 }}
      >
        Download Filtered PDF
      </button>

      <button
        onClick={exportCSV}
        style={{ padding: "8px 16px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 5 }}
      >
        Export CSV
      </button>

      {/* TABLE */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead style={{ background: "#4CAF50", color: "#fff" }}>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Head Count</th>
              <th>Indoor Temp</th>
              <th>Outdoor Temp</th>
              <th>Power</th>
              <th>RPM</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const d = new Date(item.current_dt);
              return (
                <tr key={index} style={{ background: index % 2 ? "#f5f5f5" : "#fff" }}>
                  <td>{d.toLocaleDateString()}</td>
                  <td>{d.toLocaleTimeString()}</td>
                  <td>{item.Head_Count}</td>
                  <td>{item.Indoor_Temp}°C</td>
                  <td>{item.Outdoor_Temp}°C</td>
                  <td>{item.Power} W</td>
                  <td>{item.RPM}</td>
                  <td>{item.Failed_Device ? "Yes" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeviceHistory;