from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    I1: float = Field(..., description="Inlet flow rate 1")
    I2: float = Field(..., description="Inlet flow rate 2")
    I3: float = Field(..., description="Inlet flow rate 3")
    I4: float = Field(..., description="Inlet flow rate 4")


class PredictionStatistics(BaseModel):
    minimum: float
    maximum: float
    mean: float


class PredictionResponse(BaseModel):
    model_name: str
    inputs: dict[str, float]
    output_type: str
    output_dimension: int
    grid_shape: list[int]
    valid_cells: int
    prediction: list[float]
    grid: list[list[float | None]]
    statistics: PredictionStatistics