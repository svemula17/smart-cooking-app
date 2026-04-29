import pytest
from app.models.schemas import IngredientInput
from app.services.calculator import calculate_nutrition


@pytest.mark.asyncio
async def test_calculate_chicken_and_rice():
    result = await calculate_nutrition([
        IngredientInput(name="chicken breast", quantity_g=200),
        IngredientInput(name="white rice", quantity_g=150),
    ])
    assert result.calories > 0
    assert result.protein_g > 0
