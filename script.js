// Default recipes
const defaultRecipes = [
    {
        id: 1,
        title: "Truffle Mushroom Pasta",
        description: "A rich and creamy pasta dish infused with the earthy aroma of black truffles, finished with a sprinkle of aged parmesan.",
        image: "assets/recipe_pasta.png",
        author: "Chef Luigi",
        category: "Dinner",
        time: "30 min",
        ingredients: [
            { amount: "1", unit: "lb", name: "Fettuccine pasta" },
            { amount: "2", unit: "tbsp", name: "Butter" },
            { amount: "8", unit: "oz", name: "Cremini mushrooms, sliced" },
            { amount: "1", unit: "cup", name: "Heavy cream" },
            { amount: "2", unit: "tsp", name: "Truffle oil" }
        ],
        steps: [
            "Boil water and cook the fettuccine pasta according to package directions.",
            "In a large skillet, melt the butter over medium heat.",
            "Add the mushrooms and sauté until browned.",
            "Stir in the heavy cream and let it simmer for 5 minutes until slightly thickened.",
            "Remove from heat, drizzle with truffle oil, and toss with the cooked pasta."
        ]
    },
    {
        id: 2,
        title: "Seared Salmon & Asparagus",
        description: "Perfectly seared Atlantic salmon served over tender grilled asparagus, drizzled with a delicate lemon butter caper sauce.",
        image: "assets/recipe_salmon.png",
        author: "Sarah Jenkins",
        category: "Seafood",
        time: "25 min",
        ingredients: [
            { amount: "2", unit: "lbs", name: "Salmon fillets" },
            { amount: "1", unit: "bunch", name: "Asparagus" },
            { amount: "2", unit: "tbsp", name: "Olive oil" },
            { amount: "1", unit: "tbsp", name: "Lemon juice" }
        ],
        steps: [
            "Preheat a grill or skillet over medium-high heat.",
            "Rub the salmon and asparagus with olive oil, salt, and pepper.",
            "Sear the salmon for 4-5 minutes per side until cooked through.",
            "Grill the asparagus for 5-7 minutes until tender.",
            "Drizzle everything with fresh lemon juice before serving."
        ]
    },
    {
        id: 3,
        title: "Decadent Chocolate Lava Cake",
        description: "A rich chocolate cake with a molten center, served warm and complemented by a vibrant, tart raspberry coulis.",
        image: "assets/recipe_dessert.png",
        author: "Pastry Chef Mia",
        category: "Dessert",
        time: "40 min",
        ingredients: [
            { amount: "4", unit: "oz", name: "Semi-sweet chocolate" },
            { amount: "1/2", unit: "cup", name: "Butter" },
            { amount: "1", unit: "cup", name: "Powdered sugar" },
            { amount: "2", unit: "whole", name: "Eggs" },
            { amount: "2", unit: "whole", name: "Egg yolks" },
            { amount: "6", unit: "tbsp", name: "All-purpose flour" }
        ],
        steps: [
            "Preheat oven to 425°F (220°C). Grease 4 ramekins.",
            "Microwave chocolate and butter in a bowl until melted (about 1 minute).",
            "Stir in powdered sugar until well blended.",
            "Whisk in eggs and egg yolks.",
            "Stir in flour.",
            "Divide batter evenly among ramekins.",
            "Bake for 13-14 minutes until the sides are firm but the center is soft.",
            "Let cool for 1 minute, then invert onto a plate."
        ]
    }
];

// State Management
let recipes = JSON.parse(localStorage.getItem('recipes')) || defaultRecipes;

function saveRecipes() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Unit Conversion Utility
function convertUnit(amountStr, unitStr) {
    if (!unitStr) return '';
    const unit = unitStr.toLowerCase().trim();

    // Parse amount to number (handling basic fractions roughly like 1/2 = 0.5)
    let amount = 0;
    if (amountStr.includes('/')) {
        const parts = amountStr.split('/');
        if (parts.length === 2) {
            amount = parseFloat(parts[0]) / parseFloat(parts[1]);
        }
    } else {
        amount = parseFloat(amountStr);
    }

    if (isNaN(amount)) return ''; // Cannot convert

    let metricUnit = '';
    let metricVal = 0;

    switch (unit) {
        case 'cup':
        case 'cups':
            metricVal = amount * 240;
            metricUnit = 'ml';
            break;
        case 'oz':
        case 'ounce':
        case 'ounces':
            metricVal = amount * 28;
            metricUnit = 'g';
            break;
        case 'lb':
        case 'lbs':
        case 'pound':
        case 'pounds':
            metricVal = amount * 453;
            metricUnit = 'g';
            break;
        case 'tbsp':
        case 'tablespoon':
        case 'tablespoons':
            metricVal = amount * 15;
            metricUnit = 'ml';
            break;
        case 'tsp':
        case 'teaspoon':
        case 'teaspoons':
            metricVal = amount * 5;
            metricUnit = 'ml';
            break;
        case 'fl oz':
        case 'fluid ounce':
            metricVal = amount * 30;
            metricUnit = 'ml';
            break;
        case 'pt':
        case 'pint':
        case 'pints':
            metricVal = amount * 473;
            metricUnit = 'ml';
            break;
        case 'qt':
        case 'quart':
        case 'quarts':
            metricVal = amount * 946;
            metricUnit = 'ml';
            break;
        case 'gal':
        case 'gallon':
        case 'gallons':
            metricVal = amount * 3785;
            metricUnit = 'ml';
            break;
        default:
            return ''; // No conversion for this unit
    }

    return `(${Math.round(metricVal)}${metricUnit})`;
}

// DOM Elements
const recipesGrid = document.getElementById('recipesGrid');
const searchInput = document.getElementById('searchInput');

