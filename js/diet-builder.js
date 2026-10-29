// N24 FITNESS - Radiant Diet Architect & Meal Planner Engine
import { FOOD_DATABASE, PRESET_DIETS } from './data.js';

class DietArchitect {
  constructor() {
    this.unitSystem = 'imperial';
    this.chartInstance = null;
    
    this.profile = {
      gender: 'male',
      age: 32,
      weightLbs: 185,
      heightFeet: 5,
      heightInches: 10,
      weightKg: 84,
      heightCm: 178,
      activityLevel: 1.55,
      goal: 'cut'
    };

    this.targets = {
      bmr: 1820,
      tdee: 2821,
      calories: 2321,
      protein: 200,
      carbs: 210,
      fat: 65
    };

    this.meals = {
      breakfast: [],
      snack1: [],
      lunch: [],
      postWorkout: [],
      dinner: [],
      eveningSnack: []
    };

    this.mealNames = {
      breakfast: "Meal 01 — Morning Nutrition Protocol",
      snack1: "Meal 02 — Mid-Morning Power Fuel",
      lunch: "Meal 03 — Lean Recomp Lunch",
      postWorkout: "Meal 04 — Post-Workout Recovery",
      dinner: "Meal 05 — Sustained Evening Dinner",
      eveningSnack: "Meal 06 — Bedtime Casein & Recovery"
    };

    this.activeMealForModal = 'breakfast';
  }

  init() {
    this.loadFromStorage();
    this.calculateTargets();
    this.renderFoodCatalogModal();
    this.renderPresetSelector();
    this.setupEventListeners();
    this.renderMeals();
    this.updateSummaryAndCharts();
  }

  setUnitSystem(unit) {
    this.unitSystem = unit;
    if (unit === 'metric') {
      this.profile.weightKg = Math.round(this.profile.weightLbs * 0.45359237);
      this.profile.heightCm = Math.round(((this.profile.heightFeet * 12) + this.profile.heightInches) * 2.54);
    } else {
      this.profile.weightLbs = Math.round(this.profile.weightKg * 2.20462);
      const totalInches = Math.round(this.profile.heightCm / 2.54);
      this.profile.heightFeet = Math.floor(totalInches / 12);
      this.profile.heightInches = totalInches % 12;
    }
    this.updateProfileFormInputs();
    this.renderMeals();
    this.renderFoodCatalogModal();
  }

  updateProfileFormInputs() {
    const isImperial = this.unitSystem === 'imperial';
    
    const imperialInputs = document.querySelectorAll('.unit-imperial-field');
    const metricInputs = document.querySelectorAll('.unit-metric-field');
    
    imperialInputs.forEach(el => el.classList.toggle('hidden', !isImperial));
    metricInputs.forEach(el => el.classList.toggle('hidden', isImperial));

    const weightLbsInput = document.getElementById('diet-weight-lbs');
    const heightFtInput = document.getElementById('diet-height-ft');
    const heightInInput = document.getElementById('diet-height-in');
    const weightKgInput = document.getElementById('diet-weight-kg');
    const heightCmInput = document.getElementById('diet-height-cm');

    if (weightLbsInput) weightLbsInput.value = this.profile.weightLbs;
    if (heightFtInput) heightFtInput.value = this.profile.heightFeet;
    if (heightInInput) heightInInput.value = this.profile.heightInches;
    if (weightKgInput) weightKgInput.value = this.profile.weightKg;
    if (heightCmInput) heightCmInput.value = this.profile.heightCm;
  }

