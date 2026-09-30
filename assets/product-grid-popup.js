import { fetchProduct } from "./product-api.js";

import {
findOptionIndex,
isColorAvailable,
isSizeAvailable
} from "./variant-manager.js";

import {
addItemsToCart,
fetchAccessoryVariant,
refreshCart
} from "./cart.js";

import {
formatMoney,
setAddToCartText,
showMessage,
resetColorSelection,
resetColorSlider,
resetSizeSelection,
moveColorSlider,
closeModal as closeModalUI
} from "./modal-ui.js";

console.log("PRODUCT GRID POPUP JS LOADED");

/* ============================================================
MAIN INITIALIZATION
============================================================ */

function initializeProductPopup() {

const modals =
document.querySelectorAll(
".custom-product-modal"
);

if (!modals.length) {


console.warn(
  "PRODUCT MODAL NOT FOUND"
);

return;


}

modals.forEach(function (modal) {


if (
  modal.dataset.initialized === "true"
) {
  return;
}

modal.dataset.initialized = "true";


/* ========================================================
   DOM ELEMENTS
======================================================== */

const closeButton =
  modal.querySelector(
    ".custom-product-modal-close"
  );

const modalImage =
  modal.querySelector(
    ".custom-modal-image"
  );

const modalTitle =
  modal.querySelector(
    ".custom-modal-title"
  );

const modalPrice =
  modal.querySelector(
    ".custom-modal-price"
  );

const modalDescription =
  modal.querySelector(
    ".custom-modal-description"
  );

const colorWrapper =
  modal.querySelector(
    ".custom-modal-color-wrapper"
  );

const colorContainer =
  modal.querySelector(
    ".custom-modal-colors"
  );

const colorSlider =
  modal.querySelector(
    ".custom-color-slider"
  );

const sizeWrapper =
  modal.querySelector(
    ".custom-modal-size-wrapper"
  );

const sizeSelect =
  modal.querySelector(
    ".custom-modal-size-select"
  );

const addToCartButton =
  modal.querySelector(
    ".custom-modal-add-to-cart"
  );

const message =
  modal.querySelector(
    ".custom-modal-message"
  );


/* ========================================================
   SIZE ARROW
======================================================== */

if (sizeSelect) {

  const wrapper =
    sizeSelect.parentElement;

  if (
    wrapper &&
    !wrapper.querySelector(
      ".custom-modal-size-arrow"
    )
  ) {

    const arrow =
      document.createElement(
        "div"
      );

    arrow.className =
      "custom-modal-size-arrow";

    arrow.innerHTML =
      "⌄";

    wrapper.appendChild(
      arrow
    );
  }
}


if (!addToCartButton) {

  console.warn(
    "ADD TO CART BUTTON NOT FOUND"
  );

  return;
}


/* ========================================================
   CURRENT PRODUCT STATE
======================================================== */

let currentProduct = null;

let currentVariants = [];

let selectedOptions = [];

let selectedVariant = null;


/*
  Prevent automatic Black + M logic
  from firing multiple times.
*/

let automaticAccessoryAdding =
  false;

let automaticAddedVariantId =
  null;


const sectionId =
  modal.id.replace(
    "modal-",
    ""
  );


let openButtons =
  document.querySelectorAll(
    "#product-grid-" +
    sectionId +
    " .custom-product-open"
  );


if (!openButtons.length) {

  openButtons =
    document.querySelectorAll(
      ".custom-product-open"
    );
}


/* ========================================================
   SUCCESS MESSAGE
======================================================== */

function showSuccessMessage() {

if (!message) {
console.warn("SUCCESS MESSAGE ELEMENT NOT FOUND");
return;
}

message.textContent =
"Added to cart successfully!";

message.classList.remove(
"error"
);

message.classList.add(
"success"
);

message.style.display =
"block";

message.style.visibility =
"visible";

message.style.opacity =
"1";

message.style.color =
"#008000";

message.style.fontWeight =
"600";

message.style.fontSize =
"16px";

message.style.marginTop =
"10px";

console.log(
"SUCCESS MESSAGE DISPLAYED ON FRONTEND"
);
}



/* ========================================================
   RESET UI
======================================================== */

function resetUI() {

  if (message) {

    message.textContent =
      "";

    message.style.display =
      "none";

    message.classList.remove(
      "success",
      "error"
    );

    message.style.color =
      "";
  }


  if (modalTitle) {

    modalTitle.textContent =
      "";
  }


  if (modalPrice) {

    modalPrice.textContent =
      "";
  }


  if (modalDescription) {

    modalDescription.innerHTML =
      "";
  }


  addToCartButton.disabled =
    true;


  setAddToCartText(
    addToCartButton,
    "Add to Cart"
  );
}


/* ========================================================
   RESET SELECTIONS
======================================================== */

function resetSelections() {

  console.log(
    "RESETTING VARIANT SELECTIONS"
  );


  selectedOptions =
    [];

  selectedVariant =
    null;


  automaticAccessoryAdding =
    false;

  automaticAddedVariantId =
    null;


  resetColorSelection(
    colorContainer,
    colorSlider
  );


  resetSizeSelection(
    sizeSelect
  );


  if (sizeSelect) {

    sizeSelect.value =
      "";
  }


  if (colorContainer) {

    colorContainer
      .querySelectorAll(
        ".custom-color-option"
      )
      .forEach(
        function (button) {

          button.classList.remove(
            "active"
          );
        }
      );
  }


  addToCartButton.disabled =
    true;


  setAddToCartText(
    addToCartButton,
    "Add to Cart"
  );


  console.log(
    "RESET COMPLETE:",
    selectedOptions,
    selectedVariant
  );
}


/* ========================================================
   OPEN PRODUCT
======================================================== */

async function openProduct(
  handle
) {

  console.log(
    "OPEN PRODUCT:",
    handle
  );


  currentProduct =
    null;

  currentVariants =
    [];

  selectedOptions =
    [];

  selectedVariant =
    null;

  automaticAccessoryAdding =
    false;

  automaticAddedVariantId =
    null;


  resetUI();


  if (colorContainer) {

    colorContainer.innerHTML =
      "";
  }


  if (sizeSelect) {

    sizeSelect.innerHTML =
      '<option value="">Select Size</option>';

    sizeSelect.value =
      "";
  }


  modal.classList.add(
    "is-active"
  );

  modal.style.display =
    "flex";

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";


  try {

    const product =
      await fetchProduct(
        handle
      );


    console.log(
      "PRODUCT:",
      product
    );


    console.log(
      "PRODUCT OPTIONS:",
      product.options
    );


    console.table(
      product.variants
    );


    currentProduct =
      product;


    currentVariants =
      product.variants || [];


    renderProduct(
      product
    );


    renderOptions(
      product
    );

  } catch (error) {

    console.error(
      "PRODUCT MODAL ERROR:",
      error
    );


    showMessage(
      message,
      "Unable to load this product.",
      true
    );
  }
}


/* ========================================================
   RENDER PRODUCT
======================================================== */

function renderProduct(
  product
) {

  if (modalTitle) {

    modalTitle.textContent =
      product.title || "";
  }


  if (modalPrice) {

    modalPrice.textContent =
      formatMoney(
        product.price
      );
  }


  if (modalDescription) {

    modalDescription.innerHTML =
      product.description || "";
  }


  if (
    modalImage &&
    product.featured_image
  ) {

    modalImage.src =
      product.featured_image;

    modalImage.alt =
      product.title || "";
  }
}


/* ========================================================
   RENDER OPTIONS
======================================================== */

function renderOptions(
  product
) {

  selectedOptions =
    [];

  selectedVariant =
    null;


  const options =
    product.options || [];


  const variants =
    product.variants || [];


  const colorIndex =
    findOptionIndex(
      product,
      "color"
    );


  const sizeIndex =
    findOptionIndex(
      product,
      "size"
    );


  console.log(
    "COLOR INDEX:",
    colorIndex
  );


  console.log(
    "SIZE INDEX:",
    sizeIndex
  );


  /* ======================================================
     COLORS
  ====================================================== */

  if (colorContainer) {

    colorContainer.innerHTML =
      "";
  }


  if (
    colorIndex !== -1
  ) {

    if (colorWrapper) {

      colorWrapper.style.display =
        "block";
    }


    const colors =
      options[colorIndex]
        .values || [];


    colors.forEach(
      function (color) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "custom-color-option";


        button.dataset.color =
          color;


        button.textContent =
          color;


        const available =
          isColorAvailable(
            variants,
            colorIndex,
            color,
            [],
            sizeIndex
          );


        button.disabled =
          !available;


        button.classList.toggle(
          "unavailable",
          !available
        );


        /* ==================================================
           COLOR CLICK
        ================================================== */

        button.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            event.stopPropagation();


            console.log(
              "COLOR CLICKED:",
              color
            );


            selectedOptions[
              colorIndex
            ] = color;


            colorContainer
              .querySelectorAll(
                ".custom-color-option"
              )
              .forEach(
                function (item) {

                  item.classList.remove(
                    "active"
                  );
                }
              );


            button.classList.add(
              "active"
            );


            moveColorSlider(
              button,
              colorContainer,
              colorSlider
            );


            renderSizes();


            validateSelectedSize();


            updateDynamicColors();


            updateVariant();
          }
        );


        colorContainer.appendChild(
          button
        );
      }
    );

  } else {

    if (colorWrapper) {

      colorWrapper.style.display =
        "none";
    }
  }


  /* ======================================================
     SIZES
  ====================================================== */

  if (
    sizeIndex !== -1
  ) {

    if (sizeWrapper) {

      sizeWrapper.style.display =
        "block";
    }


    renderSizes();


    if (sizeSelect) {

      sizeSelect.onchange =
        function () {

          console.log(
            "SIZE CHANGED:",
            this.value
          );


          if (
            this.value === ""
          ) {

            delete selectedOptions[
              sizeIndex
            ];


            selectedVariant =
              null;


            automaticAddedVariantId =
              null;


            addToCartButton.disabled =
              true;


            setAddToCartText(
              addToCartButton,
              "Add to Cart"
            );


            updateDynamicColors();


            updateVariant();


            return;
          }


          selectedOptions[
            sizeIndex
          ] = this.value;


          console.log(
            "SIZE SELECTED:",
            this.value
          );


          updateDynamicColors();


          updateVariant();
        };
    }

  } else {

    if (sizeWrapper) {

      sizeWrapper.style.display =
        "none";
    }
  }


  /*
    IMPORTANT:
    This resets the selections after rendering
    so nothing is preselected.
  */

  resetSelections();
}


