import React, { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipes = async () => {
    if (!query.trim()) {
      setError("Please enter an ingredient or recipe name.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      // 1️⃣ Search by name
      let response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      let data = await response.json();

      if (data.meals) {
        setRecipes(data.meals);
      } else {
        // 2️⃣ If not found, search by ingredient
        response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`
        );
        data = await response.json();

        if (data.meals) {
          // 🔄 Fetch full details for each meal
          const detailedMeals = await Promise.all(
            data.meals.map(async (meal) => {
              const detailRes = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
              );
              const detailData = await detailRes.json();
              return detailData.meals[0];
            })
          );
          setRecipes(detailedMeals);
        } else {
          setError("No recipes found. Try another ingredient or recipe name.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching recipes.");
    }

    setLoading(false);
  };

  // Helper: Extract ingredients + measures into an array
  const getIngredients = (recipe) => {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }
    return ingredients;
  };

  return (
    <div className="App">
      <h1>🍲 Recipe Finder</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter ingredient or recipe name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchRecipes}>Search</button>
      </div>

      {loading && <p>Loading recipes...</p>}
      {error && <p className="error">{error}</p>}

      <div className="recipes-container">
        {recipes.map((recipe) => (
          <div key={recipe.idMeal} className="recipe-card">
            <h3>{recipe.strMeal}</h3>
            <img src={recipe.strMealThumb} alt={recipe.strMeal} />
            {recipe.strArea && recipe.strCategory && (
              <p>
                {recipe.strArea} - {recipe.strCategory}
              </p>
            )}

            {/* Ingredients List */}
            <h4>Ingredients:</h4>
            <ul>
              {getIngredients(recipe).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {/* Recipe Link */}
            <a
              href={recipe.strSource || recipe.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Full Recipe
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