  calculateTargets() {
    let weightInKg = this.unitSystem === 'imperial' 
      ? this.profile.weightLbs * 0.45359237 
      : this.profile.weightKg;
    
    let heightInCm = this.unitSystem === 'imperial'
      ? ((this.profile.heightFeet * 12) + this.profile.heightInches) * 2.54
      : this.profile.heightCm;

    const age = parseInt(this.profile.age, 10) || 30;

    let bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age);
    if (this.profile.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = Math.round(bmr * this.profile.activityLevel);
    let targetCalories = tdee;
    let proteinGrams = 0;
    let carbsGrams = 0;
    let fatGrams = 0;

    const bodyweightLbs = this.unitSystem === 'imperial' 
      ? this.profile.weightLbs 
      : Math.round(this.profile.weightKg * 2.20462);

    switch (this.profile.goal) {
      case 'cut':
        targetCalories = Math.max(1400, tdee - 500);
        proteinGrams = Math.round(bodyweightLbs * 1.05);
        fatGrams = Math.round((targetCalories * 0.25) / 9);
        const remCutCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.max(50, Math.round(remCutCals / 4));
        break;

      case 'recomp':
        targetCalories = Math.max(1600, tdee - 200);
        proteinGrams = Math.round(bodyweightLbs * 1.0);
        fatGrams = Math.round((targetCalories * 0.28) / 9);
        const remRecompCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.max(80, Math.round(remRecompCals / 4));
        break;

      case 'bulk':
        targetCalories = tdee + 350;
        proteinGrams = Math.round(bodyweightLbs * 1.0);
        fatGrams = Math.round((targetCalories * 0.22) / 9);
        const remBulkCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.round(remBulkCals / 4);
        break;

      case 'keto':
        targetCalories = Math.max(1450, tdee - 400);
        proteinGrams = Math.round(bodyweightLbs * 0.95);
        carbsGrams = 30;
        const remKetoCals = targetCalories - (proteinGrams * 4) - (carbsGrams * 4);
        fatGrams = Math.round(remKetoCals / 9);
        break;

      case 'maintain':
      default:
        targetCalories = tdee;
        proteinGrams = Math.round(bodyweightLbs * 0.9);
        fatGrams = Math.round((targetCalories * 0.28) / 9);
        const remMainCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.round(remMainCals / 4);
        break;
    }

    this.targets = {
      bmr: Math.round(bmr),
      tdee: tdee,
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbsGrams),
      fat: Math.round(fatGrams)
    };

