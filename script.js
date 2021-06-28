

setTimeout(function() {
  alert("This is a recipe app. \nClick the heart button to add meals to favorite. \nSearch for favorite meals with the input box. \nClick the close button after each favorite meal to remove from favorite. \nClick the refresh button to get more random meals. \nClick on the favorite meal images to see the recipe instructions and measurements. \n\nCreated by Vickon.")
}, 4000)



const favMeals = document.querySelector(".fav_meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const meal = document.getElementById("meal");
const mealContainer = document.querySelector(".meal-container")

getRandomMeals()
fetchFavMeals();

async function getRandomMeals() {
  const response = await (await fetch("https://www.themealdb.com/api/json/v1/1/random.php")).json();

  const responseData = response.meals[0];
  addMeal(responseData, true, "Random")
}

async function getMealsById(id) {
  const response = await (await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)).json();

  const responseData = response.meals[0];
  return responseData;
}

async function getMealsBySearch(name) {
  const response = await (await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + name)).json();

  const responseData = response.meals; //all arrays of search name
  return responseData;
}



function addMeal(mealData, random = false, badge) {
  const div = document.createElement("div")
  const mealTag = `
    <div class="meal_header">
      ${random ? `<span class="random">
      ${badge} Recipe</span>`: "Not available"}
      
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal_body">
      <h4>${mealData.strMeal}</h4>
      <button class="refresh" onclick="reloadPage()">Refresh</button>
      <button class="fav_btn" onclick= "addToFav(this, ${mealData.idMeal})"><i class="fas fa-heart"></i></button>
    </div>`;

    div.innerHTML = mealTag;
    meal.appendChild(div)
}

function reloadPage() {
  meal.innerHTML = "";
  getRandomMeals()
}

function addToFav(button, id) {
  if (button.classList.contains("active")) {
    button.classList.remove("active");
    removeMealFromLs(id);
  } else {
    button.classList.add("active");
    addMealToLS(id)
  }
  fetchFavMeals();
}

function addMealToLS(mealId) {
  const mealIds = getMealFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]))
}

function removeMealFromLs(mealId) {
  const mealIds = getMealFromLS();

  localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)))
}

function getMealFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favMeals.innerHTML = "";
  const mealIds = getMealFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    const mealData = await getMealsById(mealId);
    addMealToScreen(mealData);
  }
}


function addMealToScreen(mealData) {
  const li = document.createElement("li");

  li.innerHTML =  `<img onclick = "listFavMeals(${mealData.idMeal})" src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
  <button class="clear-meal" onclick="clearMeal(${mealData.idMeal})"><i class="fas fa-window-close"></i></button>`;

  favMeals.appendChild(li);
}

async function listFavMeals(id) {
  const mealData = await getMealsById(id);

  const ingredients = []

  for (let i = 1; i <= 20; i++) {
    if(mealData["strIngredient" + i]) {
      ingredients.push(`${mealData["strIngredient" + i]} -- ${mealData["strMeasure" + i]}`)
    } else { 
      break;
    }
  }

  const div = document.createElement("div");
  div.classList.add("meal-container-content");

  const divTag = `
  <div class="content-left">  
  <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  </div>
  <div class="content-right">
  <h1>${mealData.strMeal}</h1>
  <p>${mealData.strInstructions}</p>

  <h3>Meal ingredients / Measure</h3>
  <ul>
    ${ingredients.map(ingredient => 
      `<li>${ingredient}</li>`
    ).join("")}
  </ul>
  </div>

<div class="closePopup">
  <button onclick="closePopup()"><i class="fas fa-times"></i></button>
</div>
  `;

  div.innerHTML = divTag;
  mealContainer.appendChild(div);
  mealContainer.classList.add("show");
  meal.innerHTML = "";
  addMeal(mealData, true, "Favorite");
}

function clearMeal(mealId) {
  removeMealFromLs(mealId);
  fetchFavMeals();
}

// localStorage.removeItem("mealIds")

searchBtn.addEventListener("click", async () => {
  const search = searchTerm.value;
  const searchResults = await getMealsBySearch(search);
  
  if (searchResults) {
    meal.innerHTML = "";
    searchResults.forEach(result => {
      addMeal(result, true, "Searched");
    })
  } else {
    alert(search + " is not available")
  }
  
  searchTerm.value = "";
})

function closePopup() {
  mealContainer.classList.remove("show");
  mealContainer.innerHTML = "";
}
