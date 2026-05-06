// State Management
// Recipes are now loaded globally from recipes-data.js via window.recipesData
let recipes = window.recipesData || [];

// Parsing and Formatting Utilities
function parseAmount(amountStr) {
    if (!amountStr) return 0;
    const parts = amountStr.toString().trim().split(' ');
    let total = 0;
    for (let part of parts) {
        if (part.includes('/')) {
            const [num, den] = part.split('/');
            total += parseFloat(num) / parseFloat(den);
        } else {
            total += parseFloat(part);
        }
    }
    return isNaN(total) ? amountStr : total;
}

function formatAmount(amountNum) {
    if (typeof amountNum !== 'number') return amountNum;
    return Number.isInteger(amountNum) ? amountNum.toString() : parseFloat(amountNum.toFixed(2)).toString();
}

// Unit Conversion Utility
function convertUnit(amountNum, unitStr) {
    if (!unitStr || typeof amountNum !== 'number') return '';
    const unit = unitStr.toLowerCase().trim();
    const amount = amountNum;

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
                    <a href="recipe.html?id=${recipe.id}" class="btn-view">View Recipe</a>
                </div>
            </div>
        `;
        recipesGrid.appendChild(card);
    });
}

// Execute index.html specific logic
if (recipesGrid) {
    // Initial render
    renderRecipes(recipes);

    // Search functionality
    if (searchInput) {
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
    }
}

// Execute recipe.html specific logic
const recipeDetailContainer = document.getElementById('recipeDetailContainer');
if (recipeDetailContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));
    const recipe = recipes.find(r => r.id === recipeId);

    if (recipe) {
        document.getElementById('pageTitle').innerText = recipe.title;
        document.getElementById('pageMeta').innerHTML = `<span>By ${recipe.author}</span><span>${recipe.category}</span><span>⏱ ${recipe.time}</span>`;
        document.getElementById('pageDesc').innerText = recipe.description;
        
        const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        document.getElementById('pageImageContainer').innerHTML = `<img src="${imgUrl}" alt="${recipe.title}" loading="lazy">`;

        let currentPortions = recipe.portions || 4;
        const originalPortions = recipe.portions || 4;
        const pageIngredients = document.getElementById('pageIngredients');
        const portionsDisplay = document.getElementById('portionsDisplay');
        const btnIncrease = document.getElementById('btnIncreasePortion');
        const btnDecrease = document.getElementById('btnDecreasePortion');

        function renderIngredients() {
            pageIngredients.innerHTML = '';
            portionsDisplay.innerText = `${currentPortions} portion${currentPortions > 1 ? 's' : ''}`;
            const multiplier = currentPortions / originalPortions;

            if (recipe.ingredients) {
                recipe.ingredients.forEach(ing => {
                    const parsedOriginal = parseAmount(ing.amount);
                    let displayAmount = ing.amount;
                    let amountForConversion = null;

                    if (typeof parsedOriginal === 'number') {
                        const newAmount = parsedOriginal * multiplier;
                        displayAmount = formatAmount(newAmount);
                        amountForConversion = newAmount;
                    }

                    const conversion = convertUnit(amountForConversion, ing.unit);
                    const unitText = ing.unit ? ` ${ing.unit}` : '';
                    const conversionText = conversion ? ` <span style="color:var(--text-secondary);font-size:0.9em">${conversion}</span>` : '';

                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${displayAmount}${unitText}</strong>${conversionText} ${ing.name}`;
                    pageIngredients.appendChild(li);
                });
            }
        }

        renderIngredients();

        if (btnIncrease && btnDecrease) {
            btnIncrease.addEventListener('click', () => {
                currentPortions++;
                renderIngredients();
            });
            btnDecrease.addEventListener('click', () => {
                if (currentPortions > 1) {
                    currentPortions--;
                    renderIngredients();
                }
            });
        }

        const pageSteps = document.getElementById('pageSteps');
        if (recipe.steps) {
            recipe.steps.forEach(step => {
                const li = document.createElement('li');
                li.innerText = step;
                pageSteps.appendChild(li);
            });
        }

        recipeDetailContainer.style.display = 'block';
    } else {
        document.getElementById('recipeNotFound').style.display = 'block';
    }
}


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
