// Translations
const translations = {
  en: {
    title_line1: "START",
    title_line2: "YOUR JOURNEY",
    subtitle: "Built for scale — discover how much you can earn with our projection tool",
    capital_label: "Capital (EUR)",
    capital_placeholder: "Enter your capital, for example 10 000",
    capital_range: "Capital range",
    monthly_fee: "Monthly fee",
    estimated_result: "Estimated monthly result*",
    capital_exposure: "capital exposure",
    adjust_risk: "Adjust risk level",
    risk_level: "Risk Level",
    recommended: "Recommended",
    high: "High",
    extreme: "Extreme",
    acknowledge_text: "I understand that 30% is the recommended level and increasing it will expose my capital to higher risk",
    warning_high: "High exposure — increased risk of drawdowns",
    warning_50: "Above 50%, the bot may skip some positions. Higher leverage means trades can diverge significantly. Proceed at your own risk.",
    warning_extreme: "Extreme risk — the bot may skip positions and high leverage can cause significant trade divergence. Proceed at your own risk.",
    cta_button: "Start 14-Day Free Trial",
    terms_text: "By starting your free trial, you agree to our",
    terms_tou: "Terms of Use",
    terms_tos: "Terms of Sale",
    terms_and: "and",
    terms_privacy: "Privacy Policy",
    disclaimer: "* Based on 7.11% average monthly performance at 30% risk level. Past performance does not guarantee future results.",
    error_invalid: "Please enter a valid amount.",
    error_min: "Minimum capital: 1 000 €",
    error_max: "Contact us for amounts above 250 000 €",
    nav_need_help: "Need Help?",
    loading_step1: "Redirecting you...",
    loading_step2: "Taking a bit longer...",
    loading_step3: "Almost there..."
  },
  fr: {
    title_line1: "DÉMARREZ",
    title_line2: "L'AVENTURE",
    subtitle: "Indiquez le montant avec lequel vous souhaitez démarrer, on s'occupe du reste.",
    capital_label: "Capital (EUR)",
    capital_placeholder: "Entrez votre capital, par exemple 10 000",
    capital_range: "Tranche de capital",
    monthly_fee: "Frais mensuel",
    estimated_result: "Résultat mensuel estimé*",
    capital_exposure: "exposition du capital",
    adjust_risk: "Ajuster le niveau de risque",
    risk_level: "Niveau de risque",
    recommended: "Recommandé",
    high: "Élevé",
    extreme: "Extrême",
    acknowledge_text: "Je comprends que 30% est le niveau recommandé et qu'augmenter ce niveau exposera mon capital à un risque plus élevé",
    warning_high: "Exposition élevée — risque accru de drawdowns",
    warning_50: "Au-dessus de 50%, le bot peut ignorer certaines positions. Un effet de levier plus élevé signifie que les trades peuvent diverger significativement. Procédez à vos propres risques.",
    warning_extreme: "Risque extrême — le bot peut ignorer des positions et un effet de levier élevé peut causer une divergence significative des trades. Procédez à vos propres risques.",
    cta_button: "Démarrer l'essai gratuit de 14 jours",
    terms_text: "En démarrant votre essai gratuit, vous acceptez nos",
    terms_tou: "CGU",
    terms_tos: "CGV",
    terms_and: "et notre",
    terms_privacy: "Politique de confidentialité",
    disclaimer: "* Basé sur une performance mensuelle moyenne de 7,11% au niveau de risque 30%. Les performances passées ne garantissent pas les résultats futurs.",
    error_invalid: "Veuillez entrer un montant valide.",
    error_min: "Capital minimum : 1 000 €",
    error_max: "Contactez-nous pour les montants supérieurs à 250 000 €",
    nav_need_help: "Besoin d'aide ?",
    loading_step1: "Nous vous redirigeons...",
    loading_step2: "C'est un rien long...",
    loading_step3: "Ça arrive bientôt..."
  }
};

// Detect browser language
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const lang = browserLang.substring(0, 2).toLowerCase();
  return translations[lang] ? lang : 'en';
}

// Get current language
let currentLang = detectLanguage();

// Get translation
function t(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

// Apply translations to DOM
function applyTranslations() {
  // Update document language
  document.documentElement.lang = currentLang;

  // Translate elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });
}

// Initialize translations on DOM ready
document.addEventListener('DOMContentLoaded', applyTranslations);
