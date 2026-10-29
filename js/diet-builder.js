// N24 FITNESS - Smart Diet Architect & Meal Planner Engine
import { FOOD_DATABASE, PRESET_DIETS } from './data.js';

class DietArchitect {
  constructor() {
    this.unitSystem = 'imperial'; // 'imperial' (lbs/oz) or 'metric' (kg/g)
    this.chartInstance = null;
    
    this.profile = {
      gender: 'male',
      age: 30,
      weightLbs: 185,
      heightFeet: 5,
      heightInches: 10,
      weightKg: 84,
      heightCm: 178,
      activityLevel: 1.55, // Moderate
      goal: 'cut' // cut, recomp, maintain, bulk, keto
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
      breakfast: "Meal 1: High-Energy Breakfast",
      snack1: "Meal 2: Mid-Morning Fuel",
      lunch: "Meal 3: Lean Muscle Lunch",
      postWorkout: "Meal 4: Anabolic Post-Workout Recovery",
      dinner: "Meal 5: Sustained Dinner",
      eveningSnack: "Meal 6: Night-Time Casein / Snack"
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
    
    // Toggle input field visibility
    const imperialInputs = document.querySelectorAll('.unit-imperial-field');
    const metricInputs = document.querySelectorAll('.unit-metric-field');
    
    imperialInputs.forEach(el => el.classList.toggle('hidden', !isImperial));
    metricInputs.forEach(el => el.classList.toggle('hidden', isImperial));

    // Update values
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

    // Mifflin-St Jeor Formula
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
      case 'cut': // Aggressive Fat Shred (-500 kcal, high protein)
        targetCalories = Math.max(1300, tdee - 500);
        proteinGrams = Math.round(bodyweightLbs * 1.1); // 1.1g per lb
        fatGrams = Math.round((targetCalories * 0.25) / 9);
        const remainingCutCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.max(50, Math.round(remainingCutCals / 4));
        break;

      case 'recomp': // Lean Athletic Recomposition (-200 kcal)
        targetCalories = Math.max(1500, tdee - 200);
        proteinGrams = Math.round(bodyweightLbs * 1.0);
        fatGrams = Math.round((targetCalories * 0.28) / 9);
        const remRecompCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.max(80, Math.round(remRecompCals / 4));
        break;

      case 'bulk': // Hypertrophy Muscle Gain (+350 kcal)
        targetCalories = tdee + 350;
        proteinGrams = Math.round(bodyweightLbs * 1.0);
        fatGrams = Math.round((targetCalories * 0.22) / 9);
        const remBulkCals = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
        carbsGrams = Math.round(remBulkCals / 4);
        break;

      case 'keto': // Ketogenic Fat Burn (-400 kcal, very low carb)
        targetCalories = Math.max(1400, tdee - 400);
        proteinGrams = Math.round(bodyweightLbs * 0.95);
        carbsGrams = 30; // strict keto carb ceiling
        const remKetoCals = targetCalories - (proteinGrams * 4) - (carbsGrams * 4);
        fatGrams = Math.round(remKetoCals / 9);
        break;

      case 'maintain': // Maintenance & Performance
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

      // Calculate meal totals
      const mealCalories = items.reduce((sum, item) => sum + item.calories, 0);
      const mealProtein = items.reduce((sum, item) => sum + item.protein, 0);
      const mealCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
      const mealFat = items.reduce((sum, item) => sum + item.fat, 0);

      const mealCard = document.createElement('div');
      mealCard.className = 'n24-card p-5 mb-5 border border-gold-glow/20 relative group';

      mealCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
          <div class="flex items-center space-x-3">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#D4AF37]"></span>
            <h4 class="font-bold text-lg text-white font-sans tracking-wide">${mealTitle}</h4>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 font-mono">
              ${items.length} ${items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div class="flex items-center space-x-4 text-xs font-mono">
            <span class="text-amber-300 font-bold text-sm">${Math.round(mealCalories)} kcal</span>
            <span class="text-blue-400 font-medium">${Math.round(mealProtein)}g P</span>
            <span class="text-amber-400 font-medium">${Math.round(mealCarbs)}g C</span>
            <span class="text-red-400 font-medium">${Math.round(mealFat)}g F</span>
          </div>
        </div>

        <!-- Meal Items List -->
        <div class="space-y-2 mb-4">
          ${items.length === 0 ? `
            <div class="py-6 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-lg">
              <i class="fa-solid fa-utensils mb-2 text-gray-600 block text-lg"></i>
              No foods added to this meal slot yet. Click "+ Add Food" below.
            </div>
          ` : items.map((item, index) => `
            <div class="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-black/40 hover:bg-black/60 transition border border-white/5 gap-2">
              <div class="flex items-center space-x-3 min-w-[200px] flex-1">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
                  <i class="fa-solid fa-${item.icon || 'bowl-food'}"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-gray-200">${item.name}</div>
                  <div class="text-xs text-gray-400">
                    Portion: <span class="text-amber-200/90 font-medium">${item.servingDisplay}</span>
                  </div>
                </div>
              </div>

              <!-- Macros Display -->
              <div class="flex items-center space-x-3 text-xs font-mono">
                <span class="text-gray-300 font-semibold">${Math.round(item.calories)} cal</span>
                <span class="text-blue-300">${Math.round(item.protein)}g P</span>
                <span class="text-amber-300">${Math.round(item.carbs)}g C</span>
                <span class="text-red-300">${Math.round(item.fat)}g F</span>
              </div>

              <!-- Serving Multiplier Buttons & Delete -->
              <div class="flex items-center space-x-1.5 ml-2">
                <button type="button" class="btn-serving-decrease px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition"
                  data-meal="${mealKey}" data-index="${index}" title="Decrease portion">
                  <i class="fa-solid fa-minus text-[10px]"></i>
                </button>
                <span class="text-xs text-amber-400 font-mono font-bold px-1.5">${item.multiplier}x</span>
                <button type="button" class="btn-serving-increase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition"
                  data-meal="${mealKey}" data-index="${index}" title="Increase portion">
                  <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
                <button type="button" class="btn-remove-item ml-2 p-1.5 text-gray-500 hover:text-red-400 transition"
                  data-meal="${mealKey}" data-index="${index}" title="Remove item">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Add Food Action Bar -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" class="btn-open-food-modal text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-md border border-amber-400/20 transition"
            data-meal="${mealKey}">
            <i class="fa-solid fa-plus"></i>
            <span>Add Food to ${mealKey.replace(/^\w/, c => c.toUpperCase())}</span>
          </button>

          <button type="button" class="btn-open-custom-modal text-xs text-gray-400 hover:text-gray-200 flex items-center space-x-1 hover:underline transition"
            data-meal="${mealKey}">
            <i class="fa-solid fa-pen-to-square text-[10px]"></i>
            <span>+ Custom Food</span>
          </button>
        </div>
      `;

      container.appendChild(mealCard);
    });

    this.bindMealCardEvents();
  }

  bindMealCardEvents() {
    // Increase portion
    document.querySelectorAll('.btn-serving-increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.adjustMultiplier(mealKey, index, 0.25);
      });
    });

