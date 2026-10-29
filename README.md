# N24 FITNESS — Premier US Online Fitness & Nutrition Platform
> **STRONGER • HEALTHIER • BETTER**

---

## 🏋️‍♂️ Overview
**N24 FITNESS** is a high-performance web platform engineered specifically for **US clients**, high-earning executives, athletes, and fitness enthusiasts seeking elite body recomposition, muscle hypertrophy, and science-grounded fat shredding.

The platform directly integrates the official **N24 FITNESS metallic gold & titanium logo** with an obsidian/gold luxury aesthetic and two flagship client-side engines:
1. **N24 Smart Diet Architect**: An interactive custom meal and diet planner with Mifflin-St Jeor TDEE calculations, 1-click US diet presets, 70+ US fitness staples, custom food creator, and printable PDF meal blueprints with grocery checklists.
2. **N24 BurnIQ - Calorie & Activity Expenditure Engine**: A science-grounded METs calculator computing active calories burned, fat oxidized (oz & grams), EPOC metabolic afterburn, target heart rate zones, and a live daily session logger.
3. **Net Caloric Balance Synchronizer**: Seamlessly bridges **Diet Intake (Calories In)** vs **Workout Burn (Calories Out)** in real-time.
4. **US Client Consultation Intake**: Automated 1-on-1 strategy session booking tailored for US timezones (EST, CST, MST, PST).

---

## 🌟 Key Features Built For US Clients

### 1. 🥗 Smart Diet Architect ("Create Their Own Diet")
- **Biometric Target Engine**: Computes BMR, TDEE, and optimal macro splits (Protein, Carbohydrates, Healthy Fats) based on client age, gender, weight (lbs/kg), height (ft/in or cm), and activity level.
- **6 Configurable Daily Meal Slots**:
  - *Meal 1*: High-Energy Breakfast
  - *Meal 2*: Mid-Morning Fuel
  - *Meal 3*: Lean Muscle Lunch
  - *Meal 4*: Anabolic Post-Workout Recovery
  - *Meal 5*: Sustained Dinner
  - *Meal 6*: Night-Time Casein / Snack
