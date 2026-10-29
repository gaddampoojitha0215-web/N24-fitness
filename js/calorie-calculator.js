// N24 FITNESS - BurnIQ Calorie & Activity Expenditure Engine
import { EXERCISE_DATABASE } from './data.js';

class CalorieBurnCalculator {
  constructor() {
    this.unitSystem = 'imperial'; // 'imperial' (lbs) or 'metric' (kg)
    this.weightLbs = 185;
    this.weightKg = 84;
    this.age = 30;

    this.selectedExerciseId = 'heavy-compound-lifting';
    this.durationMinutes = 60;
    this.intensityMultiplier = 1.0; // Moderate

    this.loggedActivities = [];
  }

  init() {
    this.loadLoggedActivities();
    this.populateExerciseDropdown();
    this.setupListeners();
    this.calculate();
    this.renderLoggedActivities();
    this.updateEnergyBalance();
  }

  setUnitSystem(unit) {
    this.unitSystem = unit;
    if (unit === 'metric') {
      this.weightKg = Math.round(this.weightLbs * 0.45359237);
    } else {
      this.weightLbs = Math.round(this.weightKg * 2.20462);
    }

    const weightInputLbs = document.getElementById('burn-weight-lbs');
    const weightInputKg = document.getElementById('burn-weight-kg');
    const imperialWrapper = document.getElementById('burn-weight-imperial-wrap');
    const metricWrapper = document.getElementById('burn-weight-metric-wrap');

    if (imperialWrapper && metricWrapper) {
      imperialWrapper.classList.toggle('hidden', unit !== 'imperial');
      metricWrapper.classList.toggle('hidden', unit === 'imperial');
    }

    if (weightInputLbs) weightInputLbs.value = this.weightLbs;
    if (weightInputKg) weightInputKg.value = this.weightKg;

    this.calculate();
  }

