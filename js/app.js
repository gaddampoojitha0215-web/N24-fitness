// N24 FITNESS - Executive Application Coordinator
import { dietArchitect } from './diet-builder.js';
import { calorieCalculator } from './calorie-calculator.js';
import { CLIENT_TESTIMONIALS, COACHING_TIERS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  dietArchitect.init();
  calorieCalculator.init();

  initUnitSwitcher();
  renderTestimonials();
  renderCoachingTiers();
  initConsultationBookingModal();
  initMobileMenu();
  initSmoothScroll();
});

// --- GLOBAL UNIT SWITCHER ---
function initUnitSwitcher() {
  const imperialBtn = document.getElementById('unit-btn-imperial');
  const metricBtn = document.getElementById('unit-btn-metric');

  const updateButtons = (unit) => {
    if (unit === 'imperial') {
      imperialBtn?.classList.add('bg-white/10', 'text-white');
      imperialBtn?.classList.remove('text-slate-400');
      metricBtn?.classList.remove('bg-white/10', 'text-white');
      metricBtn?.classList.add('text-slate-400');
    } else {
      metricBtn?.classList.add('bg-white/10', 'text-white');
      metricBtn?.classList.remove('text-slate-400');
      imperialBtn?.classList.remove('bg-white/10', 'text-white');
      imperialBtn?.classList.add('text-slate-400');
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
    <div class="exec-card p-6 flex flex-col justify-between border border-white/5 relative group bg-[#0C0E14] hover:border-white/15 transition duration-300">
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="text-[11px] font-mono text-amber-300/90 font-medium tracking-wide uppercase">
            ${t.program}
          </span>
          <span class="text-[11px] text-slate-500 font-mono">
            ${t.duration}
          </span>
        </div>

        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
          "${t.quote}"
        </p>
      </div>

      <div class="pt-4 border-t border-white/[0.06]">
        <div class="flex items-center justify-between mb-2.5">
          <div>
            <h5 class="font-bold text-white text-sm">${t.name}</h5>
            <div class="text-[11px] text-slate-400">
              ${t.role} • <span class="text-slate-300">${t.location}</span>
            </div>
          </div>
        </div>

        <div class="bg-black/30 rounded p-2.5 text-xs font-mono text-slate-300 border border-white/[0.04] flex flex-wrap items-center justify-between gap-1">
          <span class="text-slate-100 font-medium">${t.achievement}</span>
          <span class="text-amber-200/80 text-[11px]">${t.metrics}</span>
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
    <div class="exec-card p-6 sm:p-7 flex flex-col justify-between relative transition duration-300 bg-[#0C0E14] ${
      tier.popular ? 'exec-card-highlight md:-translate-y-1' : 'border-white/5'
    }">
      ${tier.popular ? `
        <div class="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-amber-200 font-mono text-[10px] font-bold uppercase tracking-wider">
          ${tier.badge}
        </div>
      ` : ''}

      <div>
        <div class="flex justify-between items-baseline mb-1">
          <h4 class="text-base font-bold text-white">${tier.name}</h4>
        </div>
        <p class="text-xs text-slate-400 mb-5 min-h-[32px]">${tier.description}</p>

        <div class="flex items-baseline mb-6 pb-5 border-b border-white/[0.06]">
          <span class="text-xl font-medium text-slate-400 font-mono">$</span>
          <span class="text-4xl font-extrabold text-white font-mono tracking-tight ml-0.5">${tier.price}</span>
          <span class="text-slate-400 text-xs ml-2 font-mono">${tier.period}</span>
        </div>

        <ul class="space-y-2.5 mb-8 text-xs text-slate-300">
          ${tier.features.map(feat => `
            <li class="flex items-start space-x-2.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-1.5 flex-shrink-0"></span>
              <span class="leading-relaxed">${feat}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button type="button" class="w-full py-2.5 rounded-md font-semibold text-xs tracking-wide transition ${
        tier.popular 
          ? 'btn-primary-gold' 
          : 'btn-secondary'
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
