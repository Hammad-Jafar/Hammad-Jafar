/* ============================================================
   MODAL UI
   Handles modal DOM, messages, button text and reset behavior.
   ============================================================ */

export function formatMoney(cents) {
  const amount = Number(cents) / 100;

  let currency = "USD";

  if (
    window.Shopify &&
    Shopify.currency &&
    Shopify.currency.active
  ) {
    currency = Shopify.currency.active;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency
  }).format(amount);
}

export function setAddToCartText(button, text) {
  if (!button) return;

  const spans = button.querySelectorAll("span");

  if (spans.length > 1) {
    spans[spans.length - 1].textContent = text;
  } else {
    button.textContent = text;
  }
}

export function showMessage(messageElement, text, isError) {
  if (!messageElement) return;

  messageElement.textContent = text;
  messageElement.style.display = "block";
  messageElement.style.color = isError
    ? "#b00020"
    : "#008000";
}

export function resetColorSelection(colorContainer, colorSlider) {
  if (colorContainer) {
    colorContainer
      .querySelectorAll(".custom-color-option")
      .forEach(function (button) {
        button.classList.remove("active");
      });
  }

  resetColorSlider(colorSlider);
}

export function resetColorSlider(colorSlider) {
  if (!colorSlider) return;

  colorSlider.style.width = "0px";
  colorSlider.style.transform = "translateX(0px)";
}

export function resetSizeSelection(sizeSelect) {
  if (!sizeSelect) return;

  sizeSelect.value = "";
}

export function moveColorSlider(
  button,
  colorContainer,
  colorSlider
) {
  if (!button || !colorContainer || !colorSlider) return;

  const buttonRect = button.getBoundingClientRect();
  const containerRect = colorContainer.getBoundingClientRect();

  const left =
    buttonRect.left - containerRect.left;

  colorSlider.style.width =
    `${buttonRect.width}px`;

  colorSlider.style.transform =
    `translateX(${left}px)`;
}

export function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("is-active");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  const sizeSelect =
    modal.querySelector(".custom-modal-size-select");

  if (sizeSelect) {
    sizeSelect.value = "";
  }

  const colorContainer =
    modal.querySelector(".custom-modal-colors");

  if (colorContainer) {
    colorContainer
      .querySelectorAll(".custom-color-option")
      .forEach(function (button) {
        button.classList.remove("active");
      });
  }

  const colorSlider =
    modal.querySelector(".custom-color-slider");

  resetColorSlider(colorSlider);
}