    // Decrease portion
    document.querySelectorAll('.btn-serving-decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.adjustMultiplier(mealKey, index, -0.25);
      });
    });

    // Remove item
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mealKey = btn.getAttribute('data-meal');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.removeItem(mealKey, index);
      });
    });

    // Open Food Catalog Modal
    document.querySelectorAll('.btn-open-food-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeMealForModal = btn.getAttribute('data-meal');
        this.openFoodModal();
      });
    });

    // Open Custom Food Modal
    document.querySelectorAll('.btn-open-custom-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
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

    // Scale macros proportionally
    const baseCals = item.calories / item.multiplier;
    const baseP = item.protein / item.multiplier;
    const baseC = item.carbs / item.multiplier;
    const baseF = item.fat / item.multiplier;

    item.multiplier = newMult;
    item.calories = Math.round(baseCals * newMult);
    item.protein = Math.round((baseP * newMult) * 10) / 10;
    item.carbs = Math.round((baseC * newMult) * 10) / 10;
    item.fat = Math.round((baseF * newMult) * 10) / 10;

    // Update serving string
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

    // Trigger feedback badge or toast
    this.showToast(`Added ${food.name} to ${this.mealNames[mealKey]}`);
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
    this.showToast(`Custom food "${name}" added!`);
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

    // Save to window for Calorie Calculator sync
    window.N24_DIET_INTAKE_CALS = totalCalories;
    if (window.N24_CALORIE_CALCULATOR_INSTANCE) {
      window.N24_CALORIE_CALCULATOR_INSTANCE.updateEnergyBalance();
    }

    // Update UI Counters
    const currCalEl = document.getElementById('diet-current-calories');
    const currProtEl = document.getElementById('diet-current-protein');
    const currCarbEl = document.getElementById('diet-current-carbs');
    const currFatEl = document.getElementById('diet-current-fat');

    const calDiffEl = document.getElementById('diet-calories-diff');
    const protDiffEl = document.getElementById('diet-protein-diff');
    const carbDiffEl = document.getElementById('diet-carbs-diff');
    const fatDiffEl = document.getElementById('diet-fat-diff');

    if (currCalEl) currCalEl.innerText = `${totalCalories.toLocaleString()} kcal`;
    if (currProtEl) currProtEl.innerText = `${totalProtein}g`;
    if (currCarbEl) currCarbEl.innerText = `${totalCarbs}g`;
    if (currFatEl) currFatEl.innerText = `${totalFat}g`;

    // Progress Bars
    const calPct = Math.min(100, Math.round((totalCalories / (this.targets.calories || 1)) * 100));
    const protPct = Math.min(100, Math.round((totalProtein / (this.targets.protein || 1)) * 100));
    const carbPct = Math.min(100, Math.round((totalCarbs / (this.targets.carbs || 1)) * 100));
    const fatPct = Math.min(100, Math.round((totalFat / (this.targets.fat || 1)) * 100));

    const calBar = document.getElementById('progress-bar-calories');
    const protBar = document.getElementById('progress-bar-protein');
    const carbBar = document.getElementById('progress-bar-carbs');
    const fatBar = document.getElementById('progress-bar-fat');

    if (calBar) calBar.style.width = `${calPct}%`;
    if (protBar) protBar.style.width = `${protPct}%`;
    if (carbBar) carbBar.style.width = `${carbPct}%`;
    if (fatBar) fatBar.style.width = `${fatPct}%`;

    // Differences / Remaining
    if (calDiffEl) {
      const cDiff = this.targets.calories - totalCalories;
      calDiffEl.innerText = cDiff >= 0 ? `${cDiff} kcal remaining` : `+${Math.abs(cDiff)} kcal over`;
      calDiffEl.className = cDiff >= 0 ? 'text-xs text-amber-300 font-mono' : 'text-xs text-red-400 font-mono font-bold';
    }

    if (protDiffEl) {
      const pDiff = this.targets.protein - totalProtein;
      protDiffEl.innerText = pDiff >= 0 ? `${pDiff}g needed` : `+${Math.abs(pDiff)}g target met!`;
    }

    if (carbDiffEl) {
      const cDiff = this.targets.carbs - totalCarbs;
      carbDiffEl.innerText = cDiff >= 0 ? `${cDiff}g remaining` : `+${Math.abs(cDiff)}g over`;
    }

    if (fatDiffEl) {
      const fDiff = this.targets.fat - totalFat;
      fatDiffEl.innerText = fDiff >= 0 ? `${fDiff}g remaining` : `+${Math.abs(fDiff)}g over`;
    }

    // Update Chart.js Macro Breakdown
    this.renderMacroChart(totalProtein, totalCarbs, totalFat);
  }

  renderMacroChart(protein, carbs, fat) {
    const canvas = document.getElementById('diet-macro-chart');
    if (!canvas) return;

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
        `Protein (${protPercent}%)`,
        `Carbs (${carbPercent}%)`,
        `Healthy Fats (${fatPercent}%)`
      ],
      datasets: [{
        data: [protein * 4, carbs * 4, fat * 9],
        backgroundColor: [
          '#3B82F6', // Blue
          '#F59E0B', // Amber
          '#EF4444'  // Red
        ],
        borderColor: '#0C0D12',
        borderWidth: 3,
        hoverOffset: 6
      }]
    };

    if (this.chartInstance) {
      this.chartInstance.data = data;
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
                color: '#CBD5E1',
                font: { family: 'Montserrat', size: 11, weight: '600' },
                padding: 12
              }
            },
            tooltip: {
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

    // Reset current meals
    Object.keys(this.meals).forEach(k => { this.meals[k] = []; });

    // Populate from preset
    Object.keys(preset.meals).forEach(mealKey => {
      if (this.meals[mealKey]) {
        preset.meals[mealKey].forEach(item => {
          this.addFood(mealKey, item.foodId, item.multiplier);
        });
      }
    });

    // Update targets to match preset philosophy
    this.targets.calories = preset.targetCalories;
    this.targets.protein = preset.targetProtein;
    this.targets.carbs = preset.targetCarbs;
    this.targets.fat = preset.targetFat;
    this.renderTargetsUI();

    this.renderMeals();
    this.updateSummaryAndCharts();
    this.saveToStorage();

    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FCE38A', '#FFFFFF']
      });
    }

    this.showToast(`Loaded Preset: "${preset.name}"!`);
  }

  clearDiet() {
    if (confirm("Are you sure you want to clear your current diet plan?")) {
      Object.keys(this.meals).forEach(k => { this.meals[k] = []; });
      this.renderMeals();
      this.updateSummaryAndCharts();
      this.saveToStorage();
      this.showToast("Diet plan cleared.");
    }
  }

  renderPresetSelector() {
    const container = document.getElementById('diet-preset-pills');
    if (!container) return;

    container.innerHTML = PRESET_DIETS.map(preset => `
      <button type="button" class="btn-load-preset px-3 py-2 rounded-lg bg-obsidian-800 border border-gold-glow/30 hover:border-amber-400 text-left transition flex items-center space-x-3 group"
        data-id="${preset.id}">
        <div class="w-8 h-8 rounded-full bg-amber-400/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-200 group-hover:text-amber-300 transition">${preset.name}</div>
          <div class="text-[11px] text-gray-400">${preset.targetCalories} kcal • ${preset.targetProtein}g P</div>
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
          <div class="text-center py-8 text-gray-400 text-sm">
            <i class="fa-solid fa-magnifying-glass mb-2 text-xl text-gray-500 block"></i>
            No matching food items found. Use "+ Custom Food" to add your own!
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(food => {
        const serving = isImperial ? `${food.serving} ${food.unit}` : `${food.metricServing} ${food.metricUnit}`;
        return `
          <div class="flex items-center justify-between p-3 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 hover:border-amber-400/40 transition">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center text-sm">
                <i class="fa-solid fa-${food.icon}"></i>
              </div>
              <div>
                <h5 class="text-sm font-semibold text-white">${food.name}</h5>
                <p class="text-xs text-gray-400">Serving: <span class="text-amber-200/80 font-mono">${serving}</span></p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="text-right text-xs font-mono">
                <div class="text-amber-300 font-bold">${food.calories} cal</div>
                <div class="text-gray-400 text-[10px] space-x-1.5">
                  <span class="text-blue-400">${food.protein}P</span>
                  <span class="text-amber-400">${food.carbs}C</span>
                  <span class="text-red-400">${food.fat}F</span>
                </div>
              </div>

              <button type="button" class="btn-select-food px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
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
    // Goal Change
    const goalSelect = document.getElementById('diet-goal-select');
    if (goalSelect) {
      goalSelect.addEventListener('change', (e) => {
        this.profile.goal = e.target.value;
        this.calculateTargets();
      });
    }

    // Activity Level Change
    const activitySelect = document.getElementById('diet-activity-select');
    if (activitySelect) {
      activitySelect.addEventListener('change', (e) => {
        this.profile.activityLevel = parseFloat(e.target.value);
        this.calculateTargets();
      });
    }

    // Gender
    const genderSelect = document.getElementById('diet-gender-select');
    if (genderSelect) {
      genderSelect.addEventListener('change', (e) => {
        this.profile.gender = e.target.value;
        this.calculateTargets();
      });
    }

    // Age
    const ageInput = document.getElementById('diet-age-input');
    if (ageInput) {
      ageInput.addEventListener('input', (e) => {
        this.profile.age = parseInt(e.target.value, 10) || 30;
        this.calculateTargets();
      });
    }

    // Weight & Height (Imperial)
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

    // Weight & Height (Metric)
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

    // Clear diet button
    const clearBtn = document.getElementById('btn-clear-diet');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearDiet());
    }

    // Print & Export Diet button
    const exportBtn = document.getElementById('btn-export-diet');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportDietPrintout());
    }

    // Close modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeFoodModal();
        this.closeCustomModal();
      });
    });

    // Custom Food Form Submit
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
    // Generate clean printable view
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
        <div style="margin-bottom: 20px; padding: 14px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 6px; margin-bottom: 10px;">
            <strong style="font-size: 16px; color: #111;">${this.mealNames[mealKey]}</strong>
            <span style="font-weight: bold; color: #D4AF37;">${Math.round(mealCals)} kcal (${Math.round(mealProt)}g P | ${Math.round(mealCarb)}g C | ${Math.round(mealFat)}g F)</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f4f4f4; text-align: left;">
                <th style="padding: 6px;">Food Item</th>
                <th style="padding: 6px;">Serving</th>
                <th style="padding: 6px;">Calories</th>
                <th style="padding: 6px;">Macros (P / C / F)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                groceryList.add(item.name);
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px;"><strong>${item.name}</strong></td>
                    <td style="padding: 6px;">${item.servingDisplay}</td>
                    <td style="padding: 6px;">${Math.round(item.calories)} cal</td>
                    <td style="padding: 6px;">${Math.round(item.protein)}g / ${Math.round(item.carbs)}g / ${Math.round(item.fat)}g</td>
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
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #222;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #000; letter-spacing: 1px;">N24 FITNESS</h1>
            <p style="margin: 3px 0 0 0; color: #666; font-size: 12px; letter-spacing: 2px;">STRONGER • HEALTHIER • BETTER</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: bold; color: #D4AF37;">OFFICIAL CLIENT NUTRITION PROTOCOL</div>
            <div style="font-size: 12px; color: #666;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div style="font-size: 12px; color: #666;">Goal: ${this.profile.goal.toUpperCase()}</div>
          </div>
        </div>

        <!-- Daily Target Summary Box -->
        <div style="background: #FAF8F5; border: 1px solid #D4AF37; padding: 15px; border-radius: 8px; margin-bottom: 25px; display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 12px; color: #666; text-transform: uppercase;">Total Daily Calories</div>
            <div style="font-size: 20px; font-weight: bold; color: #111;">${Math.round(totalCals)} kcal</div>
            <div style="font-size: 11px; color: #888;">Target: ${this.targets.calories} kcal</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666; text-transform: uppercase;">Protein Target</div>
            <div style="font-size: 20px; font-weight: bold; color: #2563EB;">${Math.round(totalProt)}g</div>
            <div style="font-size: 11px; color: #888;">Target: ${this.targets.protein}g</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666; text-transform: uppercase;">Carbs Target</div>
            <div style="font-size: 20px; font-weight: bold; color: #D97706;">${Math.round(totalCarb)}g</div>
            <div style="font-size: 11px; color: #888;">Target: ${this.targets.carbs}g</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666; text-transform: uppercase;">Healthy Fats Target</div>
            <div style="font-size: 20px; font-weight: bold; color: #DC2626;">${Math.round(totalFat)}g</div>
            <div style="font-size: 11px; color: #888;">Target: ${this.targets.fat}g</div>
          </div>
        </div>

        <!-- Meals Breakdown -->
        <h3 style="margin-bottom: 15px; font-size: 18px; border-left: 4px solid #D4AF37; padding-left: 10px;">DAILY MEAL SCHEDULE</h3>
        ${mealHtml || '<p>No meals added yet.</p>'}

        <!-- Grocery Checklist -->
        ${groceryArray.length > 0 ? `
          <div style="margin-top: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ccc;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #333;">🛒 US Grocery Checklist for this Plan:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
              ${groceryArray.map(g => `<div>☐ ${g}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 15px; font-size: 11px; color: #777;">
          N24 FITNESS • Personalized Online Fitness & Nutrition Coaching • www.n24fitness.com
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
      toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg bg-obsidian-800 text-white border border-amber-400 shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center space-x-2 text-sm';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-amber-400"></i><span>${message}</span>`;
    toast.classList.remove('translate-y-12', 'opacity-0');
    
    setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 2800);
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
      console.warn("Could not save to localStorage", e);
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
        // Load default preset on initial first visit for incredible immediate impression!
        this.loadPreset('lean-shred-us');
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }
}

// Instantiate and expose globally
export const dietArchitect = new DietArchitect();
window.N24_DIET_ARCHITECT = dietArchitect;

