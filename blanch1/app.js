document.addEventListener('DOMContentLoaded', function() {
  const recipeGrid = document.getElementById('recipe-grid');
  const recipeCount = document.getElementById('recipe-count');
  const navBtns = document.querySelectorAll('.nav-btn');
  const cuisineFilters = document.querySelectorAll('#cuisine-filters input[type="checkbox"]');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const modal = document.getElementById('recipe-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close-btn');

  let currentCategory = 'all';
  let selectedCuisines = [];
  let searchTerm = '';
  let sortBy = 'default';

  function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    
    if (recipes.length === 0) {
      recipeGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #7f8c8d;"><h3>暂无符合条件的菜谱</h3></div>';
      recipeCount.textContent = `共 0 道菜谱`;
      return;
    }

    recipeCount.textContent = `共 ${recipes.length} 道菜谱`;

    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="recipe-card-header">
          <h3>${recipe.name}</h3>
          <span class="cuisine-tag">${recipe.cuisine}</span>
        </div>
        <div class="recipe-card-body">
          <div class="recipe-info">
            <span class="info-item">难度：<strong>${recipe.difficulty}</strong></span>
            <span class="info-item">时间：<strong>${recipe.cookingTime}</strong></span>
          </div>
          <div class="recipe-info">
            <span class="info-item">份量：<strong>${recipe.servings}</strong></span>
          </div>
          <p class="recipe-description">${recipe.description}</p>
        </div>
      `;

      card.addEventListener('click', () => showRecipeDetail(recipe));
      recipeGrid.appendChild(card);
    });
  }

  function showRecipeDetail(recipe) {
    modalBody.innerHTML = `
      <div class="recipe-detail-header">
        <h2>${recipe.name}</h2>
        <div class="recipe-meta">
          <span class="meta-item">菜系：${recipe.cuisine}</span>
          <span class="meta-item">难度：${recipe.difficulty}</span>
          <span class="meta-item">时间：${recipe.cookingTime}</span>
          <span class="meta-item">份量：${recipe.servings}</span>
        </div>
      </div>

      <div class="section">
        <h3>📝 所需食材</h3>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>👨‍🍳 制作步骤</h3>
        <ol class="steps-list">
          ${recipe.steps.map((step, index) => `
            <li>
              <span class="step-number">${index + 1}</span>
              ${step}
            </li>
          `).join('')}
        </ol>
      </div>

      <div class="section">
        <h3>⚠️ 注意事项</h3>
        <div class="tips-box">
          <h4>烹饪小贴士</h4>
          <ul>
            ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function filterRecipes() {
    let filtered = recipes.filter(recipe => {
      const categoryMatch = currentCategory === 'all' || 
                           (currentCategory === '八大菜系' && recipe.category === '八大菜系') ||
                           (currentCategory === '家常菜' && recipe.category === '家常菜');
      
      const cuisineMatch = selectedCuisines.length === 0 || selectedCuisines.includes(recipe.cuisine);
      
      const searchMatch = searchTerm === '' || 
                         recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));

      return categoryMatch && cuisineMatch && searchMatch;
    });

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { '简单': 1, '中等': 2, '困难': 3 };
      filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    }

    displayRecipes(filtered);
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      navBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.dataset.category;
      
      cuisineFilters.forEach(cb => {
        if (cb.dataset.category !== currentCategory && currentCategory !== 'all') {
          cb.checked = false;
        }
      });

      filterRecipes();
    });
  });

  cuisineFilters.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        if (!selectedCuisines.includes(this.value)) {
          selectedCuisines.push(this.value);
        }
      } else {
        selectedCuisines = selectedCuisines.filter(c => c !== this.value);
      }
      filterRecipes();
    });
  });

  searchInput.addEventListener('input', function() {
    searchTerm = this.value.trim();
    filterRecipes();
  });

  sortSelect.addEventListener('change', function() {
    sortBy = this.value;
    filterRecipes();
  });

  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  displayRecipes(recipes);
});
