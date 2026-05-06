const recipes = [
    {
        id: 1,
        title: "Truffle Mushroom Pasta",
        description: "A rich and creamy pasta dish infused with the earthy aroma of black truffles, finished with a sprinkle of aged parmesan.",
        image: "assets/recipe_pasta.png",
        author: "Chef Luigi",
        category: "Dinner",
        time: "30 min"
    },
    {
        id: 2,
        title: "Seared Salmon & Asparagus",
        description: "Perfectly seared Atlantic salmon served over tender grilled asparagus, drizzled with a delicate lemon butter caper sauce.",
        image: "assets/recipe_salmon.png",
        author: "Sarah Jenkins",
        category: "Seafood",
        time: "25 min"
    },
    {
        id: 3,
        title: "Decadent Chocolate Lava Cake",
        description: "A rich chocolate cake with a molten center, served warm and complemented by a vibrant, tart raspberry coulis.",
        image: "assets/recipe_dessert.png",
        author: "Pastry Chef Mia",
        category: "Dessert",
        time: "40 min"
    }
];

const recipesGrid = document.getElementById('recipesGrid');
const searchInput = document.getElementById('searchInput');

function renderRecipes(recipesToRender) {
    recipesGrid.innerHTML = '';
    
    if (recipesToRender.length === 0) {
        recipesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No recipes found.</p>';
        return;
    }

    recipesToRender.forEach((recipe, index) => {
        // Create an initial style with animation delay for staggered entrance
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        card.innerHTML = `
            <div class="image-container">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
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
                        <div class="author-avatar">${recipe.author.charAt(0)}</div>
                        <span class="author-name">${recipe.author}</span>
                    </div>
                    <button class="btn-view">View Recipe</button>
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
        recipe.category.toLowerCase().includes(searchTerm)
    );
    renderRecipes(filteredRecipes);
});

// Add keyframes for the staggered animation dynamically
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