- **70+ US Fitness Staples Database**: Includes USDA-standard metrics for boneless skinless chicken breast, 93/7 lean turkey, wild Atlantic salmon, USDA choice flank steak, egg whites, whey isolate, Greek yogurt, rolled oats, jasmine rice, sweet potatoes, avocado, EVOO, almonds, and superfoods.
- **Serving Multiplier & Adjustment**: Easily adjust portions (0.5x, 1x, 1.25x, 1.5x, 2x) with instant macro updates.
- **Custom Food Creator**: Allows clients to input any custom grocery item or supplement brand (e.g. *Fairlife Core Power*, *Trader Joe's Turkey Patties*).
- **1-Click US Presets**:
  - *US Executive Rapid Shred (1,850 kcal / 195g Protein)*
  - *Pro Hypertrophy & Muscle Mass (2,750 kcal / 220g Protein)*
  - *US Corporate High-Energy Recomp (2,250 kcal / 200g Protein)*
- **Print & PDF Export**: Instant 1-click export generating an official, branded printable diet protocol complete with client date, meal timetable, macro breakdown, and US grocery checklist.

---

### 2. 🔥 N24 BurnIQ - Activity Calorie Calculator ("Calculate Calories Burned")
- **Science-Backed MET Values**: Implements the official Compendium of Physical Activities formula:
  $$\text{Calories Burned} = \text{MET} \times \text{Weight (kg)} \times \left(\frac{\text{Duration (min)}}{60}\right) \times \text{Intensity Multiplier}$$
- **18+ High-Performance Disciplines**:
  - *Heavy Barbell Compound Squats/Deadlifts* (MET 6.5)
  - *Bodybuilding Hypertrophy Split* (MET 5.2)
  - *CrossFit MetCon WOD* (MET 8.5)
  - *US Viral 12-3-30 Incline Treadmill Walk* (MET 7.2)
  - *Outdoor / Treadmill Running (6.0 to 7.5+ mph)* (MET 9.8 - 11.8)
  - *HIIT Sprint Intervals* (MET 13.5)
  - *StairMaster Stepmill* (MET 9.0)
  - *Concept2 Rowing Machine* (MET 8.5)
  - *Speed Jump Rope* (MET 12.0)
  - *Heavy Bag Boxing Rounds* (MET 8.8)
  - *Lap Swimming* (MET 9.0)
  - *Power Vinyasa / Hot Yoga* (MET 4.2)
- **Instant Physiological Metrics**:
  - Active Calories Burned (kcal)
  - Body Fat Mass Oxidized ($oz$ and $grams$)
  - EPOC Excess Post-Exercise Oxygen Consumption (Afterburn bonus)
  - Average Burn Rate ($kcal/min$)
  - Target Heart Rate Training Zone (~BPM and % of Max HR)
- **Daily Workout Session Logger**: Log multiple exercises to accumulate total daily workout burn.

---

### 3. ⚖️ Real-Time Net Energy Balance
- Automatically compares calories consumed from the **Diet Builder** against calories expended in the **Burn Calculator**.
- Displays whether the client is in an *Accelerated Fat Shred Deficit*, *Optimal Body Recomposition*, or *Hypertrophy Mass Fueling Surplus*.

---

### 4. 🇺🇸 US-Centric Commercial Platform Features
- **Unit System Switcher**: Seamlessly toggles between **US Imperial** (`lbs`, `oz`, `ft/in`) and **Metric** (`kg`, `grams`, `cm`).
- **US Timezone Coaching Consultations**: Intake modal supporting Eastern (`EST`), Central (`CST`), Mountain (`MST`), and Pacific (`PST`) timezones.
- **US Client Transformations**: Case studies with verified metrics from Austin TX, Miami FL, Chicago IL, and Los Angeles CA.
- **Transparent USD Pricing**:
  - *N24 Core Platform*: \$49 / month
  - *Elite Transformation Coaching*: \$199 / month (Most Popular)
  - *VIP Executive Concierge*: \$399 / month
- **Certifications & Authority**: NASM, CSCS, and ISSN verified coaching standards.

---

## 🚀 How to Run the Website Locally

### Option 1: Direct Browser Launch (Zero Install)
You can simply double-click `index.html` or right-click and choose **Open with Google Chrome** / **Microsoft Edge** / **Brave**. Everything works right out of the box!

### Option 2: Using Node.js / npx
```bash
# Navigate to the project folder
cd c:\Users\Neetu\Desktop\N24

# Start local server
npm run serve
# Or
npx serve . -l 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Using Python
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Directory Structure
```text
N24/
├── assets/
│   └── images/
│       └── n24-logo.jpg          # Official N24 Fitness Logo
├── css/
│   └── custom.css               # Luxury gold & obsidian theme styles, print rules
├── js/
│   ├── app.js                   # Application coordinator, modal handlers, unit switcher
│   ├── calorie-calculator.js    # BurnIQ MET expenditure engine & workout logger
│   ├── data.js                  # US food database, exercise METs, presets & testimonials
│   └── diet-builder.js          # Interactive diet architect, TDEE calculator & PDF export
├── index.html                   # Flagship web platform experience
├── package.json                 # Project configuration & npm scripts
└── README.md                    # Platform documentation
```

---

## 🎨 Brand Identity
- **Logo**: Interlocking metallic titanium "N" with brushed gold "24" and barbell "FITNESS" insignia with tagline *"STRONGER • HEALTHIER • BETTER"*.
- **Palette**: Matte Carbon (`#060709`, `#0C0D12`), Brushed Gold (`#D4AF37`, `#F5D061`, `#FFE58F`), Titanium Silver (`#E2E8F0`, `#94A3B8`).
- **Typography**: `Bebas Neue` (Athletic Power Headers), `Cinzel` (Luxury Accents), `Montserrat` (Clean Modern UI), `Inter` (Data Readouts).

© 2026 N24 FITNESS LLC. All Rights Reserved.