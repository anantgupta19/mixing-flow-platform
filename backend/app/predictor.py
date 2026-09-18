from pathlib import Path

import joblib
import numpy as np

from .config import MODEL_PATH, GRID_ROWS, GRID_COLS


class MixingPredictor:
    """
    Loads the trained fluid-mixing ML model and performs inference.
    """

    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {self.model_path}"
            )

        self.package = joblib.load(self.model_path)

        self.model = self.package["model"]
        self.valid_mask = np.asarray(
            self.package["valid_mask"],
            dtype=bool
        )

        self.model_name = self.package["model_name"]
        self.input_features = self.package["input_features"]
        self.output_dimension = int(self.package["output_dimension"])
        self.grid_shape = tuple(self.package["grid_shape"])
        self.output_type = self.package["output_type"]

        self._validate_package()

    def _validate_package(self):
        """Validate the saved deployment package."""

        if self.output_dimension != 193:
            raise ValueError(
                f"Expected 193 outputs, got {self.output_dimension}"
            )

        if self.grid_shape != (GRID_ROWS, GRID_COLS):
            raise ValueError(
                f"Expected grid {(GRID_ROWS, GRID_COLS)}, "
                f"got {self.grid_shape}"
            )

        if self.valid_mask.shape != self.grid_shape:
            raise ValueError(
                f"Invalid mask shape: {self.valid_mask.shape}"
            )

        valid_cells = int(self.valid_mask.sum())

        if valid_cells != self.output_dimension:
            raise ValueError(
                f"Valid cells ({valid_cells}) != "
                f"output dimension ({self.output_dimension})"
            )

    def predict(self, inputs: list[float]) -> dict:
        """
        Predict the concentration field for four inlet flow rates.

        Parameters
        ----------
        inputs : list[float]
            [I1, I2, I3, I4]

        Returns
        -------
        dict
            Prediction values and reconstructed 15x15 field.
        """

        if len(inputs) != 4:
            raise ValueError(
                "Exactly four inputs are required: I1, I2, I3, I4."
            )

        x = np.asarray(inputs, dtype=np.float64).reshape(1, 4)

        if not np.all(np.isfinite(x)):
            raise ValueError("Input values must be finite numbers.")

        # ML inference
        prediction = self.model.predict(x)[0]

        prediction = np.asarray(
            prediction,
            dtype=np.float64
        ).reshape(-1)

        if prediction.shape[0] != self.output_dimension:
            raise ValueError(
                f"Model returned {prediction.shape[0]} values; "
                f"expected {self.output_dimension}."
            )

        if not np.all(np.isfinite(prediction)):
            raise ValueError(
                "Model produced NaN or infinite predictions."
            )

        # Reconstruct the 193 valid cells into a 15x15 grid.
        # Invalid cells are represented as None for JSON compatibility.
        grid = np.full(
            self.grid_shape,
            np.nan,
            dtype=np.float64
        )

        grid[self.valid_mask] = prediction

        # Convert NaN → None for JSON
        grid_json = [
            [
                None if not np.isfinite(value) else float(value)
                for value in row
            ]
            for row in grid
        ]

        return {
            "model_name": self.model_name,
            "inputs": {
                "I1": float(inputs[0]),
                "I2": float(inputs[1]),
                "I3": float(inputs[2]),
                "I4": float(inputs[3]),
            },
            "output_type": self.output_type,
            "output_dimension": self.output_dimension,
            "grid_shape": list(self.grid_shape),
            "valid_cells": int(self.valid_mask.sum()),
            "prediction": [float(value) for value in prediction],
            "grid": grid_json,
            "statistics": {
                "minimum": float(prediction.min()),
                "maximum": float(prediction.max()),
                "mean": float(prediction.mean()),
            },
        }


# Load the model once when the application starts.
# This avoids loading the .joblib file for every request.
predictor = MixingPredictor()