/* ========================================================
   RENDER SIZES
======================================================== */

function renderSizes() {

  if (
    !sizeSelect ||
    !currentProduct
  ) {
    return;
  }


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  if (
    sizeIndex === -1
  ) {
    return;
  }


  const sizes =
    currentProduct
      .options[sizeIndex]
      .values || [];


  sizeSelect.innerHTML =
    '<option value="">Select Size</option>';


  sizes.forEach(
    function (size) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        size;


      option.textContent =
        size;


      const available =
        isSizeAvailable(
          currentVariants,
          sizeIndex,
          size,
          selectedOptions,
          colorIndex
        );


      option.disabled =
        !available;


      sizeSelect.appendChild(
        option
      );
    }
  );


  /*
    Do NOT automatically select
    the first available size.
  */

  sizeSelect.value =
    "";


  if (
    !selectedOptions[sizeIndex]
  ) {
    selectedVariant =
      null;
  }
}


/* ========================================================
   VALIDATE SELECTED SIZE
======================================================== */

function validateSelectedSize() {

  if (!currentProduct) {
    return;
  }


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  if (
    sizeIndex === -1
  ) {
    return;
  }


  const selectedSize =
    selectedOptions[
      sizeIndex
    ];


  if (!selectedSize) {
    return;
  }


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  const selectedColor =
    colorIndex !== -1
      ? selectedOptions[
          colorIndex
        ]
      : null;


  const valid =
    currentVariants.some(
      function (variant) {

        if (
          !variant.available
        ) {
          return false;
        }


        if (
          variant.options[
            sizeIndex
          ] !== selectedSize
        ) {
          return false;
        }


        if (
          colorIndex !== -1 &&
          selectedColor
        ) {

          return (
            variant.options[
              colorIndex
            ] === selectedColor
          );
        }


        return true;
      }
    );


  if (!valid) {

    delete selectedOptions[
      sizeIndex
    ];


    if (sizeSelect) {

      sizeSelect.value =
        "";
    }


    selectedVariant =
      null;


    automaticAddedVariantId =
      null;


    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );
  }
}


