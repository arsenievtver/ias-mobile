import React, { useEffect, useRef, useState } from 'react';
import QRScanner from 'qr-scanner';

const QRScannerComponent = ({ onScan, width = 300, height = 300 }) => {
	const videoRef = useRef(null);
	const [scannedText, setScannedText] = useState('');

	useEffect(() => {
		if (!videoRef.current || !onScan) return;

		let qrScanner;

		navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
			.then(stream => {
				videoRef.current.srcObject = stream;

				videoRef.current.onloadedmetadata = () => {
					qrScanner = new QRScanner(videoRef.current, result => {
						if (result?.data) {
							setScannedText(result.data);
							onScan(result.data);
							qrScanner.stop();
							qrScanner.destroy();
						}
					}, { returnDetailedScanResult: true });

					qrScanner.start();
				};
			})
			.catch(err => {
				console.error('Ошибка доступа к камере:', err);
			});

		return () => {
			if (qrScanner) {
				qrScanner.stop();
				qrScanner.destroy();
			}
			if (videoRef.current?.srcObject) {
				videoRef.current.srcObject.getTracks().forEach(track => track.stop());
			}
		};
	}, [onScan]);

	return (
		<div style={{
			position: 'relative',
			width: `${width}px`,
			height: `${height}px`,
			overflow: 'hidden',
			borderRadius: '8px',
			backgroundColor: '#000'
		}}>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover'
				}}
			/>

			{/* Рамка сканирования */}
			<div style={{
				position: 'absolute',
				top: '10%',
				left: '10%',
				width: '80%',
				height: '80%',
				border: '1px solid #00ff00',
				borderRadius: '8px',
				boxSizing: 'border-box',
				pointerEvents: 'none'
			}} />

			{/* Текст распознавания */}
			{scannedText && (
				<p style={{
					position: 'absolute',
					bottom: '4px',
					left: '4px',
					color: '#fff',
					fontSize: '12px',
					backgroundColor: 'rgba(0,0,0,0.4)',
					padding: '2px 4px',
					borderRadius: '4px'
				}}>
					Распознано: {scannedText}
				</p>
			)}
		</div>
	);
};

export default QRScannerComponent;
