# Real-Time Deepfake Detection in Live Video Calls

A real-time deepfake detection system integrated directly into a live video calling pipeline.

---

## 📊 Presentation

[REAL TIME DEEPFAKE DETECTOR – PPT](https://github.com/user-attachments/files/25665241/REAL.TIME.DEEPFAKE.DETECTOR.pdf)

---

## 🎥 Demo Video

[Watch Demo Video](https://github.com/user-attachments/assets/8ab9f2f8-3551-411e-b248-e2d01c37713a)

---

## Project Overview

Deepfakes are increasingly realistic and pose serious threats to digital identity, financial systems, and trust in remote communication. Most detection systems operate after content is recorded. This project performs **real-time deepfake detection during live video calls**.

The system integrates a custom-trained deepfake detection model into a WebSocket-based video calling infrastructure. Each frame is analyzed in real time to determine whether the visible face is authentic or synthetically manipulated.

To test robustness, live face-swapping techniques are applied during calls to simulate adversarial conditions. The detector classifies frames as:

- **Real**
- **Deepfake**

during the active session itself.

---

## Research Status

This project is part of an ongoing research initiative.

The associated research paper has been **accepted for publication** and is currently in the publishing pipeline. The official citation will be added upon release.

---

## Key Features

- Real-time deepfake detection during live video calls
- Custom-trained deep learning model
- Live adversarial testing using face-swapping techniques
- Low-latency streaming via WebSockets
- Modular backend architecture
- Research-oriented and reproducible design

---

## Tech Stack

### Video Calling Infrastructure

- Node.js — Backend server
- WebSockets — Real-time communication

### Deepfake Detection Model

- PyTorch — Model training and inference
- NumPy — Data preprocessing
- Flask — Inference API server

### Adversarial Testing Layer

- Face-swapping / SWAP-based techniques — Real-time deepfake simulation

---

## System Architecture

1. User initiates a video call via the Node.js server.
2. Video frames stream through WebSockets.
3. Optional face-swapping is applied for adversarial testing.
4. Frames are sent to the Flask inference API.
5. The PyTorch model performs real-time classification.
6. The result (Real / Deepfake) is displayed during the call.

---

## Model Details

- Dataset: MIT Deepfake Dataset
- Framework: PyTorch
- Task: Binary Classification (Real vs Deepfake)
- Inference Mode: Frame-level real-time prediction
- Deployment: Flask-based inference server

---

## Model Access

Due to model size constraints (>1GB), the trained model weights cannot be hosted directly on GitHub.

Download the trained model here:

[https://drive.google.com/file/d/1edHYjBGsDIE7MZJf2WFn_4T7BpGQGKIy/view?usp=sharing](https://drive.google.com/file/d/1edHYjBGsDIE7MZJf2WFn_4T7BpGQGKIy/view?usp=sharing)

After downloading, update the model path in:

`apiServer.py` (Line 20)

before starting the API server.

---

## Installation & Setup

### Backend (Video Call Server)

```bash
cd server
npm install
node server.js
```

### Deepfake Detection API

```bash
cd model
pip install -r requirements.txt
python apiServer.py
```

Ensure the model path is correctly configured before starting the API server.

---

## Use Cases

- Secure video conferencing
- Identity verification systems
- Remote interviews and examinations
- Online proctoring
- Financial KYC verification
- Cybersecurity research

---

## Future Work

- Temporal sequence-based detection (video-level inference)
- Latency optimization for edge deployment
- Multi-face detection and simultaneous classification
- Integration with authentication systems
- Browser-side inference

---

## Disclaimer

This project was developed for research and cybersecurity experimentation purposes. Deepfake generation components are used strictly to evaluate detection robustness under adversarial conditions.

---

## Authors

Team The Defenders
CDAC Noida Cybersecurity Hackathon 2025

Dataset: MIT Deepfake Dataset

---
