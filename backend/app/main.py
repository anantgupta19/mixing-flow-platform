import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .predictor import predictor
from .schemas import (
    PredictionRequest,
    PredictionResponse,
)


app = FastAPI(
    title="FluidMix AI API",
    description="ML-based spatial fluid mixing pattern prediction API",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
	"http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/health")
def health():
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
        "input_features": predictor.input_features,
        "input_dimension": 4,
        "output_dimension": predictor.output_dimension,
        "grid_shape": list(predictor.grid_shape),
        "valid_cells": int(np_count_valid_cells()),
        "output_type": predictor.output_type,
    }


def np_count_valid_cells():
    return int(predictor.valid_mask.sum())


# ---------------------------------------------------------
# Prediction
# ---------------------------------------------------------

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):

    try:
        inputs = [
            request.I1,
            request.I2,
            request.I3,
            request.I4,
        ]

        prediction, grid = predictor.predict_with_grid(inputs)

        statistics = predictor.statistics(prediction)

        # Convert NaN outside the physical domain to JSON null.
        grid_json = [
            [
                None if not isinstance(value, float)
                or value != value
                else float(value)
                for value in row
            ]
            for row in grid.tolist()
        ]

        return PredictionResponse(
            model_name=predictor.model_name,
            inputs=inputs,
            prediction=prediction.tolist(),
            grid=grid_json,
            statistics=statistics,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )