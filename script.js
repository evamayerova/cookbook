// State Management
// Recipes are now loaded globally from recipes-data.js via window.recipesData
let recipes = window.recipesData || [];

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
const viewRecipeModal = document.getElementById('viewRecipeModal');
const closeViewModal = document.getElementById('closeViewModal');

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

closeViewModal.addEventListener('click', () => closeModal(viewRecipeModal));

window.addEventListener('click', (e) => {
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
        <input type="number" step="any" class="ing-amount" placeholder="Qty" required>
        <input type="text" class="ing-unit" list="unitList" placeholder="Unit">
        <input type="text" class="ing-name" list="ingredientList" placeholder="Ingredient" required>
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

    // Update custom options
    if (newRecipe.category && !defaultCategories.includes(newRecipe.category) && !customCategories.includes(newRecipe.category)) {
        customCategories.push(newRecipe.category);
    }
    
    newIngredients.forEach(ing => {
        if (ing.unit && !defaultUnits.includes(ing.unit) && !customUnits.includes(ing.unit)) {
            customUnits.push(ing.unit);
        }
        if (ing.name && !defaultIngredients.includes(ing.name) && !customIngredients.includes(ing.name)) {
            customIngredients.push(ing.name);
        }
    });

    recipes.push(newRecipe);
    saveRecipes();
    saveCustomOptions();
    populateDatalists();
    
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