// Modal Elements
const addRecipeModal = document.getElementById('addRecipeModal');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addRecipeForm = document.getElementById('addRecipeForm');

const viewRecipeModal = document.getElementById('viewRecipeModal');
const closeViewModal = document.getElementById('closeViewModal');

// Dynamic Form Elements
const ingredientsList = document.getElementById('ingredientsList');
const addIngredientBtn = document.getElementById('addIngredientBtn');
const stepsList = document.getElementById('stepsList');
const addStepBtn = document.getElementById('addStepBtn');

// Render Grid
function renderRecipes(recipesToRender) {
    recipesGrid.innerHTML = '';

    if (recipesToRender.length === 0) {
        recipesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No recipes found.</p>';
        return;
    }

    recipesToRender.forEach((recipe, index) => {
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        card.innerHTML = `
            <div class="image-container">
                <img src="${imgUrl}" alt="${recipe.title}" class="recipe-image" loading="lazy">
            </div>
            <div class="recipe-content">
                <div class="recipe-meta">
                    <span>${recipe.category}</span>
                    <span>⏱ ${recipe.time}</span>
                </div>
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-desc">${recipe.description}</p>
                <div class="recipe-footer">
                    <div class="author">
                        <div class="author-avatar">${recipe.author.charAt(0).toUpperCase()}</div>
                        <span class="author-name">${recipe.author}</span>
                    </div>
                    <button class="btn-view" onclick="openViewModal(${recipe.id})">View Recipe</button>
                </div>
            </div>
        `;
        recipesGrid.appendChild(card);
    });
}

// Initial render
renderRecipes(recipes);

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.category.toLowerCase().includes(searchTerm) ||
        (recipe.ingredients && recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm)))
    );
    renderRecipes(filteredRecipes);
});

// Modal Logic
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

addRecipeBtn.addEventListener('click', () => {
    addRecipeForm.reset();
    openModal(addRecipeModal);
});

closeAddModal.addEventListener('click', () => closeModal(addRecipeModal));
cancelAddBtn.addEventListener('click', () => closeModal(addRecipeModal));
closeViewModal.addEventListener('click', () => closeModal(viewRecipeModal));

window.addEventListener('click', (e) => {
    if (e.target === addRecipeModal) closeModal(addRecipeModal);
    if (e.target === viewRecipeModal) closeModal(viewRecipeModal);
});

// View Modal Logic
window.openViewModal = function (id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById('viewTitle').innerText = recipe.title;
    document.getElementById('viewMeta').innerHTML = `<span>By ${recipe.author}</span><span>${recipe.category}</span><span>⏱ ${recipe.time}</span>`;
    document.getElementById('viewDesc').innerText = recipe.description;

    const viewIngredients = document.getElementById('viewIngredients');
    viewIngredients.innerHTML = '';
    if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
            const conversion = convertUnit(ing.amount, ing.unit);
            const unitText = ing.unit ? ` ${ing.unit}` : '';
            const conversionText = conversion ? ` <span style="color:var(--text-secondary);font-size:0.9em">${conversion}</span>` : '';

            const li = document.createElement('li');
            li.innerHTML = `<strong>${ing.amount}${unitText}</strong>${conversionText} ${ing.name}`;
            viewIngredients.appendChild(li);
        });
    }

    const viewSteps = document.getElementById('viewSteps');
    viewSteps.innerHTML = '';
    if (recipe.steps) {
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.innerText = step;
            viewSteps.appendChild(li);
        });
    }

    openModal(viewRecipeModal);
};

// Dynamic Form Logic
addIngredientBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" class="ing-amount" placeholder="e.g. 2" required>
        <input type="text" class="ing-unit" placeholder="e.g. cups">
        <input type="text" class="ing-name" placeholder="e.g. Flour" required>
        <button type="button" class="remove-row-btn">&times;</button>
    `;
    ingredientsList.appendChild(row);
});

addStepBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'step-row';
    const num = stepsList.children.length + 1;
    row.innerHTML = `
        <span class="step-number">${num}.</span>
        <textarea class="step-desc" placeholder="Instruction step..." required rows="1"></textarea>
        <button type="button" class="remove-row-btn">&times;</button>
    `;
    stepsList.appendChild(row);
});

// Remove dynamic rows
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-row-btn')) {
        const row = e.target.parentElement;
        const parent = row.parentElement;
        row.remove();

        // Recalculate step numbers if a step was removed
        if (parent.id === 'stepsList') {
            Array.from(parent.children).forEach((child, index) => {
                child.querySelector('.step-number').innerText = `${index + 1}.`;
            });
        }
    }
});

// Handle Form Submission
addRecipeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather ingredients
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    const newIngredients = Array.from(ingredientRows).map(row => ({
        amount: row.querySelector('.ing-amount').value.trim(),
        unit: row.querySelector('.ing-unit').value.trim(),
        name: row.querySelector('.ing-name').value.trim()
    }));

    // Gather steps
    const stepRows = document.querySelectorAll('.step-row');
    const newSteps = Array.from(stepRows).map(row => row.querySelector('.step-desc').value.trim());

    const newRecipe = {
        id: Date.now(),
        title: document.getElementById('recipeTitle').value.trim(),
        author: document.getElementById('recipeAuthor').value.trim(),
        category: document.getElementById('recipeCategory').value.trim(),
        time: document.getElementById('recipeTime').value.trim(),
        image: document.getElementById('recipeImage').value.trim(),
        description: document.getElementById('recipeDesc').value.trim(),
        ingredients: newIngredients,
        steps: newSteps
    };

    recipes.push(newRecipe);
    saveRecipes();
    renderRecipes(recipes);
    closeModal(addRecipeModal);
});

// Animation Keyframes
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);