/* ========================================================
   UPDATE DYNAMIC COLORS
======================================================== */

function updateDynamicColors() {

  if (
    !colorContainer ||
    !currentProduct
  ) {
    return;
  }


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  if (
    colorIndex === -1
  ) {
    return;
  }


  colorContainer
    .querySelectorAll(
      ".custom-color-option"
    )
    .forEach(
      function (button) {

        const color =
          button.dataset.color;


        const available =
          isColorAvailable(
            currentVariants,
            colorIndex,
            color,
            selectedOptions,
            sizeIndex
          );


        button.disabled =
          !available;


        button.classList.toggle(
          "unavailable",
          !available
        );


        if (
          selectedOptions[
            colorIndex
          ] === color &&
          !available
        ) {

          delete selectedOptions[
            colorIndex
          ];


          button.classList.remove(
            "active"
          );


          resetColorSlider(
            colorSlider
          );


          selectedVariant =
            null;


          automaticAddedVariantId =
            null;


          addToCartButton.disabled =
            true;


          setAddToCartText(
            addToCartButton,
            "Add to Cart"
          );
        }
      }
    );
}


/* ========================================================
   AUTOMATIC BLACK + MEDIUM ADD
   
   Automatically adds:
   1. Selected main product variant
   2. Dark Winter Jacket
   
   No Add to Cart button click required.
======================================================== */

