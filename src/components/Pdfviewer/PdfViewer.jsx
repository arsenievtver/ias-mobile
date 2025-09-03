import React from "react";

const PdfViewer = ({ url }) => {
	// Добавляем параметры для скрытия тулбара, навигации и скролла
	const cleanUrl = url.includes("#")
		? `${url}&toolbar=0&navpanes=0&scrollbar=0`
		: `${url}#toolbar=0&navpanes=0&scrollbar=0`;

	return (
		<iframe
			src={cleanUrl}
			style={{
				width: "100%",
				height: "100vh",
				border: "none",
			}}
			title="PDF Viewer"
		/>
	);
};

export default PdfViewer;
