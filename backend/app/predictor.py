from pathlib import Path

import joblib
import numpy as np


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "model"
    / "mixing_website_model.joblib"
)


class MixingPredictor:
    def __init__(self):
        self.package = joblib.load(MODEL_PATH)

        self.model = self.package["model"]
        self.valid_mask = np.asarray(self.package["valid_mask"], dtype=bool)

        self.model_name = self.package.get(
            "model_name",
            "Polynomial Ridge"
        )

        self.input_features = self.package.get(
            "input_features",
            ["I1", "I2", "I3", "I4"]
        )

        self.grid_shape = tuple(
            self.package.get("grid_shape", (15, 15))
        )

        self.output_dimension = int(
            self.package.get("output_dimension", 193)
        )

        self.output_type = self.package.get(
            "output_type",
            "Normalized Concentration"
        )

    def predict(self, inputs):
        """
        Predict the 193 valid spatial concentration values.
        """
        X = np.asarray(inputs, dtype=float).reshape(1, -1)

        if X.shape[1] != 4:
            raise ValueError(
                f"Expected 4 inputs, received {X.shape[1]}"
            )

        prediction = self.model.predict(X)

        prediction = np.asarray(prediction, dtype=float).reshape(-1)

        if prediction.size != self.output_dimension:
            raise ValueError(
                f"Expected {self.output_dimension} outputs, "
                f"received {prediction.size}"
            )

        if not np.all(np.isfinite(prediction)):
            raise ValueError(
                "Model generated NaN or infinite values."
            )

        return prediction

    def reconstruct_grid(self, prediction):
        """
        Place the 193 predicted values into the true 15x15
        spatial mask used by the original project.
        """
        prediction = np.asarray(prediction, dtype=float).reshape(-1)

        grid = np.full(
            self.grid_shape,
            np.nan,
            dtype=float
        )

        grid[self.valid_mask] = prediction

        return grid

    def predict_with_grid(self, inputs):
        prediction = self.predict(inputs)
        grid = self.reconstruct_grid(prediction)

        return prediction, grid

    def statistics(self, prediction):
        prediction = np.asarray(prediction, dtype=float)

        return {
            "minimum": float(np.min(prediction)),
            "maximum": float(np.max(prediction)),
            "mean": float(np.mean(prediction)),
            "valid_cells": int(prediction.size),
        }


predictor = MixingPredictor()