async function automaticallyAddAccessoryIfRequired() {

  if (!selectedVariant) {
    return;
  }


  if (automaticAccessoryAdding) {

    console.log(
      "AUTOMATIC ADD ALREADY IN PROGRESS"
    );

    return;
  }


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  const selectedColor =
    colorIndex !== -1
      ? selectedOptions[
          colorIndex
        ]
      : null;


  const selectedSize =
    sizeIndex !== -1
      ? selectedOptions[
          sizeIndex
        ]
      : null;


  console.log(
    "AUTOMATIC CHECK"
  );

  console.log(
    "SELECTED COLOR:",
    selectedColor
  );

  console.log(
    "SELECTED SIZE:",
    selectedSize
  );

  console.log(
    "SELECTED VARIANT:",
    selectedVariant
  );


  const isBlack =
    String(
      selectedColor || ""
    )
      .trim()
      .toLowerCase() ===
    "black";


  const normalizedSize =
    String(
      selectedSize || ""
    )
      .trim()
      .toLowerCase();


  const isMedium =
    normalizedSize === "m" ||
    normalizedSize === "medium";


  console.log(
    "IS BLACK:",
    isBlack
  );

  console.log(
    "IS MEDIUM:",
    isMedium
  );


  /*
    Only Black + M/Medium
    uses automatic addition.
  */

  if (
    !isBlack ||
    !isMedium
  ) {

    automaticAddedVariantId =
      null;

    console.log(
      "AUTOMATIC ADD NOT REQUIRED"
    );

    return;
  }


  const currentVariantId =
    Number(
      selectedVariant.id
    );


  if (
    automaticAddedVariantId ===
    currentVariantId
  ) {

    console.log(
      "THIS VARIANT WAS ALREADY AUTOMATICALLY ADDED"
    );

    return;
  }


  if (
    !selectedVariant.available
  ) {

    console.log(
      "SELECTED MAIN VARIANT IS NOT AVAILABLE"
    );

    return;
  }


  /*
    Actual accessory product handle.
  */

  const accessoryHandle =
    "dark-winter-jacket";


  console.log(
    "ACCESSORY HANDLE:",
    accessoryHandle
  );


  automaticAccessoryAdding =
    true;


  setAddToCartText(
    addToCartButton,
    "Adding..."
  );


  addToCartButton.disabled =
    true;


  try {

    console.log(
      "FETCHING ACCESSORY VARIANT..."
    );


    const accessoryVariant =
      await fetchAccessoryVariant(
        accessoryHandle
      );


    console.log(
      "ACCESSORY VARIANT:",
      accessoryVariant
    );


    if (!accessoryVariant) {

      throw new Error(
        "Dark Winter Jacket variant could not be found."
      );
    }


    if (!accessoryVariant.id) {

      throw new Error(
        "Dark Winter Jacket variant has no ID."
      );
    }


    if (
      !accessoryVariant.available
    ) {

      throw new Error(
        "Dark Winter Jacket variant is unavailable."
      );
    }


    const items = [

      {
        id: Number(
          selectedVariant.id
        ),
        quantity: 1
      },

      {
        id: Number(
          accessoryVariant.id
        ),
        quantity: 1
      }

    ];


    console.log(
      "AUTOMATIC CART ITEMS:",
      items
    );


    /*
      Shopify add request.
    */

    await addItemsToCart(
      items
    );


    console.log(
      "MAIN PRODUCT + ACCESSORY ADDED SUCCESSFULLY"
    );


    automaticAddedVariantId =
      currentVariantId;


    /*
      Show green success message
      AFTER Shopify confirms the add.
    */

    showSuccessMessage();


    /*
      Refresh Dawn cart drawer.
    */

    await refreshCart();


    /*
      Keep the success message visible
      long enough for the customer to see it.
    */

    setTimeout(
      function () {

        closeModal();

      },
      1800
    );

  } catch (error) {

    console.error(
      "AUTOMATIC ADD ERROR:",
      error
    );


    automaticAddedVariantId =
      null;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );


    addToCartButton.disabled =
      false;


    showMessage(
      message,
      error.message ||
        "Unable to automatically add products to cart.",
      true
    );


    if (message) {

      message.classList.remove(
        "success"
      );

      message.classList.add(
        "error"
      );

      message.style.color =
        "#d00000";

      message.style.display =
        "block";
    }

  } finally {

    automaticAccessoryAdding =
      false;
  }
}


