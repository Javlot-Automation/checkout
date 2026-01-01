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
  const riskMessage = document.getElementById("jp-risk-message");
  const ctaSection = document.getElementById("jp-cta-section");
  const ctaButton = document.getElementById("jp-cta-button");
  const termsCheckbox = document.getElementById("jp-terms-checkbox");

  // State
  let currentCapitalMin = 0;
  let currentTier = 0;
  let hasValidCapital = false;
  const basePerformance = 0.0711;

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

  // Update estimated result
  function updateEstimatedResult() {
    if (currentCapitalMin <= 0) return;

    // Hardcoded risk level 30%
    const riskPercent = 30;
    const multiplier = getRiskMultiplier(riskPercent);
    const estimatedMonthly = currentCapitalMin * basePerformance * multiplier;

    estimatedEl.textContent = "+" + formatEuroDecimal(estimatedMonthly) + " /month";
  }

  function hideResults() {
    resultBox.classList.remove("jp-visible");
    if (riskMessage) riskMessage.classList.remove("jp-visible");
    disclaimerEl.classList.remove("jp-visible");
    ctaSection.classList.remove("jp-visible");
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
    if (riskMessage) riskMessage.classList.add("jp-visible");
    disclaimerEl.classList.add("jp-visible");
    ctaSection.classList.add("jp-visible");
    hasValidCapital = true;
    updateCTAState();
    msg.textContent = "";

    updateEstimatedResult();
  }

  // CTA button click - redirect to Stripe via Lambda
  async function handleCTAClick() {
    if (currentTier <= 0) return;
    if (ctaButton.disabled) return;

    // Loading state
    ctaButton.disabled = true;

    // We assume the initial text is in a visible span or we wrap it now
    // If the button has just text, clear it and add a span
    const initialText = ctaButton.innerText;
    // Clear button content and add distinct span for initial text
    ctaButton.innerHTML = "";
    let currentSpan = document.createElement("span");
    currentSpan.className = "jp-cta-text active";
    currentSpan.textContent = initialText;
    ctaButton.appendChild(currentSpan);

    // Helpers for animation
    let step = 1;
    function updateLoadingText() {
      const nextText = t(`loading_step${step}`);

      // Create new span entering from bottom
      const nextSpan = document.createElement("span");
      nextSpan.className = "jp-cta-text enter";
      nextSpan.textContent = nextText;
      ctaButton.appendChild(nextSpan);

      // Force reflow to ensure start position is applied
      void nextSpan.offsetWidth;

      requestAnimationFrame(() => {
        currentSpan.classList.remove("active");
        currentSpan.classList.add("exit");

        nextSpan.classList.remove("enter");
        nextSpan.classList.add("active");
      });

      // Cleanup old span after animation
      setTimeout(() => {
        if (currentSpan && currentSpan.parentNode === ctaButton) {
          ctaButton.removeChild(currentSpan);
        }
        currentSpan = nextSpan;
      }, 500); // matches CSS transition duration

      step++;
      if (step > 3) step = 1;
    }

    // Initial transition to first loading message
    updateLoadingText();

    // Cycle every 3 seconds
    const loadingInterval = setInterval(updateLoadingText, 3000);

    try {
      const payload = {
        tier: currentTier,
        balance: currentCapitalMin, // API expects 'balance'
        // Calculate the fee again just in case or grab from context if needed. 
        // The Monthly Fee logic: 19.90 + (tier - 1) * 20
        monthlyFee: 19.90 + (currentTier - 1) * 20,
        riskLevel: 30
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
        clearInterval(loadingInterval); // Stop cycling clearly before redirect
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error) {
      clearInterval(loadingInterval); // Stop cycling on error
      console.error("Checkout error:", error);
      alert(`Error: ${error.message}`); // Show specific error to user

      // Reset button state
      ctaButton.disabled = false;
      ctaButton.querySelector("span").textContent = t("cta_button");
    }
  }

  // Event listeners
  if (input) {
    input.addEventListener("input", updatePricing);
    input.value = "1000";
    updatePricing();
  }



  if (ctaButton) {
    ctaButton.addEventListener("click", handleCTAClick);
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", updateCTAState);
  }
});
