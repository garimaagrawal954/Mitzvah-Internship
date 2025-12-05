import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Proper import for table support

const ViewRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const filters = JSON.parse(sessionStorage.getItem("filter")) || {};
        const response = await axios.post("http://13.203.214.225:3000/device-select", filters);
        setRecords(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Device Records", 14, 15);

    const tableColumn = [
      "S.No", "Device Name", "ID", "Client", "District", "City",
      "Location", "Sector", "State", "Pin", "Status", "Emergency"
    ];

    const tableRows = records.map((record, index) => [
      index + 1,
      record["device-name"],
      record.uniqueId,
      record.client_select,
      record.district,
      record.city,
      record.location,
      record.sector,
      record.state,
      record.pincode,
      record.status === "OFF" || !record.status
        ? "Inactive"
        : record.Power > 1000
        ? "Danger"
        : "Active",
      record.enum ? "Emergency" : "No Emergency"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      theme: "striped",
    });

    doc.save("device_records.pdf");
  };

  if (loading) return <div>Loading records...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "95%", margin: "auto" }}>
      <h2>Filtered Device Records</h2>

      <button
        onClick={downloadPDF}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          marginBottom: "15px",
          cursor: "pointer",
        }}
      >
        Download PDF
      </button>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              {[
                "S.No",
                "Device Name",
                "ID",
                "Client",
                "District",
                "City",
                "Location",
                "Sector",
                "State",
                "Pin",
                "Status",
                "Emergency",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.uniqueId}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{record["device-name"]}</td>
                <td style={tdStyle}>{record.uniqueId}</td>
                <td style={tdStyle}>{record.client_select}</td>
                <td style={tdStyle}>{record.district}</td>
                <td style={tdStyle}>{record.city}</td>
                <td style={tdStyle}>{record.location}</td>
                <td style={tdStyle}>{record.sector}</td>
                <td style={tdStyle}>{record.state}</td>
                <td style={tdStyle}>{record.pincode}</td>
                <td style={tdStyle}>
                  {record.status === "OFF" || !record.status
                    ? "Inactive"
                    : record.Power > 1000
                    ? "Danger"
                    : "Active"}
                </td>
                <td style={tdStyle}>
                  {record.enum ? "Emergency" : "No Emergency"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

export default ViewRecordsPage;