/* ========================================================
   UPDATE VARIANT
======================================================== */

function updateVariant() {

  if (!currentProduct) {
    return;
  }


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  const selectedColor =
    colorIndex !== -1
      ? selectedOptions[
          colorIndex
        ]
      : null;


  const selectedSize =
    sizeIndex !== -1
      ? selectedOptions[
          sizeIndex
        ]
      : null;


  console.log(
    "COLOR SELECTED:",
    !!selectedColor
  );


  console.log(
    "SIZE SELECTED:",
    !!selectedSize
  );


  console.log(
    "SELECTED OPTIONS:",
    selectedOptions
  );


  /*
    COLOR REQUIRED
  */

  if (
    colorIndex !== -1 &&
    !selectedColor
  ) {

    selectedVariant =
      null;


    automaticAddedVariantId =
      null;


    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );


    console.log(
      "NO VARIANT - COLOR REQUIRED"
    );


    return;
  }


  /*
    SIZE REQUIRED
  */

  if (
    sizeIndex !== -1 &&
    !selectedSize
  ) {

    selectedVariant =
      null;


    automaticAddedVariantId =
      null;


    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );


    console.log(
      "NO VARIANT - SIZE REQUIRED"
    );


    return;
  }


  /*
    FIND EXACT AVAILABLE VARIANT
  */

  const variant =
    currentVariants.find(
      function (item) {

        if (
          !item.available
        ) {

          return false;
        }


        if (
          colorIndex !== -1 &&
          item.options[
            colorIndex
          ] !== selectedColor
        ) {

          return false;
        }


        if (
          sizeIndex !== -1 &&
          item.options[
            sizeIndex
          ] !== selectedSize
        ) {

          return false;
        }


        return true;
      }
    );


  /*
    NO VARIANT
  */

  if (!variant) {

    selectedVariant =
      null;


    automaticAddedVariantId =
      null;


    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Sold Out"
    );


    console.log(
      "NO EXACT VARIANT FOUND"
    );


    return;
  }


  /*
    EXACT VARIANT FOUND
  */

  selectedVariant =
    variant;


  console.log(
    "SELECTED VARIANT:",
    selectedVariant
  );


  console.log(
    "SELECTED VARIANT ID:",
    selectedVariant.id
  );


  console.log(
    "SELECTED VARIANT TITLE:",
    selectedVariant.title
  );


  console.log(
    "SELECTED VARIANT OPTIONS:",
    selectedVariant.options
  );


  /*
    UPDATE IMAGE
  */

  if (
    selectedVariant.featured_image &&
    selectedVariant.featured_image.src &&
    modalImage
  ) {

    modalImage.src =
      selectedVariant
        .featured_image
        .src;
  }


  /*
    UPDATE PRICE
  */

  if (modalPrice) {

    modalPrice.textContent =
      formatMoney(
        selectedVariant.price
      );
  }


  /*
    AVAILABLE VARIANT
  */

  if (
    selectedVariant.available
  ) {

    addToCartButton.disabled =
      false;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );


    console.log(
      "ADD TO CART ENABLED"
    );


    /*
      Automatically handle Black + M.
    */

    automaticallyAddAccessoryIfRequired();

  } else {

    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Sold Out"
    );
  }
}


