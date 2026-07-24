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
                    ${recipe.favorite ? '<span title="Favorite">❤️</span>' : ''}
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
    const categoryFilter = document.getElementById('categoryFilter');
    const timeFilter = document.getElementById('timeFilter');
    const favoriteFilter = document.getElementById('favoriteFilter');

    // Populate category filter
    if (categoryFilter) {
        const categories = [...new Set(recipes.map(r => r.category))].filter(Boolean);
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'All';
        const selectedTime = timeFilter ? timeFilter.value : 'All';
        const showFavorites = favoriteFilter ? favoriteFilter.checked : false;

        const filteredRecipes = recipes.filter(recipe => {
            // Search filter
            const matchesSearch = !searchTerm || 
                recipe.title.toLowerCase().includes(searchTerm) ||
                recipe.description.toLowerCase().includes(searchTerm) ||
                recipe.category.toLowerCase().includes(searchTerm) ||
                (recipe.ingredients && recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm)));

            // Category filter
            const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;

            // Time filter
            let matchesTime = true;
            if (selectedTime !== 'All') {
                const recipeTimeNum = parseInt(recipe.time);
                if (!isNaN(recipeTimeNum)) {
                    matchesTime = recipeTimeNum <= parseInt(selectedTime);
                }
            }

            // Favorite filter
            const matchesFavorite = !showFavorites || recipe.favorite === true;

            return matchesSearch && matchesCategory && matchesTime && matchesFavorite;
        });

        renderRecipes(filteredRecipes);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (timeFilter) timeFilter.addEventListener('change', applyFilters);
    if (favoriteFilter) favoriteFilter.addEventListener('change', applyFilters);

    // Initial render
    applyFilters();
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
        const pageSteps = document.getElementById('pageSteps');

        function renderIngredientsAndSteps() {
            pageIngredients.innerHTML = '';
            pageSteps.innerHTML = '';
            portionsDisplay.innerText = `${currentPortions} portion${currentPortions > 1 ? 's' : ''}`;
            const multiplier = currentPortions / originalPortions;

            // Cache scaled amounts for steps templating
            const scaledIngredients = {};

            if (recipe.ingredients) {
                // Group ingredients
                const grouped = {};
                recipe.ingredients.forEach(ing => {
                    const group = ing.group || 'Other';
                    if (!grouped[group]) grouped[group] = [];
                    grouped[group].push(ing);
                });

                for (const [groupName, ings] of Object.entries(grouped)) {
                    if (Object.keys(grouped).length > 1) {
                        const groupHeader = document.createElement('h4');
                        groupHeader.className = 'ingredient-group-header';
                        groupHeader.innerText = groupName;
                        pageIngredients.appendChild(groupHeader);
                    }

                    ings.forEach(ing => {
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

                        if (ing.id) {
                            scaledIngredients[ing.id] = `${displayAmount}${unitText}${conversion ? ` / ${conversion}` : ''}`;
                        }

                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${displayAmount}${unitText}</strong>${conversionText} ${ing.name}`;
                        pageIngredients.appendChild(li);
                    });
                }
            }

            // Preserve checked states
            const checkedIndices = Array.from(pageSteps.querySelectorAll('.step-checkbox'))
                .map((cb, i) => cb.checked ? i : null)
                .filter(i => i !== null);

            pageSteps.innerHTML = '';
            if (recipe.steps) {
                recipe.steps.forEach((step, index) => {
                    let parsedStep = step.replace(/\{([^}]+)\}/g, (match, id) => {
                        return scaledIngredients[id] ? scaledIngredients[id] : match;
                    });
                    
                    const isChecked = checkedIndices.includes(index);
                    const li = document.createElement('li');
                    li.className = 'step-item';
                    li.innerHTML = `
                        <label class="step-checkbox-container ${isChecked ? 'completed' : ''}">
                            <input type="checkbox" class="step-checkbox" ${isChecked ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="step-text">${parsedStep}</span>
                        </label>
                    `;

                    // Add listener for visual feedback
                    li.querySelector('.step-checkbox').addEventListener('change', function() {
                        this.closest('.step-checkbox-container').classList.toggle('completed', this.checked);
                    });

                    pageSteps.appendChild(li);
                });
            }
        }

        renderIngredientsAndSteps();

        if (btnIncrease && btnDecrease) {
            btnIncrease.addEventListener('click', () => {
                currentPortions++;
                renderIngredientsAndSteps();
            });
            btnDecrease.addEventListener('click', () => {
                if (currentPortions > 1) {
                    currentPortions--;
                    renderIngredientsAndSteps();
                }
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

// ==========================================
// Cook Mode & Screen Wake Lock Functionality
// ==========================================
let cookModeActive = localStorage.getItem('cookModeEnabled') === 'true';
let wakeLockObj = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLockObj = await navigator.wakeLock.request('screen');
            wakeLockObj.addEventListener('release', () => {
                wakeLockObj = null;
                // Re-request wake lock if cook mode is active and page is visible
                if (cookModeActive && document.visibilityState === 'visible') {
                    requestWakeLock();
                }
            });
        } catch (err) {
            console.warn('Screen Wake Lock error:', err);
        }
    }
}

async function releaseWakeLock() {
    if (wakeLockObj !== null) {
        try {
            await wakeLockObj.release();
            wakeLockObj = null;
        } catch (err) {
            console.warn('Screen Wake Lock release error:', err);
        }
    }
}

function showToast(message, icon = '🍳') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

async function toggleCookMode(forcedState) {
    if (typeof forcedState === 'boolean') {
        cookModeActive = forcedState;
    } else {
        cookModeActive = !cookModeActive;
    }

    localStorage.setItem('cookModeEnabled', cookModeActive ? 'true' : 'false');
    updateCookModeUI();

    if (cookModeActive) {
        if (!('wakeLock' in navigator)) {
            showToast('Cook Mode ON (Note: Screen wake lock not supported in this browser)', '⚠️');
        } else {
            await requestWakeLock();
            showToast('Cook Mode ON: Screen will stay awake while cooking', '🍳');
        }
    } else {
        await releaseWakeLock();
        showToast('Cook Mode OFF: Normal screen timeout restored', '🌙');
    }
}

function updateCookModeUI() {
    const cookBtns = document.querySelectorAll('.btn-cook-mode');
    cookBtns.forEach(btn => {
        if (cookModeActive) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

function initCookMode() {
    const cookBtns = document.querySelectorAll('.btn-cook-mode');
    cookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCookMode();
        });
    });

    updateCookModeUI();

    if (cookModeActive) {
        requestWakeLock();
    }

    // Re-acquire lock when switching back to tab
    document.addEventListener('visibilitychange', async () => {
        if (cookModeActive && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookMode);
} else {
    initCookMode();
}
