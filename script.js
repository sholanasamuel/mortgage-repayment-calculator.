const mortgageForm = document.querySelector("#mortgage-form");
const amountInput = document.querySelector("#mortgage-amount");
const termInput = document.querySelector("#mortgage-term");
const rateInput = document.querySelector("#interest-rate");
const clearButton = document.querySelector("#clear-all");
const emptyResults = document.querySelector("#empty-results");
const completedResults = document.querySelector("#completed-results");
const monthlyOutput = document.querySelector("#monthly-repayment");
const totalOutput = document.querySelector("#total-repayment");

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function showError(input, message) {
  const field = input.closest(".field");
  field.classList.add("has-error");
  input.setAttribute("aria-invalid", "true");
  document.querySelector(`#${input.id.replace("mortgage-", "").replace("interest-", "")}-error`).textContent = message;
}

function clearFieldError(input) {
  const field = input.closest(".field");
  field.classList.remove("has-error");
  input.removeAttribute("aria-invalid");
  const error = field.querySelector(".error-message");
  if (error) error.textContent = "";
}

function validateForm() {
  let valid = true;

  [amountInput, termInput, rateInput].forEach(clearFieldError);
  const typeField = document.querySelector("#type-field");
  typeField.classList.remove("has-error");
  document.querySelector("#type-error").textContent = "";

  if (amountInput.value.trim() === "" || Number(amountInput.value) <= 0) {
    showError(amountInput, amountInput.value.trim() === "" ? "This field is required" : "Enter an amount greater than zero");
    valid = false;
  }

  if (termInput.value.trim() === "" || Number(termInput.value) <= 0 || !Number.isInteger(Number(termInput.value))) {
    showError(termInput, termInput.value.trim() === "" ? "This field is required" : "Enter a valid number of years");
    valid = false;
  }

  if (rateInput.value.trim() === "" || Number(rateInput.value) < 0) {
    showError(rateInput, rateInput.value.trim() === "" ? "This field is required" : "Interest rate cannot be negative");
    valid = false;
  }

  const selectedType = document.querySelector('input[name="mortgage-type"]:checked');
  if (!selectedType) {
    typeField.classList.add("has-error");
    document.querySelector("#type-error").textContent = "This field is required";
    valid = false;
  }

  return valid;
}

function calculateMortgage(principal, annualRate, years, type) {
  const numberOfPayments = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (type === "interest-only") {
    const monthlyInterest = principal * monthlyRate;
    return {
      monthly: monthlyInterest,
      total: monthlyInterest * numberOfPayments + principal,
    };
  }

  // When the interest rate is 0%, divide the principal evenly across payments.
  if (monthlyRate === 0) {
    const monthly = principal / numberOfPayments;
    return { monthly, total: principal };
  }

  const growth = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthly = principal * (monthlyRate * growth) / (growth - 1);
  return { monthly, total: monthly * numberOfPayments };
}

mortgageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) {
    completedResults.hidden = true;
    emptyResults.hidden = false;
    return;
  }

  const amount = Number(amountInput.value);
  const years = Number(termInput.value);
  const rate = Number(rateInput.value);
  const type = document.querySelector('input[name="mortgage-type"]:checked').value;
  const result = calculateMortgage(amount, rate, years, type);

  monthlyOutput.textContent = currency.format(result.monthly);
  totalOutput.textContent = currency.format(result.total);
  emptyResults.hidden = true;
  completedResults.hidden = false;
});

[amountInput, termInput, rateInput].forEach((input) => {
  input.addEventListener("input", () => clearFieldError(input));
});

document.querySelectorAll('input[name="mortgage-type"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelector("#type-field").classList.remove("has-error");
    document.querySelector("#type-error").textContent = "";
  });
});

clearButton.addEventListener("click", () => {
  mortgageForm.reset();
  [amountInput, termInput, rateInput].forEach(clearFieldError);
  document.querySelector("#type-field").classList.remove("has-error");
  document.querySelector("#type-error").textContent = "";
  completedResults.hidden = true;
  emptyResults.hidden = false;
  monthlyOutput.textContent = currency.format(0);
  totalOutput.textContent = currency.format(0);
  amountInput.focus();
});