/* ========================================================
   NORMAL MANUAL ADD TO CART
======================================================== */

async function addToCart() {

  console.log(
    "================================="
  );

  console.log(
    "MANUAL ADD TO CART STARTED"
  );


  if (!selectedVariant) {

    console.error(
      "NO SELECTED VARIANT"
    );

    return;
  }


  if (
    !selectedVariant.available
  ) {

    console.error(
      "SELECTED VARIANT NOT AVAILABLE"
    );

    return;
  }


  const colorIndex =
    findOptionIndex(
      currentProduct,
      "color"
    );


  const sizeIndex =
    findOptionIndex(
      currentProduct,
      "size"
    );


  const selectedColor =
    colorIndex !== -1
      ? selectedVariant.options[
          colorIndex
        ]
      : "";


  const selectedSize =
    sizeIndex !== -1
      ? selectedVariant.options[
          sizeIndex
        ]
      : "";


  const normalizedColor =
    String(
      selectedColor || ""
    )
      .trim()
      .toLowerCase();


  const normalizedSize =
    String(
      selectedSize || ""
    )
      .trim()
      .toLowerCase();


  const isBlack =
    normalizedColor ===
    "black";


  const isMedium =
    normalizedSize === "m" ||
    normalizedSize === "medium";


  /*
    Black + M is handled automatically.
  */

  if (
    isBlack &&
    isMedium
  ) {

    console.log(
      "BLACK + MEDIUM DETECTED"
    );


    if (
      automaticAddedVariantId ===
      Number(selectedVariant.id)
    ) {

      console.log(
        "ALREADY AUTOMATICALLY ADDED - STOPPING DUPLICATE"
      );

      return;
    }


    if (
      automaticAccessoryAdding
    ) {

      console.log(
        "AUTOMATIC ADD CURRENTLY RUNNING"
      );

      return;
    }


    await automaticallyAddAccessoryIfRequired();

    return;
  }


  /*
    NORMAL PRODUCT ADD
  */

  addToCartButton.disabled =
    true;


  setAddToCartText(
    addToCartButton,
    "Adding..."
  );


  try {

    const items = [

      {
        id: Number(
          selectedVariant.id
        ),
        quantity: 1
      }

    ];


    console.log(
      "NORMAL CART ITEMS:",
      items
    );


    await addItemsToCart(
      items
    );


    console.log(
      "NORMAL PRODUCT ADDED SUCCESSFULLY"
    );


    /*
      GREEN SUCCESS MESSAGE
    */

    showSuccessMessage();


    /*
      Refresh Dawn cart.
    */

    await refreshCart();


    /*
      Keep success message visible.
    */

    setTimeout(
      function () {

        closeModal();

      },
      1800
    );

  } catch (error) {

    console.error(
      "MANUAL ADD TO CART ERROR:",
      error
    );


    showMessage(
      message,
      error.message ||
        "Unable to add product to cart.",
      true
    );


    if (message) {

      message.classList.remove(
        "success"
      );

      message.classList.add(
        "error"
      );

      message.style.color =
        "#d00000";

      message.style.display =
        "block";
    }


    addToCartButton.disabled =
      false;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );
  }
}


