from fastapi import APIRouter
from app.models.schemas import NutritionRequest, NutritionInfo
from app.services.calculator import calculate_nutrition

router = APIRouter()


@router.post("/calculate", response_model=NutritionInfo)
async def calculate(req: NutritionRequest) -> NutritionInfo:
    return await calculate_nutrition(req.ingredients)
