# Fluid Mixing Pattern Prediction Platform

Machine-learning-based prediction platform for estimating spatial fluid mixing concentration fields from four inlet flow rates.

## Project Overview

The system predicts a normalized concentration field inside a fluid mixing chamber using four inlet flow rates:

- I1 — Inlet flow rate 1
- I2 — Inlet flow rate 2
- I3 — Inlet flow rate 3
- I4 — Inlet flow rate 4

The machine-learning model predicts 193 valid spatial cells, which are reconstructed into a 15 × 15 spatial concentration field.

## Machine Learning Model

Current deployment model:

**Polynomial Ridge Regression**

### Model Configuration

| Parameter | Value |
|---|---|
| Input features | I1, I2, I3, I4 |
| Input dimension | 4 |
| Output dimension | 193 |
| Spatial grid | 15 × 15 |
| Valid spatial cells | 193 |
| Output | Normalized Concentration |

## Application Architecture

```text
React Frontend
       ↓
FastAPI Backend
       ↓
Prediction Service
       ↓
Trained ML Model
       ↓
193 Spatial Predictions
       ↓
15 × 15 Spatial Field
       ↓
Interactive Heatmap

Project Structure
mixing-flow-platform/
│
├── backend/
│   ├── app/
│   ├── model/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
├── docs/
├── .gitignore
├── docker-compose.yml
└── README.md
Technology Stack
Backend
Python
FastAPI
Scikit-learn
Joblib
Frontend
React
Vite
Deployment
Docker
GitHub