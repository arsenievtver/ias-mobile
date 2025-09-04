import React from "react";

const PdfViewer = ({ url }) => {
	// ↓ безопасно строим ссылку, даже если url пока undefined
	const params = "toolbar=0&navpanes=0&scrollbar=0";
	const u = typeof url === "string" ? url : "";
	const cleanUrl = u ? (u.includes("#") ? `${u}&${params}` : `${u}#${params}`) : "";

	return (
		<iframe
			src={cleanUrl || undefined}
			style={{
				width: "100%",
				height: "100%",   // ← было 100vh, делаем 100% от родителя
				border: "none",
				display: "block",
			}}
			title="PDF Viewer"
			loading="lazy"
		/>
	);
};

export default PdfViewer;
