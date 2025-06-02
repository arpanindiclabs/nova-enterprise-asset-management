import React from "react";

const MetabaseDashboard = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          height: "80vh",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <iframe
          src="http://localhost:3500/public/dashboard/54dcca60-7eac-4666-bceb-f6d7283ce24e"
          title="Metabase Dashboard"
          style={{ border: "none", width: "100%", height: "100%" }}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default MetabaseDashboard;
