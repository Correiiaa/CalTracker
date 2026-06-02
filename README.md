# CalTracker

**CalTracker** is a modern, full-stack web platform for intelligent meal and calorie tracking. Built with a cutting-edge tech stack and integrated with Google Gemini AI, it offers a seamless experience for anyone looking to take control of their diet — whether you weigh everything precisely or prefer to log items by unit.

---

## ✨ Features

### 🤖 AI-Powered Meal Analysis
Upload a photo of your meal and let Google Gemini 1.5 Flash do the work. The AI identifies the foods in the image, estimates portions, and directly calculates the caloric and macronutrient breakdown — no external API lookups required. Just snap, upload, and add.

### 🍽️ Flexible Food Logging
Log meals your way:
- **By weight (g):** Enter grams and the platform scales macros proportionally.
- **By unit (un):** Log discrete items like a chocolate bar, an ice cream, or a piece of fruit by unit — no need to weigh everything.

Both modes store normalized nutritional data (per 100 g or per 1 unit) for consistent comparison and history.

### 🔍 Unified Food Search with 3 Tabs
The food search panel offers three distinct tabs:
- **History** — your recently logged foods, instantly available.
- **Community** — foods shared by other users across the platform, auto-populated even without a search query.
- **Presets** — a built-in library of common foods provided by the app.

The search bar filters all tabs in real time with a 300 ms debounce, keeping the experience snappy and responsive.

### 🌍 Community Food Database
Every time a user adds a new food manually, it is normalized and saved to a shared global database. This means the community grows over time — foods logged by one user become discoverable by all others, building a collaborative nutritional database without any manual curation.

### 📊 Dynamic Dashboard
The dashboard gives a real-time overview of:
- **Daily calorie ring** — a circular progress indicator showing calories consumed vs. daily target.
- **Macronutrient bars** — live progress bars for protein, carbohydrates, and fat against personalized targets calculated from the user's biometrics.
- **Today's meals** — a list of all logged meals with per-meal macros and quick edit access.

### ⚖️ Weekly Weight Check-In
Once a week (7 days since registration or last check-in), the dashboard automatically presents a premium modal prompting the user to log their current weight. The modal:
- Shows a trend indicator (e.g., *−0.8 kg since last week*) with a directional icon.
- Recalculates the daily calorie target immediately using the Harris-Benedict formula when the weight is updated.
- Can be dismissed for 24 hours without losing the weekly tracking cycle.

### 🔄 Dynamic Metabolic Analysis
Calorie and macronutrient targets are never static. Whenever the user updates their weight — either via the weekly check-in or the profile page — the platform recalculates their Basal Metabolic Rate (BMR) and daily calorie goal using the **Harris-Benedict equation** adjusted for moderate activity, with goal-based offsets:
- **Lose weight:** −500 kcal deficit
- **Maintain weight:** maintenance calories
- **Gain weight:** +350 kcal surplus

### ✏️ Full Meal Edit & History
All meals logged for the current day are fully editable — adjust food names, quantities, and portions on the fly. A dedicated history page provides a chronological log of all past meals.

### 👤 User Profile & Custom Goals
Users can configure their full biometric profile (weight, height, age, gender, goal) and either let the platform calculate their calorie target automatically or set a custom manual goal.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database ORM | [Prisma](https://prisma.io) |
| Database | Neon PostgreSQL (serverless) |
| AI | Google Gemini 1.5 Flash |
| Authentication | JWT (HTTP-only cookies) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A Google Gemini API key

### Environment Variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL=your_neon_postgres_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_secret_key
```

---

## 📁 Project Structure

```
CalTracker/
├── app/
│   ├── (dashboard)/        # Authenticated pages (dashboard, meals, profile, history)
│   ├── api/                # API routes (auth, meals, foods, profile, weight-checkin)
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/             # Reusable UI components (MealForm, WeightCheckInModal, etc.)
├── lib/                    # Utilities (auth, prisma client, nutrition AI, shared foods)
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

---

## 📄 License

This project is for personal and educational use.
