from typing import List, Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    I1: float = Field(..., description="Left inlet flow rate")
    I2: float = Field(..., description="Upper inlet flow rate")
    I3: float = Field(..., description="Right inlet flow rate")
    I4: float = Field(..., description="Lower inlet flow rate")


class PredictionStatistics(BaseModel):
    minimum: float
    maximum: float
    mean: float
    valid_cells: int


class PredictionResponse(BaseModel):
    model_name: str
    inputs: List[float]
    prediction: List[float]
    grid: List[List[Optional[float]]]
    statistics: PredictionStatistics