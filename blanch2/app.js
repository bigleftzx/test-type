// 菜谱系统主应用
class RecipeApp {
    constructor() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRecipes();
    }

    bindEvents() {
        // 导航按钮点击
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderRecipes();
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchBtn.addEventListener('click', () => {
            this.searchQuery = searchInput.value.trim();
            this.renderRecipes();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchQuery = searchInput.value.trim();
                this.renderRecipes();
            }
        });

        // 模态框关闭
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('recipeModal').addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') {
                this.closeModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    getAllRecipes() {
        const allRecipes = [];
        for (const [categoryKey, category] of Object.entries(recipesData)) {
            category.recipes.forEach(recipe => {
                allRecipes.push({
                    ...recipe,
                    category: category.name,
                    categoryKey: categoryKey,
                    icon: category.icon
                });
            });
        }
        return allRecipes;
    }

    getFilteredRecipes() {
        let recipes = [];

        if (this.currentCategory === 'all') {
            recipes = this.getAllRecipes();
        } else {
            const category = recipesData[this.currentCategory];
            if (category) {
                recipes = category.recipes.map(recipe => ({
                    ...recipe,
                    category: category.name,
                    categoryKey: this.currentCategory,
                    icon: category.icon
                }));
            }
        }

        // 搜索过滤
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            recipes = recipes.filter(recipe => 
                recipe.name.toLowerCase().includes(query) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
            );
        }

        return recipes;
    }

    getDifficultyClass(difficulty) {
        switch(difficulty) {
            case '简单': return 'difficulty-easy';
            case '中等': return 'difficulty-medium';
            case '困难': return 'difficulty-hard';
            default: return '';
        }
    }

    renderRecipes() {
        const recipesGrid = document.getElementById('recipesGrid');
        const categoryTitle = document.getElementById('categoryTitle');
        const recipeCount = document.getElementById('recipeCount');
        
        const recipes = this.getFilteredRecipes();

        // 更新标题
        if (this.currentCategory === 'all') {
            categoryTitle.textContent = this.searchQuery ? `搜索结果："${this.searchQuery}"` : '全部菜谱';
        } else {
            const category = recipesData[this.currentCategory];
            categoryTitle.textContent = category ? category.name : '菜谱';
        }
        
        recipeCount.textContent = `共 ${recipes.length} 道菜谱`;

        if (recipes.length === 0) {
            recipesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🔍</div>
                    <h3>没有找到相关菜谱</h3>
                    <p>试试其他关键词或分类</p>
                </div>
            `;
            return;
        }

        recipesGrid.innerHTML = recipes.map((recipe, index) => `
            <div class="recipe-card" onclick="app.showRecipeDetail('${recipe.categoryKey}', '${recipe.id}')" style="animation-delay: ${index * 0.05}s">
                <div class="recipe-image">${recipe.icon}</div>
                <div class="recipe-info">
                    <span class="recipe-category">${recipe.category}</span>
                    <h4 class="recipe-name">${recipe.name}</h4>
                    <div class="recipe-meta">
                        <span class="${this.getDifficultyClass(recipe.difficulty)}">
                            📊 ${recipe.difficulty}
                        </span>
                        <span>⏱️ ${recipe.time}</span>
                        <span>🔥 ${recipe.calories}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showRecipeDetail(categoryKey, recipeId) {
        const category = recipesData[categoryKey];
        if (!category) return;

        const recipe = category.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const detailHTML = `
            <div class="detail-header">
                <div class="detail-icon">${category.icon}</div>
                <h2 class="detail-title">${recipe.name}</h2>
                <div class="detail-meta">
                    <span>📂 ${category.name}</span>
                    <span class="${this.getDifficultyClass(recipe.difficulty)}">📊 ${recipe.difficulty}</span>
                    <span>⏱️ ${recipe.time}</span>
                    <span>🔥 ${recipe.calories}</span>
                </div>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h4>📝 食材清单</h4>
                    <div class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <div class="ingredient-item">${ing}</div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>👨‍🍳 烹饪步骤</h4>
                    <div class="steps-list">
                        ${recipe.steps.map((step, index) => `
                            <div class="step-item">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">${step}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>💡 小贴士</h4>
                    <div class="tips-box">
                        <ul class="tips-list">
                            ${recipe.tips.map(tip => `
                                <li>${tip}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('recipeDetail').innerHTML = detailHTML;
        document.getElementById('recipeModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('recipeModal').classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 初始化应用
const app = new RecipeApp();
