import React from "react";
import "./PdfModal.css";

const PdfModal = ({ isOpen, onClose, url }) => {
	if (!isOpen || !url) return null;

	return (
		<div className="overlay">
			<div className="modal">
				<button className="closeBtn" onClick={onClose}>
					✕
				</button>
				<div className="modal__body">
					<iframe src={url} title="PDF Viewer" />
				</div>
				<div className="modal__actions">
					<button className="actionBtn" onClick={onClose}>
						Ознакомиться
					</button>
				</div>
			</div>
		</div>
	);
};

export default PdfModal;