  populateExerciseDropdown() {
    const select = document.getElementById('burn-exercise-select');
    if (!select) return;

    select.innerHTML = '';

    const categories = {
      strength: 'Strength & Hypertrophy',
      cardio: 'Cardiovascular & Conditioning',
      combat: 'Combat & Functional Athletics',
      endurance: 'Endurance & Swimming',
      recovery: 'Mobility & Active Recovery'
    };

    Object.keys(categories).forEach(catKey => {
      const group = document.createElement('optgroup');
      group.label = `--- ${categories[catKey]} ---`;

      const exercises = EXERCISE_DATABASE.filter(ex => ex.category === catKey);
      exercises.forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex.id;
        opt.innerText = `${ex.name} (MET: ${ex.met})`;
        if (ex.id === this.selectedExerciseId) {
          opt.selected = true;
        }
        group.appendChild(opt);
      });

      select.appendChild(group);
    });

    this.updateExerciseInfo();
  }

  updateExerciseInfo() {
    const exercise = EXERCISE_DATABASE.find(e => e.id === this.selectedExerciseId);
    if (!exercise) return;

    const infoEl = document.getElementById('burn-exercise-meta');
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 text-xs">
          <span class="px-2.5 py-1 rounded bg-amber-400/10 text-amber-300 font-semibold border border-amber-400/20">
            <i class="fa-solid fa-gauge-high mr-1"></i> MET Value: <strong>${exercise.met}</strong>
          </span>
          <span class="px-2.5 py-1 rounded bg-white/5 text-gray-300 border border-white/10">
            <i class="fa-solid fa-heart-pulse mr-1 text-red-400"></i> ${exercise.targetZone}
          </span>
          <span class="text-gray-400 italic">${exercise.intensityLabel}</span>
        </div>
      `;
    }
  }

  calculate() {
    const exercise = EXERCISE_DATABASE.find(e => e.id === this.selectedExerciseId) || EXERCISE_DATABASE[0];
    const weightInKg = this.unitSystem === 'imperial' 
      ? this.weightLbs * 0.45359237 
      : this.weightKg;

    const durationHours = this.durationMinutes / 60;
    
    // Formula: MET * Weight (kg) * (Duration in minutes / 60) * Intensity Multiplier
    const baseCalories = exercise.met * weightInKg * durationHours * this.intensityMultiplier;
    const finalCalories = Math.round(baseCalories);

    // Fat Grams burned calculation (1g of body fat ~ 7.7 kcal deficit)
    const fatGrams = Math.round((finalCalories / 7.7) * 10) / 10;
    const fatOz = Math.round((fatGrams * 0.035274) * 100) / 100;

    // EPOC (Excess Post-exercise Oxygen Consumption) - Afterburn
    const epocCalories = Math.round(finalCalories * (exercise.epocRate || 0.10));
    const totalMetabolicImpact = finalCalories + epocCalories;

    // Burn rate
    const burnRatePerMin = Math.round((finalCalories / Math.max(1, this.durationMinutes)) * 10) / 10;

    // Estimated Heart Rate target based on intensity
    const maxHr = 220 - this.age;
    let targetHrPct = 0.65;
    if (this.intensityMultiplier >= 1.3) targetHrPct = 0.88;
    else if (this.intensityMultiplier >= 1.15) targetHrPct = 0.78;
    else if (this.intensityMultiplier >= 1.0) targetHrPct = 0.70;

    const estHr = Math.round(maxHr * targetHrPct);

    // Render Output Numbers
    const calsEl = document.getElementById('burn-result-calories');
    const fatEl = document.getElementById('burn-result-fat');
    const epocEl = document.getElementById('burn-result-epoc');
    const rateEl = document.getElementById('burn-result-rate');
    const totalImpactEl = document.getElementById('burn-result-total-impact');
    const hrEl = document.getElementById('burn-result-hr');

    if (calsEl) calsEl.innerText = `${finalCalories.toLocaleString()}`;
    if (fatEl) fatEl.innerText = this.unitSystem === 'imperial' 
      ? `${fatOz} oz (${fatGrams}g)` 
      : `${fatGrams}g`;
    if (epocEl) epocEl.innerText = `+${epocCalories} kcal`;
    if (rateEl) rateEl.innerText = `${burnRatePerMin} kcal/min`;
    if (totalImpactEl) totalImpactEl.innerText = `${totalMetabolicImpact.toLocaleString()} kcal`;
    if (hrEl) hrEl.innerText = `~${estHr} BPM (${Math.round(targetHrPct * 100)}% Max HR)`;

    return {
      exercise,
      calories: finalCalories,
      epoc: epocCalories,
      totalImpact: totalMetabolicImpact,
      fatGrams,
      fatOz,
      duration: this.durationMinutes
    };
  }

  logCurrentActivity() {
    const calc = this.calculate();
    const newEntry = {
      id: `log-${Date.now()}`,
      exerciseName: calc.exercise.name,
      category: calc.exercise.category,
      duration: calc.duration,
      calories: calc.calories,
      epoc: calc.epoc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.loggedActivities.push(newEntry);
    this.renderLoggedActivities();
    this.updateEnergyBalance();
    this.saveLoggedActivities();

    if (window.confetti) {
      window.confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#EF4444', '#F59E0B', '#D4AF37']
      });
    }

    if (window.N24_DIET_ARCHITECT) {
      window.N24_DIET_ARCHITECT.showToast(`Logged ${calc.calories} kcal from ${calc.exercise.name}!`);
    }
  }

  renderLoggedActivities() {
    const container = document.getElementById('logged-activities-list');
    const totalBurnEl = document.getElementById('today-total-burned');
    const totalCountEl = document.getElementById('today-activity-count');

    if (!container) return;

    const totalBurned = this.loggedActivities.reduce((sum, item) => sum + item.calories, 0);

    if (totalBurnEl) totalBurnEl.innerText = `${totalBurned.toLocaleString()} kcal`;
    if (totalCountEl) totalCountEl.innerText = `${this.loggedActivities.length} ${this.loggedActivities.length === 1 ? 'session' : 'sessions'}`;

    if (this.loggedActivities.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-500 text-xs border border-dashed border-gray-800 rounded-lg">
          No workouts logged to today's session yet. Adjust parameters above and click "+ Add to Today's Session".
        </div>
      `;
      return;
    }

    container.innerHTML = this.loggedActivities.map((log, index) => `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-white/5 hover:border-amber-400/30 transition text-xs">
        <div class="flex items-center space-x-3">
          <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#EF4444]"></span>
          <div>
            <div class="font-bold text-gray-200">${log.exerciseName}</div>
            <div class="text-gray-400 text-[11px]">${log.duration} mins • Logged at ${log.timestamp}</div>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="text-right">
            <div class="text-amber-300 font-bold font-mono text-sm">${log.calories} kcal</div>
            <div class="text-gray-400 text-[10px] font-mono">+${log.epoc} afterburn</div>
          </div>
          <button type="button" class="btn-delete-log text-gray-500 hover:text-red-400 p-1" data-index="${index}" title="Remove entry">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-delete-log').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.loggedActivities.splice(index, 1);
        this.renderLoggedActivities();
        this.updateEnergyBalance();
        this.saveLoggedActivities();
      });
    });
  }

  updateEnergyBalance() {
    const intakeCalories = window.N24_DIET_INTAKE_CALS || 1850;
    const burnedCalories = this.loggedActivities.reduce((sum, item) => sum + item.calories, 0);

    const netCalories = intakeCalories - burnedCalories;

    const intakeEl = document.getElementById('energy-calories-in');
    const burnedEl = document.getElementById('energy-calories-out');
    const netEl = document.getElementById('energy-net-balance');
    const statusEl = document.getElementById('energy-status-msg');

    if (intakeEl) intakeEl.innerText = `${intakeCalories.toLocaleString()} kcal`;
    if (burnedEl) burnedEl.innerText = `${burnedCalories.toLocaleString()} kcal`;
    if (netEl) netEl.innerText = `${netCalories.toLocaleString()} kcal`;

    if (statusEl) {
      if (burnedCalories === 0) {
        statusEl.innerHTML = `<span class="text-gray-400">Log today's workout above to calculate your net deficit/surplus.</span>`;
      } else if (netCalories < 1500) {
        statusEl.innerHTML = `<span class="text-emerald-400 font-semibold"><i class="fa-solid fa-fire mr-1"></i> Accelerated Fat-Shred Deficit: High daily energy output! Make sure to hit your protein target.</span>`;
      } else if (netCalories <= 2200) {
        statusEl.innerHTML = `<span class="text-amber-300 font-semibold"><i class="fa-solid fa-dumbbell mr-1"></i> Optimal Body Recomposition: Perfect ratio of energy for recovery and lean muscle preservation.</span>`;
      } else {
        statusEl.innerHTML = `<span class="text-blue-400 font-semibold"><i class="fa-solid fa-chart-line mr-1"></i> Hypertrophy Mass Fueling: Sufficient surplus for maximal progressive overload and strength.</span>`;
      }
    }
  }

  setupListeners() {
    // Exercise Dropdown
    const exerciseSelect = document.getElementById('burn-exercise-select');
    if (exerciseSelect) {
      exerciseSelect.addEventListener('change', (e) => {
        this.selectedExerciseId = e.target.value;
        this.updateExerciseInfo();
        this.calculate();
      });
    }

    // Duration slider and input
    const durationInput = document.getElementById('burn-duration-input');
    const durationSlider = document.getElementById('burn-duration-slider');

    if (durationInput && durationSlider) {
      durationInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) || 10;
        this.durationMinutes = Math.min(300, Math.max(5, val));
        durationSlider.value = this.durationMinutes;
        this.calculate();
      });

      durationSlider.addEventListener('input', (e) => {
        this.durationMinutes = parseInt(e.target.value, 10) || 60;
        durationInput.value = this.durationMinutes;
        this.calculate();
      });
    }

    // Intensity buttons
    document.querySelectorAll('.btn-burn-intensity').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-burn-intensity').forEach(b => {
          b.classList.remove('bg-amber-500', 'text-black', 'border-amber-400');
          b.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
        });

        btn.classList.add('bg-amber-500', 'text-black', 'border-amber-400');
        btn.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');

        this.intensityMultiplier = parseFloat(btn.getAttribute('data-intensity')) || 1.0;
        this.calculate();
      });
    });

    // Weight inputs
    const weightLbs = document.getElementById('burn-weight-lbs');
    if (weightLbs) {
      weightLbs.addEventListener('input', (e) => {
        this.weightLbs = parseFloat(e.target.value) || 180;
        this.calculate();
      });
    }

    const weightKg = document.getElementById('burn-weight-kg');
    if (weightKg) {
      weightKg.addEventListener('input', (e) => {
        this.weightKg = parseFloat(e.target.value) || 82;
        this.calculate();
      });
    }

    // Age
    const ageInput = document.getElementById('burn-age-input');
    if (ageInput) {
      ageInput.addEventListener('input', (e) => {
        this.age = parseInt(e.target.value, 10) || 30;
        this.calculate();
      });
    }

    // Add to session button
    const logBtn = document.getElementById('btn-add-activity-log');
    if (logBtn) {
      logBtn.addEventListener('click', () => this.logCurrentActivity());
    }

    // Clear session button
    const clearBtn = document.getElementById('btn-clear-activities');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm("Clear today's logged activities?")) {
          this.loggedActivities = [];
          this.renderLoggedActivities();
          this.updateEnergyBalance();
          this.saveLoggedActivities();
        }
      });
    }
  }

  saveLoggedActivities() {
    try {
      localStorage.setItem('N24_LOGGED_WORKOUTS', JSON.stringify(this.loggedActivities));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  loadLoggedActivities() {
    try {
      const saved = localStorage.getItem('N24_LOGGED_WORKOUTS');
      if (saved) {
        this.loggedActivities = JSON.parse(saved);
      } else {
        // Preload an inspiring sample workout for first-time visitors!
        this.loggedActivities = [
          {
            id: 'sample-1',
            exerciseName: 'Heavy Barbell Squats, Deadlifts & Presses',
            category: 'strength',
            duration: 50,
            calories: 412,
            epoc: 58,
            timestamp: '07:30 AM'
          },
          {
            id: 'sample-2',
            exerciseName: '12-3-30 Incline Treadmill Walk (12% Incline, 3.0 mph)',
            category: 'cardio',
            duration: 25,
            calories: 215,
            epoc: 13,
            timestamp: '08:25 AM'
          }
        ];
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }
}

export const calorieCalculator = new CalorieBurnCalculator();
window.N24_CALORIE_CALCULATOR_INSTANCE = calorieCalculator;

