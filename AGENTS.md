# Cookbook Repository Guidelines

Welcome to the **Cookbook** repository! This is a static, Git-driven web application hosted on GitHub Pages.

## Core Rules for Agents

1. **Recipe Management Skill**:
   - For all tasks involving adding, importing, translating, or modifying recipes, refer to and follow the specialized skill at [`.agents/skills/add-cookbook-recipe/SKILL.md`](./.agents/skills/add-cookbook-recipe/SKILL.md).

2. **Never Edit `recipes-data.js` Directly**:
   - `recipes-data.js` is an auto-generated bundle produced by `build.ps1`.
   - All source recipes are individual `.json` files inside the `recipes/` directory (`recipes/<id>-<slug>.json`).
   - After creating or editing any recipe JSON, always run `.\build.ps1` to rebuild the bundle.

3. **Recipe Standards**:
   - **Language**: English (translate source recipes from other languages).
   - **Dynamic Portions**: All ingredients in the `steps` array must use `{ingredient_id}` templates matching an ingredient `id` so the frontend portion-scaling engine works.
   - **Ingredient Groups**: Categorize ingredients into standard groups (`"Dry Ingredients"`, `"Dairy & Eggs"`, `"Vegetables"`, `"Protein"`, `"Seasoning"`, `"Fruit"`, `"Chocolate"`, `"Other"`, etc.).
   - **Tags System (Multi-tag)**: Recipes use a `"tags"` array rather than a single category (e.g. `["Dessert", "Snacks", "Low-Carb"]`). Standard tags include: `"Main dish"`, `"Dessert"`, `"Snacks"`, `"Low-Carb"`, `"Breakfast"`, `"Christmas cookies"`. Apply all applicable tags (e.g., a dish can be both a dessert and a snack, keto/low-carb dishes should include `"Low-Carb"`).
   - **Assets**: Generate high-quality food photography for new recipes using the image generation tool and place in `assets/recipe_<slug>.png`.
   - **STRICT IMAGE RULE: NEVER REUSE EXISTING IMAGES**: Every recipe must have its own unique, dedicated, newly generated photograph. Never copy or reuse an image from another recipe under any circumstance. If image generation is temporarily unavailable or rate-limited, wait for quota reset or ask the user, but NEVER duplicate an existing image.
