import React from "react";
import "./PdfModal.css";

const PdfModal = ({ isOpen, onClose, url, actionButton }) => {
	const modifiedUrl = `${url}#view=FitH`;
	if (!isOpen || !url) return null;

	return (
		<div className="overlay">
			<div className="modal">
				<button className="closeBtn" onClick={onClose}>
					✕
				</button>
				<div className="modal__body">
					<iframe src={modifiedUrl} title="PDF Viewer" />
				</div>
				{actionButton && (
					<div className="modal__actions">
						{actionButton}
					</div>
				)}
			</div>
		</div>
	);
};

export default PdfModal;
