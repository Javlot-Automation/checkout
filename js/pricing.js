// Configuration - AWS Lambda Endpoints
const API_BASE_URL = "https://bdpzmvhvl4.execute-api.us-west-2.amazonaws.com/Prod";
const CREATE_CHECKOUT_ENDPOINT = `${API_BASE_URL}/create-checkout`;

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

  // CTA button click - redirect to Stripe via Lambda
  async function handleCTAClick() {
    if (currentTier <= 0) return;
    if (ctaButton.disabled) return;

    // Loading state
    const originalText = ctaButton.querySelector("span").innerText;
    ctaButton.disabled = true;
    ctaButton.querySelector("span").innerText = "Loading..."; // Simple loading text
    // Ideally we would use a translation key here, but for now hardcoded or reused is expected?
    // Let's stick effectively to "Wait..." or similar if no key exists. 
    // Actually, I'll keep it simple.

    try {
      const payload = {
        tier: currentTier,
        balance: currentCapitalMin, // API expects 'balance'
        // Calculate the fee again just in case or grab from context if needed. 
        // The Monthly Fee logic: 19.90 + (tier - 1) * 20
        monthlyFee: 19.90 + (currentTier - 1) * 20,
        riskLevel: parseInt(riskSlider.value)
      };

      const response = await fetch(CREATE_CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Try to read error message from JSON if available
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {
          // ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Error: ${error.message}`); // Show specific error to user

      // Reset button state
      ctaButton.disabled = false;
      // Re-apply translation or original text
      // Since we don't have a reliable way to get the original translation text easily without re-running `t()`, 
      // let's try to fetch it again or just reload the page/state. 
      // Actually, t() is available globally as seen in updateRiskUI.
      ctaButton.querySelector("span").textContent = t("cta_button");
    }
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
    riskSlider.addEventListener("input", function () {
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
