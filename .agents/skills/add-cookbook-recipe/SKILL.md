---
name: add-cookbook-recipe
description: >-
  Use this skill whenever adding, importing, translating, or updating recipes in the
  Cookbook repository. Covers JSON schema, ingredient grouping, step templating,
  image generation, and build/commit procedures.
---

# Add Cookbook Recipe Skill

This skill provides the end-to-end procedure for seamlessly adding or updating recipes in this static Git-driven Cookbook application.

---

## 1. Architecture Overview

- **Static Site**: Hosted via GitHub Pages, rendered with vanilla HTML (`index.html`, `recipe.html`), CSS (`style.css`), and JavaScript (`script.js`).
- **Data Source**: Individual `.json` files in `recipes/` are bundled into `recipes-data.js` via `build.ps1`.
- **CRITICAL**: Never edit `recipes-data.js` directly! Always create or modify the individual `.json` file in `recipes/`, then run the build script.

---

## 2. Recipe File Conventions

### File Location and Naming
- Location: `recipes/<id>-<slug>.json`
- Next ID: Inspect the existing files in `recipes/` to find the highest ID number, and increment by 1 (e.g., if `13-banana-bread.json` is highest, the next is `14-<recipe-name>.json`).
- Slug: Lowercase, hyphen-separated name (e.g. `14-lemon-drizzle-cake.json`).

### Tags System (Multi-tag)
Recipes use a `"tags"` array rather than a single category. A recipe can belong to multiple tags:
- `"Main dish"` (for dinners, lunches, hearty savories)
- `"Dessert"` (for cakes, pies, sweet baked goods, ice cream, truffles)
- `"Snacks"` (for portable bites, patties, fritters, rolls)
- `"Low-Carb"` (for keto, grain-free, sugar-free, or naturally low-carb dishes)
- `"Breakfast"` (for waffles, pancakes, breakfast breads, morning dishes)
- `"Christmas cookies"` (for holiday baking, traditional cookies)

*Example:* A low-carb sweet bite can have `"tags": ["Snacks", "Dessert", "Low-Carb"]`.

### Ingredient Grouping
All ingredients must have a `group` property. Use standard group names:
- `"Dry Ingredients"` (flour, sugar, baking soda, cocoa, etc.)
- `"Dairy & Eggs"` (butter, milk, eggs, cream, yogurt, cheese)
- `"Protein"` (meat, chicken, fish, tofu, paneer, beans)
- `"Vegetables"` (onion, garlic, peppers, tomatoes, spinach, herbs)
- `"Fruit"` (bananas, berries, apples, rhubarb, etc.)
- `"Seasoning"` (salt, vanilla extract, cinnamon, spices, pepper)
- `"Chocolate"` (chocolate chips, baking bars, melted chocolate)
- `"Noodles"` / `"Main"` (pasta, noodles, rice)
- `"Sauce"` (prepared sauces, tamarind paste, stocks)
- `"Add-ins"` / `"Other"` (nuts, seeds, oils)

### Step Templating & Dynamic Math
Every ingredient must have a unique, concise snake_case `id` (e.g., `"flour"`, `"butter"`, `"vanilla"`).

**In the `steps` array:**
Whenever an ingredient is mentioned in a step, wrap its ID in curly braces: `{ingredient_id}`.
*Example:*
```json
"steps": [
    "In a large bowl, cream the softened butter ({butter}) and sugar ({sugar}) until fluffy.",
    "Whisk in the eggs ({eggs}) and vanilla ({vanilla}).",
    "Fold in the flour mixture ({flour}) and salt ({salt})."
]
```
The frontend JavaScript automatically parses `{id}` and dynamically calculates and replaces it with the portion-adjusted quantity and metric conversion (e.g. `"150 g / (150g)"`).

---

## 3. Recipe JSON Schema

```json
{
    "id": 14,
    "title": "Recipe Title",
    "description": "Short appetizing 1-2 sentence description.",
    "image": "assets/recipe_<slug>.png",
    "author": "Chef Name / Website",
    "tags": [
        "Dessert",
        "Low-Carb"
    ],
    "time": "45 min",
    "portions": 4,
    "favorite": false,
    "ingredients": [
        {
            "id": "ingredient_id",
            "amount": "250",
            "unit": "g",
            "name": "Full name with prep note (e.g., All-purpose flour, sifted)",
            "group": "Dry Ingredients"
        }
    ],
    "steps": [
        "First step referring to {ingredient_id} with clear instructions.",
        "Second step..."
    ]
}
```

---

## 4. Step-by-Step Procedure to Add a Recipe

### Step 1: Research / Translate Recipe
1. If the user provides a URL, fetch content using `read_url_content`.
2. If the user provides a recipe in another language (e.g. Czech), translate all titles, descriptions, ingredient names, and instructions into fluent English.
3. Check if the user specified any customizations (e.g. "adjust sugar to 100g", "mark as favorite").

### Step 2: Determine Next ID & Filename
1. List `recipes/` with `list_dir` to find the highest number ID.
2. Set the new ID = `highest_id + 1`.

### Step 3: Generate Recipe Image
1. **CRITICAL MANDATE: NEVER REUSE EXISTING IMAGES.** Every recipe must have its own unique, newly generated photography specifically depicting the dish. Never copy, alias, or reuse an image from another recipe.
2. If the image generation model is temporarily rate-limited or unavailable, wait for quota reset or notify the user—NEVER duplicate an existing image file as a shortcut.
3. Use `generate_image` with an appetizing, high-resolution food photography prompt:
   - Tool: `generate_image`
   - ImageName: `recipe_<slug>`
   - Prompt: e.g. `"Professional food photography of <Dish Name>, appetizing lighting, garnished, close-up, rustic table..."`
4. Copy the resulting image file from the brain directory to `c:\Users\evcam\source\repos\cookbook\assets\recipe_<slug>.png` using `run_command` (`Copy-Item`).

### Step 4: Write JSON File
1. Create `recipes/<id>-<slug>.json` using `write_to_file`.
2. Ensure all fields are populated correctly with formatted groups and `{id}` step templates.

### Step 5: Build Bundle
1. Run `.\build.ps1` in PowerShell using `run_command` in `c:\Users\evcam\source\repos\cookbook`.
2. Verify the output displays `Successfully built recipes-data.js with N recipes.`

### Step 6: Commit and Push
1. Run git commands directly without asking for confirmation (respecting user's always-allow policy):
   ```powershell
   git add . ; git commit -m "feat: add <Recipe Name> recipe" ; git push origin main
   ```
2. Update `walkthrough.md` to document the addition.

