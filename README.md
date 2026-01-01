# Javlot Checkout

A standalone checkout page for Javlot trading automation service.

## Features

- 📊 Dynamic pricing calculation based on trading capital
- 🎚️ Adjustable risk level slider (15% - 100%)
- 🌍 Automatic language detection (English/French)
- 💳 Stripe checkout integration
- 📱 Fully responsive design
- ⚡ No dependencies, vanilla JavaScript

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/javlot-pricing.git
cd javlot-pricing
```

### 2. Configure Stripe

Edit `js/pricing.js` and update the Stripe configuration:

```javascript
// Single payment link for all tiers
const STRIPE_BASE_URL = "https://buy.stripe.com/YOUR_STRIPE_LINK";

// Or configure tier-specific links
const STRIPE_TIER_LINKS = {
  1: "https://buy.stripe.com/link_for_tier_1",
  2: "https://buy.stripe.com/link_for_tier_2",
  // ... etc
};
```

### 3. Deploy

Deploy to GitHub Pages, Netlify, Vercel, or any static hosting:

**GitHub Pages:**
1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/ (root)` folder
4. Save

**Netlify/Vercel:**
Simply connect your repository and deploy.

## File Structure

```
javlot-pricing/
├── index.html          # Main HTML page
├── css/
│   └── style.css       # Styles
├── js/
│   ├── i18n.js         # Translations (EN/FR)
│   └── pricing.js      # Pricing logic & Stripe integration
└── README.md
```

## Pricing Tiers

| Capital Range | Tier | Monthly Fee |
|---------------|------|-------------|
| 1,000 - 1,999 € | 1 | 19.90 € |
| 2,000 - 2,999 € | 2 | 39.90 € |
| 3,000 - 3,999 € | 3 | 59.90 € |
| ... | ... | ... |
| 250,000+ € | - | Contact us |

**Formula:** `Monthly Fee = 19.90 + (tier - 1) × 20`

## Translations

The page automatically detects the browser language and displays content in:
- 🇬🇧 English (default)
- 🇫🇷 French

To add more languages, edit `js/i18n.js` and add a new translation object.

## Customization

### Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --color-green: #10b981;
  --color-yellow: #f59e0b;
  --color-red: #ef4444;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-bg: #f9fafb;
}
```

### Risk Warnings

Edit warning messages in `js/i18n.js`:

```javascript
warning_high: "High exposure — increased risk of drawdowns",
warning_50: "Above 50%, the bot may skip some positions...",
warning_extreme: "Extreme risk — the bot may skip positions..."
```

## License

MIT License - Javlot.io
