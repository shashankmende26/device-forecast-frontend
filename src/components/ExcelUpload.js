import React, { useRef, useState } from "react";
import { uploadExcel } from "../api";

export default function ExcelUpload({ onUploadSuccess }) {
  const fileInput = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    const file = fileInput.current.files[0];
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }
    setLoading(true);
    try {
      const result = await uploadExcel(file);
      onUploadSuccess(result.deviceTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
      <label>
        Upload Excel file:
        <input type="file" accept=".xls,.xlsx" ref={fileInput} disabled={loading} />
      </label>
      <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
