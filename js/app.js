// N24 FITNESS - Radiant Executive Application Coordinator
import { dietArchitect } from './diet-builder.js';
import { calorieCalculator } from './calorie-calculator.js';
import { CLIENT_TESTIMONIALS, COACHING_TIERS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  dietArchitect.init();
  calorieCalculator.init();

  initUnitSwitcher();
  renderTestimonials();
  renderCoachingTiers();
  initConsultationBookingModal();
  initMobileMenu();
  initSmoothScroll();
});

// --- THEME MANAGER (DARK / LIGHT MODE) ---
function initThemeManager() {
  const toggleButtons = document.querySelectorAll('.btn-theme-toggle');
  
  // Detect saved preference or system default
  const savedTheme = localStorage.getItem('N24_THEME');
  const isLight = savedTheme === 'light';

  const applyTheme = (light) => {
    if (light) {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }

    toggleButtons.forEach(btn => {
      btn.innerHTML = light 
        ? `<i class="fa-solid fa-moon text-slate-800 text-sm"></i>` 
        : `<i class="fa-solid fa-sun text-amber-300 text-sm"></i>`;
      btn.setAttribute('title', light ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });

    // Notify Diet Architect to adapt Chart.js colors
    if (window.N24_DIET_ARCHITECT && window.N24_DIET_ARCHITECT.updateSummaryAndCharts) {
      window.N24_DIET_ARCHITECT.updateSummaryAndCharts();
    }
  };

  // Initial application
  applyTheme(isLight);

  // Bind click listeners
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentIsLight = document.documentElement.classList.contains('light-theme');
      const nextIsLight = !currentIsLight;
      localStorage.setItem('N24_THEME', nextIsLight ? 'light' : 'dark');
      applyTheme(nextIsLight);
      
      if (window.N24_DIET_ARCHITECT) {
        window.N24_DIET_ARCHITECT.showToast(nextIsLight ? 'Light Theme Activated' : 'Dark Theme Activated');
      }
    });
  });
}

// --- GLOBAL UNIT SWITCHER ---
function initUnitSwitcher() {
  const imperialBtn = document.getElementById('unit-btn-imperial');
  const metricBtn = document.getElementById('unit-btn-metric');

  const updateButtons = (unit) => {
    if (unit === 'imperial') {
      imperialBtn?.classList.add('active');
      metricBtn?.classList.remove('active');
    } else {
      metricBtn?.classList.add('active');
      imperialBtn?.classList.remove('active');
    }
  };

  imperialBtn?.addEventListener('click', () => {
    updateButtons('imperial');
    dietArchitect.setUnitSystem('imperial');
    calorieCalculator.setUnitSystem('imperial');
    dietArchitect.showToast("Units: US Imperial (lbs / oz)");
  });

  metricBtn?.addEventListener('click', () => {
    updateButtons('metric');
    dietArchitect.setUnitSystem('metric');
    calorieCalculator.setUnitSystem('metric');
    dietArchitect.showToast("Units: Metric (kg / g)");
  });
}