/* ========================================================
   PRODUCT OPEN BUTTONS
======================================================== */

openButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const handle =
          this.dataset.productHandle;


        console.log(
          "PRODUCT OPEN BUTTON CLICKED:",
          handle
        );


        if (!handle) {

          console.error(
            "PRODUCT HANDLE MISSING"
          );

          return;
        }


        openProduct(
          handle
        );
      }
    );
  }
);


/* ========================================================
   CLOSE BUTTON
======================================================== */

if (closeButton) {

  closeButton.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      closeModal();
    }
  );
}


/* ========================================================
   CLICK OUTSIDE MODAL
======================================================== */

modal.addEventListener(
  "click",
  function (event) {

    if (
      event.target === modal
    ) {

      closeModal();
    }
  }
);


/* ========================================================
   ESC KEY
======================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      modal.classList.contains(
        "is-active"
      )
    ) {

      closeModal();
    }
  }
);


/* ========================================================
   MANUAL ADD TO CART BUTTON
======================================================== */

addToCartButton.addEventListener(
  "click",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    console.log(
      "================================="
    );

    console.log(
      "ADD TO CART BUTTON CLICKED"
    );

    console.log(
      "BUTTON DISABLED:",
      addToCartButton.disabled
    );

    console.log(
      "SELECTED VARIANT:",
      selectedVariant
    );

    console.log(
      "SELECTED OPTIONS:",
      selectedOptions
    );

    console.log(
      "================================="
    );


    addToCart();

  },
  true
);


/* ========================================================
   CLOSE MODAL
======================================================== */

function closeModal() {

  /*
    Remove focus from elements inside the modal
    before setting aria-hidden=true.
  */

  if (
    document.activeElement &&
    modal.contains(
      document.activeElement
    )
  ) {

    document.activeElement.blur();
  }


  closeModalUI(
    modal
  );


  selectedOptions =
    [];


  selectedVariant =
    null;


  automaticAccessoryAdding =
    false;


  automaticAddedVariantId =
    null;


  if (addToCartButton) {

    addToCartButton.disabled =
      true;


    setAddToCartText(
      addToCartButton,
      "Add to Cart"
    );
  }


  if (sizeSelect) {

    sizeSelect.value =
      "";
  }


  if (colorContainer) {

    colorContainer
      .querySelectorAll(
        ".custom-color-option"
      )
      .forEach(
        function (button) {

          button.classList.remove(
            "active"
          );
        }
      );
  }


  resetColorSlider(
    colorSlider
  );


  if (message) {

    message.textContent =
      "";

    message.style.display =
      "none";

    message.classList.remove(
      "success",
      "error"
    );

    message.style.color =
      "";
  }


  document.body.style.overflow =
    "";
}


});
}

/* ============================================================
INITIALIZE
============================================================ */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
"DOMContentLoaded",
initializeProductPopup
);

} else {

initializeProductPopup();
}

/* ============================================================
SHOPIFY THEME EDITOR / SECTION RELOAD
============================================================ */

document.addEventListener(
"shopify:section:load",
function () {


initializeProductPopup();


}
);