    this.renderTargetsUI();
    this.updateSummaryAndCharts();
  }

  renderTargetsUI() {
    const bmrEl = document.getElementById('target-bmr-val');
    const tdeeEl = document.getElementById('target-tdee-val');
    const calEl = document.getElementById('target-cals-val');
    const protEl = document.getElementById('target-protein-val');
    const carbEl = document.getElementById('target-carbs-val');
    const fatEl = document.getElementById('target-fat-val');

    if (bmrEl) bmrEl.innerText = `${this.targets.bmr.toLocaleString()} kcal`;
    if (tdeeEl) tdeeEl.innerText = `${this.targets.tdee.toLocaleString()} kcal`;
    if (calEl) calEl.innerText = `${this.targets.calories.toLocaleString()} kcal`;
    if (protEl) protEl.innerText = `${this.targets.protein}g`;
    if (carbEl) carbEl.innerText = `${this.targets.carbs}g`;
    if (fatEl) fatEl.innerText = `${this.targets.fat}g`;
  }

  renderMeals() {
    const container = document.getElementById('diet-meals-container');
    if (!container) return;

    container.innerHTML = '';
    const mealKeys = Object.keys(this.meals);

    mealKeys.forEach(mealKey => {
      const items = this.meals[mealKey];
      const mealTitle = this.mealNames[mealKey];

      const mealCalories = items.reduce((sum, item) => sum + item.calories, 0);
      const mealProtein = items.reduce((sum, item) => sum + item.protein, 0);
      const mealCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
      const mealFat = items.reduce((sum, item) => sum + item.fat, 0);

      const mealCard = document.createElement('div');
      mealCard.className = 'bright-card p-5 mb-5 border relative transition';

      mealCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between pb-3.5 mb-3.5 border-b gap-3" style="border-bottom-color: var(--border-subtle);">
          <div class="flex items-center space-x-3">
            <span class="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,189,71,0.5)]"></span>
            <h4 class="font-extrabold text-base tracking-tight">${mealTitle}</h4>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-400/10 text-amber-500 border border-amber-400/30">
              ${items.length} ${items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div class="flex items-center space-x-3 text-xs font-mono font-bold">
            <span class="px-2.5 py-1 rounded bg-amber-400/20 text-amber-500 border border-amber-400/30 text-sm font-black">
              ${Math.round(mealCalories)} kcal
            </span>
            <span class="text-sky-500 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">${Math.round(mealProtein)}g P</span>
            <span class="text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">${Math.round(mealCarbs)}g C</span>
            <span class="text-rose-500 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">${Math.round(mealFat)}g F</span>
          </div>
        </div>

        <!-- Food items list -->
        <div class="space-y-2 mb-4">
          ${items.length === 0 ? `
            <div class="py-6 text-center opacity-70 text-xs border border-dashed rounded-xl" style="border-color: var(--border-subtle); background: var(--bg-inner-input);">
              <i class="fa-solid fa-utensils text-amber-400 text-lg mb-2 block"></i>
              No food items added yet. Click "+ Add Food Item" below to populate.
            </div>
          ` : items.map((item, index) => `
            <div class="flex flex-wrap items-center justify-between p-3 rounded-xl transition gap-2 text-xs border" style="background: var(--bg-inner-input); border-color: var(--border-subtle);">
              <div class="flex items-center space-x-3 min-w-[200px] flex-1">
                <div class="w-8 h-8 rounded-lg bg-amber-400/15 text-amber-500 flex items-center justify-center font-bold text-sm border border-amber-400/30">
                  <i class="fa-solid fa-${item.icon || 'bowl-food'}"></i>
                </div>
                <div>
                  <div class="font-bold text-sm">${item.name}</div>
                  <div class="text-xs opacity-85 font-mono mt-0.5">
                    Portion: <strong class="text-amber-500">${item.servingDisplay}</strong>
                  </div>
                </div>
              </div>

              <!-- Macros Display -->
              <div class="flex items-center space-x-3 text-xs font-mono font-bold">
                <span class="opacity-90 px-2 py-1 rounded border" style="border-color: var(--border-subtle);">${Math.round(item.calories)} cal</span>
                <span class="text-sky-500">${Math.round(item.protein)}g P</span>
                <span class="text-amber-500">${Math.round(item.carbs)}g C</span>
                <span class="text-rose-500">${Math.round(item.fat)}g F</span>
              </div>

              <!-- Portions Stepper Buttons -->
              <div class="flex items-center space-x-1.5 ml-2">
                <button type="button" class="btn-serving-decrease w-7 h-7 rounded-lg hover:bg-amber-400 hover:text-black font-bold text-sm flex items-center justify-center transition border"
                  style="border-color: var(--border-subtle);" data-meal="${mealKey}" data-index="${index}" title="Decrease portion">
                  -
                </button>
                <span class="text-xs text-amber-500 font-mono font-extrabold px-2">${item.multiplier}x</span>
                <button type="button" class="btn-serving-increase w-7 h-7 rounded-lg hover:bg-amber-400 hover:text-black font-bold text-sm flex items-center justify-center transition border"
                  style="border-color: var(--border-subtle);" data-meal="${mealKey}" data-index="${index}" title="Increase portion">
                  +
                </button>
                <button type="button" class="btn-remove-item ml-2 p-1.5 text-slate-400 hover:text-rose-500 transition"
                  data-meal="${mealKey}" data-index="${index}" title="Remove item">
                  <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Add Food Action Bar -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" class="btn-open-food-modal text-xs font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 px-4 py-2 rounded-lg shadow-md transition flex items-center space-x-1.5"
            data-meal="${mealKey}">
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Add Food Item</span>
          </button>

          <button type="button" class="btn-open-custom-modal text-xs text-amber-500 hover:underline flex items-center space-x-1 font-semibold transition"
            data-meal="${mealKey}">
            <span>+ Define Custom Item</span>
          </button>
        </div>
      `;

      container.appendChild(mealCard);
    });

    this.bindMealCardEvents();
  }

  bindMealCardEvents() {
    document.querySelectorAll('.btn-serving-increase').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.adjustMultiplier(mealKey, index, 0.25);
      });
    });

    document.querySelectorAll('.btn-serving-decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.adjustMultiplier(mealKey, index, -0.25);
      });
    });

    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.removeItem(mealKey, index);
      });
    });

    document.querySelectorAll('.btn-open-food-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMealForModal = btn.getAttribute('data-meal');
        this.openFoodModal();
      });
    });

    document.querySelectorAll('.btn-open-custom-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMealForModal = btn.getAttribute('data-meal');
        this.openCustomModal();
      });
    });
  }

  adjustMultiplier(mealKey, index, delta) {
    const item = this.meals[mealKey][index];
    if (!item) return;

    let newMult = Math.round((item.multiplier + delta) * 100) / 100;
    if (newMult <= 0.1) newMult = 0.25;

    const baseCals = item.calories / item.multiplier;
    const baseP = item.protein / item.multiplier;
    const baseC = item.carbs / item.multiplier;
    const baseF = item.fat / item.multiplier;

    item.multiplier = newMult;
    item.calories = Math.round(baseCals * newMult);
    item.protein = Math.round((baseP * newMult) * 10) / 10;
    item.carbs = Math.round((baseC * newMult) * 10) / 10;
    item.fat = Math.round((baseF * newMult) * 10) / 10;

    if (item.baseServing) {
      const isImperial = this.unitSystem === 'imperial';
      const unit = isImperial ? item.baseUnit : item.baseMetricUnit;
      const servingVal = isImperial ? item.baseServing : item.baseMetricServing;
      const calculatedServing = Math.round(servingVal * newMult * 10) / 10;
      item.servingDisplay = `${calculatedServing} ${unit}`;
    }

    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();
  }

  removeItem(mealKey, index) {
    this.meals[mealKey].splice(index, 1);
    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();
  }

  addFood(mealKey, foodId, multiplier = 1.0) {
    const food = FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    const isImperial = this.unitSystem === 'imperial';
    const serving = isImperial ? food.serving : food.metricServing;
    const unit = isImperial ? food.unit : food.metricUnit;

    const newItem = {
      id: `${food.id}-${Date.now()}`,
      foodId: food.id,
      name: food.name,
      category: food.category,
      multiplier: multiplier,
      baseServing: food.serving,
      baseUnit: food.unit,
      baseMetricServing: food.metricServing,
      baseMetricUnit: food.metricUnit,
      servingDisplay: `${Math.round(serving * multiplier * 10) / 10} ${unit}`,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round((food.protein * multiplier) * 10) / 10,
      carbs: Math.round((food.carbs * multiplier) * 10) / 10,
      fat: Math.round((food.fat * multiplier) * 10) / 10,
      icon: food.icon
    };

    this.meals[mealKey].push(newItem);
    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();
    this.showToast(`Added ${food.name}`);
  }

  addCustomFood(mealKey, name, portion, calories, protein, carbs, fat) {
    const newItem = {
      id: `custom-${Date.now()}`,
      foodId: 'custom',
      name: name,
      category: 'custom',
      multiplier: 1.0,
      servingDisplay: portion || '1 serving',
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      icon: 'sparkles',
      isCustom: true
    };

    this.meals[mealKey].push(newItem);
    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();
    this.showToast(`Added custom item "${name}"`);
  }

  updateSummaryAndCharts() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(this.meals).forEach(itemList => {
      itemList.forEach(item => {
        totalCalories += item.calories;
        totalProtein += item.protein;
        totalCarbs += item.carbs;
        totalFat += item.fat;
      });
    });

    totalCalories = Math.round(totalCalories);
    totalProtein = Math.round(totalProtein);
    totalCarbs = Math.round(totalCarbs);
    totalFat = Math.round(totalFat);

    window.N24_DIET_INTAKE_CALS = totalCalories;
    if (window.N24_CALORIE_CALCULATOR_INSTANCE) {
      window.N24_CALORIE_CALCULATOR_INSTANCE.updateEnergyBalance();
    }

    const currCalEl = document.getElementById('diet-current-calories');
    const currProtEl = document.getElementById('diet-current-protein');
    const currCarbEl = document.getElementById('diet-current-carbs');
    const currFatEl = document.getElementById('diet-current-fat');

    const calDiffEl = document.getElementById('diet-calories-diff');
    const protDiffEl = document.getElementById('diet-protein-diff');

    if (currCalEl) currCalEl.innerText = `${totalCalories.toLocaleString()} kcal`;
    if (currProtEl) currProtEl.innerText = `${totalProtein}g`;
    if (currCarbEl) currCarbEl.innerText = `${totalCarbs}g`;
    if (currFatEl) currFatEl.innerText = `${totalFat}g`;

    const calPct = Math.min(100, Math.round((totalCalories / (this.targets.calories || 1)) * 100));
    const protPct = Math.min(100, Math.round((totalProtein / (this.targets.protein || 1)) * 100));

    const calBar = document.getElementById('progress-bar-calories');
    const protBar = document.getElementById('progress-bar-protein');

    if (calBar) calBar.style.width = `${calPct}%`;
    if (protBar) protBar.style.width = `${protPct}%`;

    if (calDiffEl) {
      const cDiff = this.targets.calories - totalCalories;
      calDiffEl.innerText = cDiff >= 0 ? `${cDiff} kcal remaining` : `+${Math.abs(cDiff)} kcal surplus`;
      calDiffEl.className = cDiff >= 0 ? 'text-xs text-amber-500 font-mono font-bold' : 'text-xs text-rose-500 font-mono font-bold';
    }

    if (protDiffEl) {
      const pDiff = this.targets.protein - totalProtein;
      protDiffEl.innerText = pDiff >= 0 ? `${pDiff}g needed` : `Target reached (+${Math.abs(pDiff)}g)`;
    }

    this.renderMacroChart(totalProtein, totalCarbs, totalFat);
  }

  renderMacroChart(protein, carbs, fat) {
    const canvas = document.getElementById('diet-macro-chart');
    if (!canvas) return;

    const isLight = document.documentElement.classList.contains('light-theme');
    const ctx = canvas.getContext('2d');
    const protCals = protein * 4;
    const carbCals = carbs * 4;
    const fatCals = fat * 9;
    const totalMacroCals = protCals + carbCals + fatCals || 1;

    const protPercent = Math.round((protCals / totalMacroCals) * 100);
    const carbPercent = Math.round((carbCals / totalMacroCals) * 100);
    const fatPercent = Math.round((fatCals / totalMacroCals) * 100);

    const data = {
      labels: [
        `Protein ${protPercent}%`,
        `Carbs ${carbPercent}%`,
        `Fats ${fatPercent}%`
      ],
      datasets: [{
        data: [protein * 4, carbs * 4, fat * 9],
        backgroundColor: [
          '#0284C7', // Sky Blue
          '#F59E0B', // Radiant Gold
          '#EF4444'  // Rose Red
        ],
        borderColor: isLight ? '#FFFFFF' : '#12141D',
        borderWidth: 3,
        hoverOffset: 6
      }]
    };

    if (this.chartInstance) {
      this.chartInstance.data = data;
      this.chartInstance.options.plugins.legend.labels.color = isLight ? '#0F172A' : '#FFFFFF';
      this.chartInstance.update();
    } else if (window.Chart) {
      this.chartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: isLight ? '#0F172A' : '#FFFFFF',
                font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: isLight ? '#FFFFFF' : '#1E2230',
              borderColor: 'rgba(245,189,71,0.5)',
              borderWidth: 1.5,
              titleColor: isLight ? '#0F172A' : '#FFFFFF',
              bodyColor: '#F59E0B',
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: ${context.raw} kcal`;
                }
              }
            }
          },
          cutout: '68%'
        }
      });
    }
  }

  loadPreset(presetId) {
    const preset = PRESET_DIETS.find(p => p.id === presetId);
    if (!preset) return;

    Object.keys(this.meals).forEach(k => { this.meals[k] = []; });

    Object.keys(preset.meals).forEach(mealKey => {
      if (this.meals[mealKey]) {
        preset.meals[mealKey].forEach(item => {
          this.addFood(mealKey, item.foodId, item.multiplier);
        });
      }
    });

    this.targets.calories = preset.targetCalories;
    this.targets.protein = preset.targetProtein;
    this.targets.carbs = preset.targetCarbs;
    this.targets.fat = preset.targetFat;
    this.renderTargetsUI();

    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();
    this.showToast(`Protocol loaded: "${preset.name}"`);
  }

  clearDiet() {
    if (confirm("Reset current daily nutrition protocol?")) {
      Object.keys(this.meals).forEach(k => { this.meals[k] = []; });
      this.renderMeals();
      this.updateSummaryAndCharts();
      this.saveToStorage();
      this.showToast("Protocol reset.");
    }
  }

  renderPresetSelector() {
    const container = document.getElementById('diet-preset-pills');
    if (!container) return;

    container.innerHTML = PRESET_DIETS.map(preset => `
      <button type="button" class="btn-load-preset p-3.5 rounded-xl border text-left transition flex items-center justify-between group shadow-sm"
        style="background: var(--bg-inner-input); border-color: var(--border-subtle);" data-id="${preset.id}">
        <div>
          <div class="text-sm font-extrabold group-hover:text-amber-500 transition">${preset.name}</div>
          <div class="text-xs text-amber-500 font-mono mt-0.5 font-semibold">${preset.targetCalories} kcal • ${preset.targetProtein}g Protein</div>
        </div>
        <div class="w-7 h-7 rounded-full bg-amber-400/20 group-hover:bg-amber-400 group-hover:text-black text-amber-500 flex items-center justify-center transition">
          <i class="fa-solid fa-bolt text-xs"></i>
        </div>
      </button>
    `).join('');

    container.querySelectorAll('.btn-load-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.loadPreset(id);
      });
    });
  }

  renderFoodCatalogModal() {
    const listContainer = document.getElementById('modal-food-list');
    if (!listContainer) return;

    const isImperial = this.unitSystem === 'imperial';
    const filterInput = document.getElementById('modal-food-search');
    const categoryFilter = document.getElementById('modal-food-category-filter');

    const renderList = () => {
      const query = (filterInput?.value || '').toLowerCase().trim();
      const cat = categoryFilter?.value || 'all';

      const filtered = FOOD_DATABASE.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query);
        const matchesCat = (cat === 'all') || (item.category === cat);
        return matchesQuery && matchesCat;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-8 opacity-70 text-xs">
            No matching food items found. Use "+ Define Custom Item" to add your own.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(food => {
        const serving = isImperial ? `${food.serving} ${food.unit}` : `${food.metricServing} ${food.metricUnit}`;
        return `
          <div class="flex items-center justify-between p-3 rounded-xl border transition" style="background: var(--bg-inner-input); border-color: var(--border-subtle);">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-${food.icon}"></i>
              </div>
              <div>
                <h5 class="text-xs font-bold">${food.name}</h5>
                <p class="text-[11px] opacity-80 font-mono">Serving: <strong class="text-amber-500">${serving}</strong></p>
              </div>
            </div>

            <div class="flex items-center space-x-3.5">
              <div class="text-right text-xs font-mono font-bold">
                <div class="text-amber-500 text-sm">${food.calories} cal</div>
                <div class="opacity-80 text-[11px] space-x-1">
                  <span class="text-sky-500">${food.protein}P</span>
                  <span class="text-amber-500">${food.carbs}C</span>
                  <span class="text-rose-500">${food.fat}F</span>
                </div>
              </div>

              <button type="button" class="btn-select-food px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition shadow"
                data-food-id="${food.id}">
                Add
              </button>
            </div>
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.btn-select-food').forEach(btn => {
        btn.addEventListener('click', () => {
          const foodId = btn.getAttribute('data-food-id');
          this.addFood(this.activeMealForModal, foodId, 1.0);
          this.closeFoodModal();
        });
      });
    };

    renderList();

    if (filterInput) filterInput.addEventListener('input', renderList);
    if (categoryFilter) categoryFilter.addEventListener('change', renderList);
  }

  openFoodModal() {
    const modal = document.getElementById('food-catalog-modal');
    const titleSpan = document.getElementById('modal-target-meal-name');
    if (titleSpan) titleSpan.innerText = this.mealNames[this.activeMealForModal];
    if (modal) modal.classList.remove('hidden');
  }

  closeFoodModal() {
    const modal = document.getElementById('food-catalog-modal');
    if (modal) modal.classList.add('hidden');
  }

  openCustomModal() {
    const modal = document.getElementById('custom-food-modal');
    const targetSpan = document.getElementById('custom-modal-target-meal');
    if (targetSpan) targetSpan.innerText = this.mealNames[this.activeMealForModal];
    if (modal) modal.classList.remove('hidden');
  }

  closeCustomModal() {
    const modal = document.getElementById('custom-food-modal');
    if (modal) modal.classList.add('hidden');
  }

  setupEventListeners() {
    const goalSelect = document.getElementById('diet-goal-select');
    if (goalSelect) {
      goalSelect.addEventListener('change', (e) => {
        this.profile.goal = e.target.value;
        this.calculateTargets();
      });
    }

    const activitySelect = document.getElementById('diet-activity-select');
    if (activitySelect) {
      activitySelect.addEventListener('change', (e) => {
        this.profile.activityLevel = parseFloat(e.target.value);
        this.calculateTargets();
      });
    }

    const genderSelect = document.getElementById('diet-gender-select');
    if (genderSelect) {
      genderSelect.addEventListener('change', (e) => {
        this.profile.gender = e.target.value;
        this.calculateTargets();
      });
    }

    const ageInput = document.getElementById('diet-age-input');
    if (ageInput) {
      ageInput.addEventListener('input', (e) => {
        this.profile.age = parseInt(e.target.value, 10) || 30;
        this.calculateTargets();
      });
    }

    const weightLbs = document.getElementById('diet-weight-lbs');
    if (weightLbs) {
      weightLbs.addEventListener('input', (e) => {
        this.profile.weightLbs = parseFloat(e.target.value) || 180;
        this.calculateTargets();
      });
    }

    const heightFt = document.getElementById('diet-height-ft');
    const heightIn = document.getElementById('diet-height-in');
    if (heightFt) {
      heightFt.addEventListener('input', (e) => {
        this.profile.heightFeet = parseInt(e.target.value, 10) || 5;
        this.calculateTargets();
      });
    }
    if (heightIn) {
      heightIn.addEventListener('input', (e) => {
        this.profile.heightInches = parseInt(e.target.value, 10) || 10;
        this.calculateTargets();
      });
    }

    const weightKg = document.getElementById('diet-weight-kg');
    if (weightKg) {
      weightKg.addEventListener('input', (e) => {
        this.profile.weightKg = parseFloat(e.target.value) || 80;
        this.calculateTargets();
      });
    }

    const heightCm = document.getElementById('diet-height-cm');
    if (heightCm) {
      heightCm.addEventListener('input', (e) => {
        this.profile.heightCm = parseInt(e.target.value, 10) || 178;
        this.calculateTargets();
      });
    }

    const clearBtn = document.getElementById('btn-clear-diet');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearDiet());
    }

    const exportBtn = document.getElementById('btn-export-diet');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportDietPrintout());
    }

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeFoodModal();
        this.closeCustomModal();
      });
    });

    const customFoodForm = document.getElementById('custom-food-form');
    if (customFoodForm) {
      customFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('custom-food-name').value;
        const portion = document.getElementById('custom-food-portion').value;
        const calories = parseFloat(document.getElementById('custom-food-calories').value) || 0;
        const protein = parseFloat(document.getElementById('custom-food-protein').value) || 0;
        const carbs = parseFloat(document.getElementById('custom-food-carbs').value) || 0;
        const fat = parseFloat(document.getElementById('custom-food-fat').value) || 0;

        if (!name) return;

        this.addCustomFood(this.activeMealForModal, name, portion, calories, protein, carbs, fat);
        customFoodForm.reset();
        this.closeCustomModal();
      });
    }
  }

  exportDietPrintout() {
    const printArea = document.getElementById('diet-plan-printout');
    if (!printArea) {
      window.print();
      return;
    }

    let totalCals = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalFat = 0;
    let mealHtml = '';
    const groceryList = new Set();

    Object.keys(this.meals).forEach(mealKey => {
      const items = this.meals[mealKey];
      if (items.length === 0) return;

      const mealCals = items.reduce((s, i) => s + i.calories, 0);
      const mealProt = items.reduce((s, i) => s + i.protein, 0);
      const mealCarb = items.reduce((s, i) => s + i.carbs, 0);
      const mealFat = items.reduce((s, i) => s + i.fat, 0);

      totalCals += mealCals;
      totalProt += mealProt;
      totalCarb += mealCarb;
      totalFat += mealFat;

      mealHtml += `
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #CBD5E1; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #F5BD47; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #0F172A;">${this.mealNames[mealKey]}</strong>
            <span style="font-weight: 700; color: #B45309; font-family: monospace; font-size: 13px;">${Math.round(mealCals)} kcal (${Math.round(mealProt)}g P | ${Math.round(mealCarb)}g C | ${Math.round(mealFat)}g F)</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #F1F5F9; text-align: left; color: #334155;">
                <th style="padding: 6px;">Item</th>
                <th style="padding: 6px;">Portion</th>
                <th style="padding: 6px;">Energy</th>
                <th style="padding: 6px;">P / C / F</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                groceryList.add(item.name);
                return `
                  <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 6px; color: #0F172A;"><strong>${item.name}</strong></td>
                    <td style="padding: 6px; color: #475569;">${item.servingDisplay}</td>
                    <td style="padding: 6px; font-family: monospace;">${Math.round(item.calories)} cal</td>
                    <td style="padding: 6px; font-family: monospace;">${Math.round(item.protein)}g / ${Math.round(item.carbs)}g / ${Math.round(item.fat)}g</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    const groceryArray = Array.from(groceryList);

    printArea.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #F5BD47; padding-bottom: 14px; margin-bottom: 18px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em;">N24 FITNESS</h1>
            <p style="margin: 2px 0 0 0; color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">Precision Nutrition Protocol — US Client Care</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748B;">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div><strong>Objective:</strong> ${this.profile.goal.toUpperCase()}</div>
          </div>
        </div>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 14px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 11px; color: #92400E; text-transform: uppercase; font-weight: bold;">Daily Calories</div>
            <div style="font-size: 20px; font-weight: 800; color: #B45309; font-family: monospace;">${Math.round(totalCals)} kcal</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #0369A1; text-transform: uppercase; font-weight: bold;">Protein</div>
            <div style="font-size: 20px; font-weight: 800; color: #0284C7; font-family: monospace;">${Math.round(totalProt)}g</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #92400E; text-transform: uppercase; font-weight: bold;">Carbohydrates</div>
            <div style="font-size: 20px; font-weight: 800; color: #D97706; font-family: monospace;">${Math.round(totalCarb)}g</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #BE123C; text-transform: uppercase; font-weight: bold;">Fats</div>
            <div style="font-size: 20px; font-weight: 800; color: #E11D48; font-family: monospace;">${Math.round(totalFat)}g</div>
          </div>
        </div>

        <h3 style="margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A;">Daily Meal Architecture</h3>
        ${mealHtml || '<p>No meals configured.</p>'}

        ${groceryArray.length > 0 ? `
          <div style="margin-top: 20px; padding: 14px; background: #F8FAFC; border-radius: 6px; border: 1px solid #E2E8F0;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #334155;">Grocery Provisioning Checklist</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #475569;">
              ${groceryArray.map(g => `<div>☐ ${g}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 24px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 11px; color: #94A3B8;">
          N24 FITNESS LLC • Official Client Coaching Protocol • www.n24fitness.com
        </div>
      </div>
    `;

    window.print();
  }

  showToast(message) {
    let toast = document.getElementById('n24-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'n24-toast';
      toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-8 opacity-0 flex items-center space-x-2 text-xs font-bold';
      document.body.appendChild(toast);
    }
    toast.style.background = 'var(--bg-card-bright)';
    toast.style.borderColor = 'var(--gold-primary)';
    toast.style.color = 'var(--text-heading)';
    toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,189,71,0.6)]"></span><span>${message}</span>`;
    toast.classList.remove('translate-y-8', 'opacity-0');
    
    setTimeout(() => {
      toast.classList.add('translate-y-8', 'opacity-0');
    }, 2400);
  }

  saveToStorage() {
    const state = {
      profile: this.profile,
      targets: this.targets,
      meals: this.meals,
      unitSystem: this.unitSystem
    };
    try {
      localStorage.setItem('N24_DIET_PLAN_STATE', JSON.stringify(state));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('N24_DIET_PLAN_STATE');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) this.profile = parsed.profile;
        if (parsed.targets) this.targets = parsed.targets;
        if (parsed.meals) this.meals = parsed.meals;
        if (parsed.unitSystem) this.unitSystem = parsed.unitSystem;
      } else {
        this.loadPreset('lean-shred-us');
      }
    } catch (e) {
      console.warn("Storage error", e);
    }
  }
}

export const dietArchitect = new DietArchitect();
window.N24_DIET_ARCHITECT = dietArchitect;
