// Configuration - UPDATE THIS WITH YOUR STRIPE PAYMENT LINK
const STRIPE_BASE_URL = "https://buy.stripe.com/YOUR_STRIPE_LINK";

// You can also configure tier-specific Stripe links if needed
const STRIPE_TIER_LINKS = {
  // tier: "stripe_link"
  // Example: 1: "https://buy.stripe.com/link_for_tier_1",
};

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const input = document.getElementById("jp-capital-input");
  const resultBox = document.getElementById("jp-result");
  const msg = document.getElementById("jp-message");
  const capitalRangeEl = document.getElementById("jp-capital-range");
  const monthlyFeeEl = document.getElementById("jp-monthly-fee");
  const estimatedEl = document.getElementById("jp-estimated");
  const exposureTextEl = document.getElementById("jp-exposure-text");
  const disclaimerEl = document.getElementById("jp-disclaimer");
  const riskToggle = document.getElementById("jp-risk-toggle");
  const riskToggleBtn = document.getElementById("jp-risk-toggle-btn");
  const riskSection = document.getElementById("jp-risk-section");
  const riskSlider = document.getElementById("jp-risk-slider");
  const riskValueEl = document.getElementById("jp-risk-value");
  const riskBadge = document.getElementById("jp-risk-badge");
  const sliderFill = document.getElementById("jp-slider-fill");
  const sliderThumb = document.getElementById("jp-slider-thumb");
  const sliderWrapper = document.getElementById("jp-slider-wrapper");
  const acknowledgeCheckbox = document.getElementById("jp-acknowledge-checkbox");
  const riskWarning = document.getElementById("jp-risk-warning");
  const warningText = document.getElementById("jp-warning-text");
  const ctaSection = document.getElementById("jp-cta-section");
  const ctaButton = document.getElementById("jp-cta-button");
  const termsCheckbox = document.getElementById("jp-terms-checkbox");

  // State
  let currentCapitalMin = 0;
  let currentTier = 0;
  let hasValidCapital = false;
  const basePerformance = 0.0711;
  let riskPanelOpen = false;

  // Update CTA button state
  function updateCTAState() {
    ctaButton.disabled = !(hasValidCapital && termsCheckbox && termsCheckbox.checked);
  }

  // Format helpers
  function formatEuro(value) {
    if (isNaN(value)) return "";
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + " €";
  }

  function formatEuroDecimal(value) {
    if (isNaN(value)) return "";
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " €";
  }

  function getRiskMultiplier(riskPercent) {
    if (riskPercent <= 30) {
      return 0.5 + ((riskPercent - 15) / 15) * 0.5;
    } else {
      return 1 + ((riskPercent - 30) / 70) * 2.33;
    }
  }

  // Risk panel toggle
  function toggleRiskPanel() {
    riskPanelOpen = !riskPanelOpen;
    
    if (riskPanelOpen) {
      riskToggleBtn.classList.add("jp-active");
      riskSection.classList.add("jp-visible");
      updateToggleBorderColor();
    } else {
      riskToggleBtn.classList.remove("jp-active");
      riskSection.classList.remove("jp-visible");
      riskToggleBtn.style.borderColor = "";
    }
  }

  function updateToggleBorderColor() {
    if (!riskPanelOpen) return;
    
    const riskPercent = parseInt(riskSlider.value);
    if (riskPercent <= 30) {
      riskToggleBtn.style.borderColor = "";
    } else if (riskPercent <= 60) {
      riskToggleBtn.style.borderColor = "var(--color-yellow)";
    } else {
      riskToggleBtn.style.borderColor = "var(--color-red)";
    }
  }

  // Acknowledge checkbox handler
  function handleAcknowledge() {
    if (acknowledgeCheckbox.checked) {
      sliderWrapper.classList.remove("jp-slider-disabled");
      riskSlider.disabled = false;
    } else {
      sliderWrapper.classList.add("jp-slider-disabled");
      riskSlider.disabled = true;
      riskSlider.value = 30;
      updateRiskUI(30);
    }
  }

  // Update risk UI
  function updateRiskUI(riskPercent) {
    riskValueEl.textContent = riskPercent + "%";
    exposureTextEl.textContent = riskPercent + "%";
    
    const fillPercent = ((riskPercent - 15) / 85) * 100;
    sliderFill.style.width = fillPercent + "%";
    sliderThumb.style.left = fillPercent + "%";
    
    // Reset classes
    riskSection.classList.remove("jp-state-green", "jp-state-yellow", "jp-state-red", "jp-border-warning", "jp-border-danger");
    riskBadge.classList.remove("jp-badge-warning", "jp-badge-danger");
    riskWarning.classList.remove("jp-visible", "jp-warning-danger");
    estimatedEl.classList.remove("jp-result-green", "jp-result-yellow", "jp-result-red");
    
    let stateClass, badgeText, showWarning = false, dangerWarning = false, resultColorClass;
    
    if (riskPercent <= 30) {
      stateClass = "jp-state-green";
      badgeText = t("recommended");
      resultColorClass = "jp-result-green";
    } else if (riskPercent <= 60) {
      stateClass = "jp-state-yellow";
      badgeText = t("high");
      resultColorClass = "jp-result-yellow";
      riskBadge.classList.add("jp-badge-warning");
      riskSection.classList.add("jp-border-warning");
      showWarning = true;
      if (riskPercent > 50) {
        warningText.textContent = t("warning_50");
      } else {
        warningText.textContent = t("warning_high");
      }
    } else {
      stateClass = "jp-state-red";
      badgeText = t("extreme");
      resultColorClass = "jp-result-red";
      riskBadge.classList.add("jp-badge-danger");
      riskSection.classList.add("jp-border-danger");
      showWarning = true;
      dangerWarning = true;
      warningText.textContent = t("warning_extreme");
    }
    
    riskSection.classList.add(stateClass);
    riskBadge.textContent = badgeText;
    estimatedEl.classList.add(resultColorClass);
    
    if (showWarning) {
      riskWarning.classList.add("jp-visible");
      if (dangerWarning) {
        riskWarning.classList.add("jp-warning-danger");
      }
    }
    
    updateToggleBorderColor();
    updateEstimatedResult();
  }

  // Update estimated result
  function updateEstimatedResult() {
    if (currentCapitalMin <= 0) return;
    
    const riskPercent = parseInt(riskSlider.value);
    const multiplier = getRiskMultiplier(riskPercent);
    const estimatedMonthly = currentCapitalMin * basePerformance * multiplier;
    
    estimatedEl.textContent = "+" + formatEuroDecimal(estimatedMonthly) + " /month";
  }

  // Hide all results
  function hideResults() {
    resultBox.classList.remove("jp-visible");
    riskToggle.classList.remove("jp-visible");
    riskSection.classList.remove("jp-visible");
    disclaimerEl.classList.remove("jp-visible");
    ctaSection.classList.remove("jp-visible");
    riskToggleBtn.classList.remove("jp-active");
    riskToggleBtn.style.borderColor = "";
    riskPanelOpen = false;
    currentCapitalMin = 0;
    currentTier = 0;
    hasValidCapital = false;
    updateCTAState();
  }

  // Main pricing update
  function updatePricing() {
    let raw = input.value || "";
    raw = raw.replace(/\s/g, "").replace(/,/g, ".");

    if (raw === "") {
      hideResults();
      msg.textContent = "";
      return;
    }

    const capital = parseFloat(raw);

    if (isNaN(capital) || capital <= 0) {
      hideResults();
      msg.textContent = t("error_invalid");
      return;
    }

    if (capital < 1000) {
      hideResults();
      msg.textContent = t("error_min");
      return;
    }

    if (capital > 250000) {
      hideResults();
      msg.textContent = t("error_max");
      return;
    }

    let tier = Math.floor(capital / 1000);
    if (tier < 1) tier = 1;
    if (tier > 250) tier = 250;

    const capitalMin = tier * 1000;
    const capitalMax = capitalMin + 999;
    const monthlyFee = 19.90 + (tier - 1) * 20;

    currentCapitalMin = capitalMin;
    currentTier = tier;

    capitalRangeEl.textContent = formatEuro(capitalMin) + " – " + formatEuro(capitalMax);
    monthlyFeeEl.textContent = formatEuroDecimal(monthlyFee) + " /month";

    resultBox.classList.add("jp-visible");
    riskToggle.classList.add("jp-visible");
    disclaimerEl.classList.add("jp-visible");
    ctaSection.classList.add("jp-visible");
    hasValidCapital = true;
    updateCTAState();
    msg.textContent = "";

    updateRiskUI(parseInt(riskSlider.value));
  }

  // CTA button click - redirect to Stripe
  function handleCTAClick() {
    if (currentTier <= 0) return;
    
    // Check for tier-specific link first
    let stripeUrl = STRIPE_TIER_LINKS[currentTier] || STRIPE_BASE_URL;
    
    // You can append query parameters if needed
    // Example: stripeUrl += `?prefilled_promo_code=TRIAL14&client_reference_id=tier_${currentTier}`;
    
    window.location.href = stripeUrl;
  }

  // Event listeners
  if (input) {
    input.addEventListener("input", updatePricing);
    input.value = "10000";
    updatePricing();
  }

  if (riskToggleBtn) {
    riskToggleBtn.addEventListener("click", toggleRiskPanel);
  }

  if (acknowledgeCheckbox) {
    acknowledgeCheckbox.addEventListener("change", handleAcknowledge);
  }

  if (riskSlider) {
    riskSlider.addEventListener("input", function() {
      updateRiskUI(parseInt(this.value));
    });
    updateRiskUI(30);
  }

  if (ctaButton) {
    ctaButton.addEventListener("click", handleCTAClick);
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", updateCTAState);
  }
});