// --- RENDER VERIFIED US CLIENT CASE STUDIES ---
function renderTestimonials() {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;

  container.innerHTML = CLIENT_TESTIMONIALS.map(t => `
    <div class="bright-card p-6 sm:p-7 flex flex-col justify-between border relative group hover:border-amber-400/60 transition duration-300">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-1 text-amber-400 text-xs">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <span class="text-amber-400 ml-2 font-mono text-[11px] font-bold">Verified US Athlete</span>
          </div>
          <span class="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
            ${t.duration}
          </span>
        </div>

        <span class="text-xs font-mono text-amber-400 font-extrabold uppercase tracking-wider block mb-2">
          ${t.program}
        </span>

        <p class="text-xs sm:text-sm leading-relaxed mb-6 font-medium opacity-90">
          "${t.quote}"
        </p>
      </div>

      <div class="pt-4 border-t border-white/10 dark:border-white/10" style="border-top-color: var(--border-subtle);">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h5 class="font-extrabold text-base">${t.name}</h5>
            <div class="text-xs font-semibold opacity-75">
              <i class="fa-solid fa-location-dot mr-1 text-amber-400"></i> ${t.location} • <span>${t.role}</span>
            </div>
          </div>
        </div>

        <div class="light-invert-black rounded-xl p-3 text-xs font-mono border flex flex-wrap items-center justify-between gap-1 shadow-inner" style="background-color: var(--bg-inner-input); border-color: var(--border-subtle);">
          <span class="text-amber-400 font-black">${t.achievement}</span>
          <span class="text-xs font-semibold opacity-80">${t.metrics}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --- RENDER EXECUTIVE COACHING TIERS ---
function renderCoachingTiers() {
  const container = document.getElementById('pricing-tiers-grid');
  if (!container) return;

  container.innerHTML = COACHING_TIERS.map(tier => `
    <div class="bright-card p-7 sm:p-8 flex flex-col justify-between relative transition duration-300 ${
      tier.popular ? 'bright-card-gold md:-translate-y-2' : ''
    }">
      ${tier.popular ? `
        <div class="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg">
          ★ ${tier.badge} ★
        </div>
      ` : ''}

      <div>
        <h4 class="text-xl font-black mb-2">${tier.name}</h4>
        <p class="text-xs opacity-75 mb-6 font-medium min-h-[36px]">${tier.description}</p>

        <div class="flex items-baseline mb-6 pb-6 border-b" style="border-bottom-color: var(--border-subtle);">
          <span class="text-2xl font-bold text-amber-400 font-mono">$</span>
          <span class="text-5xl font-black font-mono tracking-tight ml-1">${tier.price}</span>
          <span class="text-xs ml-2 font-mono font-bold uppercase opacity-80">${tier.period}</span>
        </div>

        <ul class="space-y-3 mb-8 text-xs font-semibold opacity-90">
          ${tier.features.map(feat => `
            <li class="flex items-start space-x-2.5">
              <i class="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5 flex-shrink-0"></i>
              <span class="leading-relaxed">${feat}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button type="button" class="w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
        tier.popular 
          ? 'btn-gold-bright shadow-xl' 
          : 'btn-bright-outline'
      } btn-tier-select" data-tier="${tier.name}">
        ${tier.cta}
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-tier-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const tierName = btn.getAttribute('data-tier');
      openConsultationModalWithPreset(tierName);
    });
  });
}

// --- US CLIENT CONSULTATION INTAKE ---
function initConsultationBookingModal() {
  const modal = document.getElementById('consultation-booking-modal');
  const openButtons = document.querySelectorAll('.btn-open-consult-modal');
  const closeBtn = document.getElementById('btn-close-consult-modal');
  const form = document.getElementById('us-consultation-form');
  const confirmationView = document.getElementById('consult-confirmation-view');
  const bookingFieldsView = document.getElementById('consult-fields-view');

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('hidden');
        if (bookingFieldsView) bookingFieldsView.classList.remove('hidden');
        if (confirmationView) confirmationView.classList.add('hidden');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('consult-name')?.value || 'Client';
      const phone = document.getElementById('consult-phone')?.value || '';
      const email = document.getElementById('consult-email')?.value || '';
      const state = document.getElementById('consult-state')?.value || 'EST';
      const goal = document.getElementById('consult-goal')?.value || 'Physique Architecture';
      const preferredDate = document.getElementById('consult-date')?.value || new Date().toISOString().split('T')[0];
      const preferredTime = document.getElementById('consult-time')?.value || '10:00 AM';

      const bookingData = {
        name,
        phone,
        email,
        state,
        goal,
        preferredDate,
        preferredTime,
        submittedAt: new Date().toISOString()
      };

      try {
        const existingBookings = JSON.parse(localStorage.getItem('N24_US_CONSULTATIONS') || '[]');
        existingBookings.push(bookingData);
        localStorage.setItem('N24_US_CONSULTATIONS', JSON.stringify(existingBookings));
      } catch (err) {
        console.warn('Storage failed', err);
      }

      const confName = document.getElementById('conf-client-name');
      const confDetails = document.getElementById('conf-booking-details');
      if (confName) confName.innerText = name;
      if (confDetails) {
        confDetails.innerText = `${preferredDate} at ${preferredTime} (${state} Timezone)`;
      }

      if (bookingFieldsView) bookingFieldsView.classList.add('hidden');
      if (confirmationView) confirmationView.classList.remove('hidden');
    });
  }
}

function openConsultationModalWithPreset(programName) {
  const modal = document.getElementById('consultation-booking-modal');
  const goalSelect = document.getElementById('consult-goal');
  const bookingFieldsView = document.getElementById('consult-fields-view');
  const confirmationView = document.getElementById('consult-confirmation-view');

  if (goalSelect) {
    goalSelect.value = programName;
  }

  if (modal) {
    modal.classList.remove('hidden');
    if (bookingFieldsView) bookingFieldsView.classList.remove('hidden');
    if (confirmationView) confirmationView.classList.add('hidden');
  }
}

// --- MOBILE MENU ---
function initMobileMenu() {
  const hamburger = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const closeDrawer = document.getElementById('btn-close-mobile-nav');

  hamburger?.addEventListener('click', () => {
    mobileDrawer?.classList.toggle('hidden');
  });

  closeDrawer?.addEventListener('click', () => {
    mobileDrawer?.classList.add('hidden');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer?.classList.add('hidden');
    });
  });
}

// --- SMOOTH SCROLLING ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
