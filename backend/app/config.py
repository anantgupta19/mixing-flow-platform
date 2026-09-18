from pathlib import Path


# backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# backend/model/
MODEL_DIR = BASE_DIR / "model"

# Final trained deployment model
MODEL_PATH = MODEL_DIR / "mixing_website_model.joblib"

# Spatial grid
GRID_ROWS = 15
GRID_COLS = 15

# Model input features
INPUT_FEATURES = ["I1", "I2", "I3", "I4"]