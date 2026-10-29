// N24 FITNESS - Flagship Application Coordinator
import { dietArchitect } from './diet-builder.js';
import { calorieCalculator } from './calorie-calculator.js';
import { CLIENT_TESTIMONIALS, COACHING_TIERS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Diet Architect & Calorie Calculator engines
  dietArchitect.init();
  calorieCalculator.init();

  // Initialize UI Components
  initUnitSwitcher();
  renderTestimonials();
  renderCoachingTiers();
  initConsultationBookingModal();
  initMobileMenu();
  initSmoothScroll();
});

// --- GLOBAL UNIT SWITCHER (Imperial vs Metric) ---
function initUnitSwitcher() {
  const imperialBtn = document.getElementById('unit-btn-imperial');
  const metricBtn = document.getElementById('unit-btn-metric');

  const updateButtons = (unit) => {
    if (unit === 'imperial') {
      imperialBtn?.classList.add('bg-amber-500', 'text-black', 'font-bold');
      imperialBtn?.classList.remove('text-gray-300');
      metricBtn?.classList.remove('bg-amber-500', 'text-black', 'font-bold');
      metricBtn?.classList.add('text-gray-300');
    } else {
      metricBtn?.classList.add('bg-amber-500', 'text-black', 'font-bold');
      metricBtn?.classList.remove('text-gray-300');
      imperialBtn?.classList.remove('bg-amber-500', 'text-black', 'font-bold');
      imperialBtn?.classList.add('text-gray-300');
    }
  };

  imperialBtn?.addEventListener('click', () => {
    updateButtons('imperial');
    dietArchitect.setUnitSystem('imperial');
    calorieCalculator.setUnitSystem('imperial');
    dietArchitect.showToast("Units switched to US Imperial (lbs / oz / inches)");
  });

  metricBtn?.addEventListener('click', () => {
    updateButtons('metric');
    dietArchitect.setUnitSystem('metric');
    calorieCalculator.setUnitSystem('metric');
    dietArchitect.showToast("Units switched to Metric (kg / grams / cm)");
  });
}

// --- RENDER US CLIENT TRANSFORMATIONS ---
function renderTestimonials() {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;

  container.innerHTML = CLIENT_TESTIMONIALS.map((t, idx) => `
    <div class="n24-card p-6 flex flex-col justify-between border-gold-glow/20 relative group hover:-translate-y-1 transition duration-300">
      <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[10px] uppercase tracking-wider shadow-lg">
        ${t.badge}
      </div>

      <div>
        <div class="flex items-center space-x-1 text-amber-400 mb-4 text-xs">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <span class="text-gray-400 ml-2 text-xs font-mono">Verified US Client</span>
        </div>

        <p class="text-gray-300 text-sm italic mb-6 leading-relaxed">
          "${t.quote}"
        </p>
      </div>

      <div class="pt-4 border-t border-white/10">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h5 class="font-bold text-white text-base">${t.name}</h5>
            <div class="text-xs text-amber-400/90 font-medium">
              <i class="fa-solid fa-location-dot mr-1"></i>${t.location}
            </div>
            <div class="text-[11px] text-gray-500">${t.role}</div>
          </div>
          <div class="text-right">
            <span class="inline-block px-2 py-1 rounded bg-amber-400/10 text-amber-300 font-mono text-xs font-bold border border-amber-400/20">
              ${t.duration}
            </span>
          </div>
        </div>

        <div class="bg-black/40 rounded p-2 text-xs font-mono text-gray-300 border border-white/5 flex items-center justify-between">
          <span class="text-amber-200">${t.achievement}</span>
          <span class="text-gray-400 text-[10px]">${t.metrics}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --- RENDER COACHING & PRICING TIERS ---
function renderCoachingTiers() {
  const container = document.getElementById('pricing-tiers-grid');
  if (!container) return;

  container.innerHTML = COACHING_TIERS.map(tier => `
    <div class="n24-card p-8 flex flex-col justify-between relative transition duration-300 ${
      tier.popular ? 'border-amber-400/60 shadow-[0_0_35px_rgba(212,175,55,0.2)] md:-translate-y-2' : 'border-white/10'
    }">
      ${tier.popular ? `
        <div class="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md">
          ${tier.badge}
        </div>
      ` : ''}

      <div>
        <h4 class="text-xl font-bold text-white mb-2">${tier.name}</h4>
        <p class="text-xs text-gray-400 mb-6 min-h-[36px]">${tier.description}</p>

        <div class="flex items-baseline mb-6 pb-6 border-b border-white/10">
          <span class="text-2xl font-bold text-amber-400 font-mono">$</span>
          <span class="text-5xl font-black text-white font-mono tracking-tight ml-1">${tier.price}</span>
          <span class="text-gray-400 text-xs ml-2 uppercase font-semibold">${tier.period}</span>
        </div>

        <ul class="space-y-3 mb-8 text-xs text-gray-300">
          ${tier.features.map(feat => `
            <li class="flex items-start space-x-2.5">
              <i class="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5"></i>
              <span>${feat}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button type="button" class="w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
        tier.popular 
          ? 'btn-gold shadow-lg' 
          : 'btn-dark-outline'
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

// --- US CLIENT CONSULTATION & INTAKE MODAL ---
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

  // Handle consultation form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('consult-name')?.value || 'Valued Athlete';
      const phone = document.getElementById('consult-phone')?.value || '';
      const email = document.getElementById('consult-email')?.value || '';
      const state = document.getElementById('consult-state')?.value || 'EST';
      const goal = document.getElementById('consult-goal')?.value || 'Physique Transformation';
      const preferredDate = document.getElementById('consult-date')?.value || new Date().toISOString().split('T')[0];
      const preferredTime = document.getElementById('consult-time')?.value || '10:00 AM';

      // Save consultation to localStorage
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

      // Populate confirmation view
      const confName = document.getElementById('conf-client-name');
      const confDetails = document.getElementById('conf-booking-details');
      if (confName) confName.innerText = name;
      if (confDetails) {
        confDetails.innerText = `${preferredDate} at ${preferredTime} (${state} Timezone)`;
      }

      if (bookingFieldsView) bookingFieldsView.classList.add('hidden');
      if (confirmationView) confirmationView.classList.remove('hidden');

      if (window.confetti) {
        window.confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#D4AF37', '#FCE38A', '#10B981']
        });
      }
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

