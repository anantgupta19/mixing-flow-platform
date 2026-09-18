from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import INPUT_FEATURES
from .predictor import predictor
from .schemas import PredictionRequest, PredictionResponse


app = FastAPI(
    title="Fluid Mixing Pattern Prediction API",
    description=(
        "Machine-learning API for predicting spatial fluid "
        "mixing concentration fields from four inlet flow rates."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
# During development, allow the React frontend to communicate
# with the FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model": predictor.model_name,
        "model_loaded": True,
    }


# ---------------------------------------------------------
# Model information
# ---------------------------------------------------------
@app.get("/model-info")
def model_info():
    return {
        "model_name": predictor.model_name,
        "input_features": INPUT_FEATURES,
        "input_dimension": len(INPUT_FEATURES),
        "output_dimension": predictor.output_dimension,
        "grid_shape": list(predictor.grid_shape),
        "valid_cells": int(predictor.valid_mask.sum()),
        "output_type": predictor.output_type,
    }


# ---------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------
@app.post(
    "/predict",
    response_model=PredictionResponse,
)
def predict(request: PredictionRequest):

    try:
        result = predictor.predict(
            [
                request.I1,
                request.I2,
                request.I3,
                request.I4,
            ]
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        ) from exc