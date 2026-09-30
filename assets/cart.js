("PRODUCT GRID POPUP JS LOADED");


/* ============================================================
   INITIALIZE
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

  modals.forEach(function(modal) {

    if (
      modal.dataset.initialized === "true"
    ) {
      return;
    }

    modal.dataset.initialized = "true";


    /* ========================================================
       ELEMENTS
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
       STATE
    ======================================================== */

    let currentProduct = null;

    let currentVariants = [];

    let selectedOptions = [];

    let selectedVariant = null;


    /* ========================================================
       SECTION ID
    ======================================================== */

    const sectionId =
      modal.id.replace(
        "modal-",
        ""
      );


    /* ========================================================
       OPEN BUTTONS
    ======================================================== */

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
       OPEN PRODUCT
    ======================================================== */

    async function openProduct(
      handle
    ) {

      currentProduct = null;

      currentVariants = [];

      selectedOptions = [];

      selectedVariant = null;

      resetUI();

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

        const response =
          await fetch(
            `/products/${handle}.js`
          );

        if (!response.ok) {

          throw new Error(
            "Product request failed"
          );
        }

        const product =
          await response.json();

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

      if (modalImage) {

        if (product.featured_image) {

          modalImage.src =
            product.featured_image;

          modalImage.alt =
            product.title || "";
        }
      }
    }


    /* ========================================================
       FIND OPTION INDEX
    ======================================================== */

    function findOptionIndex(
      optionName
    ) {

      if (!currentProduct) {

        return -1;
      }

      return (
        currentProduct.options || []
      ).findIndex(
        function(option) {

          return (
            option.name &&
            option.name
              .trim()
              .toLowerCase() ===
            optionName
              .trim()
              .toLowerCase()
          );
        }
      );
    }


    /* ========================================================
       RENDER OPTIONS
    ======================================================== */

    function renderOptions(
      product
    ) {

      selectedOptions = [];

      selectedVariant = null;

      const options =
        product.options || [];

      const variants =
        product.variants || [];

      const colorIndex =
        findOptionIndex(
          "color"
        );

      const sizeIndex =
        findOptionIndex(
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
          options[
            colorIndex
          ].values || [];

        colors.forEach(
          function(color) {

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
              variants.some(
                function(variant) {

                  return (
                    variant.available &&
                    variant.options[
                      colorIndex
                    ] === color
                  );
                }
              );

            if (!available) {

              button.disabled =
                true;

              button.classList.add(
                "unavailable"
              );
            }

            button.addEventListener(
              "click",
              function() {

                selectedOptions[
                  colorIndex
                ] = color;

                console.log(
                  "COLOR CLICKED:",
                  color
                );

                colorContainer
                  .querySelectorAll(
                    ".custom-color-option"
                  )
                  .forEach(
                    function(item) {

                      item.classList.remove(
                        "active"
                      );
                    }
                  );

                button.classList.add(
                  "active"
                );

                moveColorSlider(
                  button
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
            function() {

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

                updateDynamicColors();

                updateVariant();

                return;
              }

              selectedOptions[
                sizeIndex
              ] =
                this.value;

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
       * IMPORTANT:
       * Nothing selected initially.
       */

      selectedOptions = [];

      selectedVariant = null;

      resetColorSelection();

      resetSizeSelection();

      addToCartButton.disabled =
        true;

      setAddToCartText(
        "Add to Cart"
      );
    }


    /* ========================================================
       RENDER SIZES
    ======================================================== */

    function renderSizes() {

      if (!sizeSelect) {
        return;
      }

      const sizeIndex =
        findOptionIndex(
          "size"
        );

      const colorIndex =
        findOptionIndex(
          "color"
        );

      if (
        sizeIndex === -1
      ) {
        return;
      }

      const sizes =
        currentProduct.options[
          sizeIndex
        ].values || [];

      sizeSelect.innerHTML =
        '<option value="">Select Size</option>';

      sizes.forEach(
        function(size) {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            size;

          option.textContent =
            size;

          const selectedColor =
            colorIndex !== -1
              ? selectedOptions[
                  colorIndex
                ]
              : null;

          const available =
            currentVariants.some(
              function(variant) {

                if (
                  !variant.available
                ) {
                  return false;
                }

                if (
                  variant.options[
                    sizeIndex
                  ] !== size
                ) {
                  return false;
                }

                if (
                  selectedColor &&
                  colorIndex !== -1
                ) {

                  if (
                    variant.options[
                      colorIndex
                    ] !== selectedColor
                  ) {

                    return false;
                  }
                }

                return true;
              }
            );

          option.disabled =
            !available;

          sizeSelect.appendChild(
            option
          );
        }
      );


      const currentSize =
        selectedOptions[
          sizeIndex
        ];

      if (currentSize) {

        const matchingOption =
          Array.from(
            sizeSelect.options
          ).find(
            function(option) {

              return (
                option.value ===
                  currentSize &&
                !option.disabled
              );
            }
          );

        if (matchingOption) {

          sizeSelect.value =
            currentSize;

        } else {

          delete selectedOptions[
            sizeIndex
          ];

          sizeSelect.value =
            "";
        }
      }
    }


    /* ========================================================
       VALIDATE SELECTED SIZE
    ======================================================== */

    function validateSelectedSize() {

      const sizeIndex =
        findOptionIndex(
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

      const valid =
        currentVariants.some(
          function(variant) {

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

            const colorIndex =
              findOptionIndex(
                "color"
              );

            if (
              colorIndex !== -1 &&
              selectedOptions[
                colorIndex
              ]
            ) {

              return (
                variant.options[
                  colorIndex
                ] ===
                selectedOptions[
                  colorIndex
                ]
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
      }
    }


    /* ========================================================
       UPDATE DYNAMIC COLORS
    ======================================================== */

    function updateDynamicColors() {

      if (!colorContainer) {
        return;
      }

      const colorIndex =
        findOptionIndex(
          "color"
        );

      const sizeIndex =
        findOptionIndex(
          "size"
        );

      if (
        colorIndex === -1
      ) {
        return;
      }

      const selectedSize =
        sizeIndex !== -1
          ? selectedOptions[
              sizeIndex
            ]
          : null;

      colorContainer
        .querySelectorAll(
          ".custom-color-option"
        )
        .forEach(
          function(button) {

            const color =
              button.dataset.color;

            const available =
              currentVariants.some(
                function(variant) {

                  if (
                    !variant.available
                  ) {
                    return false;
                  }

                  if (
                    variant.options[
                      colorIndex
                    ] !== color
                  ) {
                    return false;
                  }

                  if (
                    selectedSize &&
                    sizeIndex !== -1
                  ) {

                    if (
                      variant.options[
                        sizeIndex
                      ] !== selectedSize
                    ) {

                      return false;
                    }
                  }

                  return true;
                }
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

              resetColorSlider();
            }
          }
        );
    }


    /* ========================================================
       UPDATE VARIANT
    ======================================================== */

    function updateVariant() {

      const options =
        currentProduct.options || [];

      const allSelected =
        options.every(
          function(option, index) {

            return (
              selectedOptions[index] &&
              selectedOptions[index] !== ""
            );
          }
        );

      if (!allSelected) {

        selectedVariant =
          null;

        addToCartButton.disabled =
          true;

        setAddToCartText(
          "Add to Cart"
        );

        console.log(
          "NO VARIANT - OPTION REQUIRED"
        );

        return;
      }


      const variant =
        currentVariants.find(
          function(item) {

            return options.every(
              function(option, index) {

                return (
                  item.options[index] ===
                  selectedOptions[index]
                );
              }
            );
          }
        );


      if (!variant) {

        selectedVariant =
          null;

        addToCartButton.disabled =
          true;

        setAddToCartText(
          "Unavailable"
        );

        console.log(
          "NO MATCHING VARIANT"
        );

        return;
      }


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


      /* ======================================================
         UPDATE IMAGE
      ====================================================== */

      if (
        selectedVariant.featured_image &&
        selectedVariant.featured_image.src
      ) {

        modalImage.src =
          selectedVariant
            .featured_image
            .src;
      }


      /* ======================================================
         UPDATE PRICE
      ====================================================== */

      if (modalPrice) {

        modalPrice.textContent =
          formatMoney(
            selectedVariant.price
          );
      }


      /* ======================================================
         AVAILABILITY
      ====================================================== */

      if (
        selectedVariant.available
      ) {

        addToCartButton.disabled =
          false;

        setAddToCartText(
          "Add to Cart"
        );

        console.log(
          "ADD TO CART ENABLED"
        );

      } else {

        addToCartButton.disabled =
          true;

        setAddToCartText(
          "Sold Out"
        );
      }
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
        "Add to Cart"
      );
    }


    /* ========================================================
       RESET COLOR SELECTION
    ======================================================== */

    function resetColorSelection() {

      if (colorContainer) {

        colorContainer
          .querySelectorAll(
            ".custom-color-option"
          )
          .forEach(
            function(button) {

              button.classList.remove(
                "active"
              );
            }
          );
      }

      resetColorSlider();
    }


    /* ========================================================
       RESET COLOR SLIDER
    ======================================================== */

    function resetColorSlider() {

      if (!colorSlider) {
        return;
      }

      colorSlider.style.width =
        "0px";

      colorSlider.style.transform =
        "translateX(0px)";
    }


    /* ========================================================
       RESET SIZE
    ======================================================== */

    function resetSizeSelection() {

      if (!sizeSelect) {
        return;
      }

      sizeSelect.value =
        "";
    }


    /* ========================================================
       MOVE COLOR SLIDER
    ======================================================== */

    function moveColorSlider(
      button
    ) {

      if (
        !colorSlider ||
        !button ||
        !colorContainer
      ) {
        return;
      }

      const buttonRect =
        button.getBoundingClientRect();

      const containerRect =
        colorContainer.getBoundingClientRect();

      const left =
        buttonRect.left -
        containerRect.left;

      colorSlider.style.width =
        `${buttonRect.width}px`;

      colorSlider.style.transform =
        `translateX(${left}px)`;
    }


    /* ========================================================
       CHECK AUTOMATIC ACCESSORY
    ======================================================== */

    function shouldAddAccessory(
      variant
    ) {

      if (!variant) {

        return false;
      }

      const colorIndex =
        findOptionIndex(
          "color"
        );

      const sizeIndex =
        findOptionIndex(
          "size"
        );

      if (
        colorIndex === -1 ||
        sizeIndex === -1
      ) {

        console.log(
          "ACCESSORY CHECK: COLOR OR SIZE OPTION NOT FOUND"
        );

        return false;
      }


      const color =
        String(
          variant.options[
            colorIndex
          ] || ""
        )
          .trim()
          .toLowerCase();


      const size =
        String(
          variant.options[
            sizeIndex
          ] || ""
        )
          .trim()
          .toLowerCase();


      console.log(
        "================================="
      );

      console.log(
        "ACCESSORY CONDITION CHECK"
      );

      console.log(
        "COLOR:",
        color
      );

      console.log(
        "SIZE:",
        size
      );

      console.log(
        "VARIANT:",
        variant
      );

      console.log(
        "================================="
      );


      /*
       * Shopify variant can use:
       *
       * Black + M
       *
       * or:
       *
       * Black + Medium
       */

      const blackSelected =
        color === "black";

      const mediumSelected =
        size === "m" ||
        size === "medium";


      const result =
        blackSelected &&
        mediumSelected;


      console.log(
        "BLACK SELECTED:",
        blackSelected
      );

      console.log(
        "MEDIUM SELECTED:",
        mediumSelected
      );

      console.log(
        "ADD ACCESSORY:",
        result
      );


      return result;
    }


    /* ========================================================
       FETCH ACCESSORY VARIANT
    ======================================================== */

    async function fetchAccessoryVariant(
      handle
    ) {

      if (!handle) {

        throw new Error(
          "Accessory product handle is missing."
        );
      }

      console.log(
        "================================="
      );

      console.log(
        "FETCHING ACCESSORY"
      );

      console.log(
        "ACCESSORY HANDLE:",
        handle
      );

      console.log(
        "================================="
      );


      const response =
        await fetch(
          `/products/${handle}.js`
        );


      console.log(
        "ACCESSORY API STATUS:",
        response.status
      );


      if (!response.ok) {

        throw new Error(
          `Accessory product request failed: ${response.status}`
        );
      }


      const product =
        await response.json();


      console.log(
        "ACCESSORY PRODUCT:",
        product
      );


      if (
        !product.variants ||
        !product.variants.length
      ) {

        throw new Error(
          "Accessory has no variants."
        );
      }


      const availableVariant =
        product.variants.find(
          function(variant) {

            return variant.available;
          }
        );


      if (!availableVariant) {

        throw new Error(
          "Soft Winter Jacket has no available variant."
        );
      }


      console.log(
        "ACCESSORY VARIANT:",
        availableVariant
      );


      return availableVariant;
    }


    /* ========================================================
       ADD TO CART
    ======================================================== */

    async function addToCart() {

      if (
        !selectedVariant ||
        !selectedVariant.available
      ) {

        console.warn(
          "NO AVAILABLE SELECTED VARIANT"
        );

        return;
      }


      console.log(
        "================================="
      );

      console.log(
        "ADD TO CART CLICKED"
      );

      console.log(
        "================================="
      );


      console.log(
        "MAIN VARIANT:",
        selectedVariant
      );


      addToCartButton.disabled =
        true;

      setAddToCartText(
        "Adding..."
      );


      try {

        /*
         * ====================================================
         * MAIN PRODUCT
         * ====================================================
         */

        const items = [

          {
            id:
              Number(
                selectedVariant.id
              ),

            quantity:
              1
          }

        ];


        console.log(
          "MAIN PRODUCT ITEM:",
          items[0]
        );


        /*
         * ====================================================
         * ACCESSORY HANDLE
         * ====================================================
         *
         * First use the section data attribute.
         *
         * If it is not available, use the known
         * Soft Winter Jacket handle.
         */

        const section =
          document.querySelector(
            "[data-accessory-handle]"
          );


        let accessoryHandle =
          section
            ? section.dataset.accessoryHandle
            : "";


        if (!accessoryHandle) {

          accessoryHandle =
            "soft-winter-jacket";
        }


        console.log(
          "ACCESSORY HANDLE:",
          accessoryHandle
        );


        /*
         * ====================================================
         * CHECK BLACK + MEDIUM
         * ====================================================
         */

        const addAccessory =
          shouldAddAccessory(
            selectedVariant
          );


        /*
         * ====================================================
         * AUTOMATIC ACCESSORY
         * ====================================================
         */

        if (addAccessory) {

          console.log(
            "================================="
          );

          console.log(
            "BLACK + MEDIUM DETECTED"
          );

          console.log(
            "ADDING SOFT WINTER JACKET"
          );

          console.log(
            "================================="
          );


          const accessoryVariant =
            await fetchAccessoryVariant(
              accessoryHandle
            );


          items.push({

            id:
              Number(
                accessoryVariant.id
              ),

            quantity:
              1

          });


          console.log(
            "ACCESSORY ADDED TO ITEMS:",
            {
              id:
                Number(
                  accessoryVariant.id
                ),
              quantity: 1
            }
          );


        } else {

          console.log(
            "BLACK + MEDIUM NOT DETECTED"
          );

          console.log(
            "ONLY MAIN PRODUCT WILL BE ADDED"
          );
        }


        /*
         * ====================================================
         * FINAL ITEMS
         * ====================================================
         */

        console.log(
          "================================="
        );

        console.log(
          "FINAL CART ITEMS"
        );

        console.log(
          items
        );

        console.log(
          "TOTAL ITEMS:",
          items.length
        );

        console.log(
          "================================="
        );


        /*
         * ====================================================
         * SHOPIFY CART API
         * ====================================================
         */

        const response =
          await fetch(
            "/cart/add.js",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"
              },

              body:
                JSON.stringify({
                  items:
                    items
                })
            }
          );


        console.log(
          "CART API STATUS:",
          response.status
        );


        const data =
          await response.json();


        console.log(
          "CART API RESPONSE:",
          data
        );


        if (!response.ok) {

          throw new Error(
            data.description ||
            data.message ||
            "Add to cart failed."
          );
        }


        console.log(
          "================================="
        );

        console.log(
          "PRODUCTS SUCCESSFULLY ADDED"
        );

        console.log(
          "================================="
        );


        showMessage(
          "Added to cart.",
          false
        );


        /*
         * ====================================================
         * REFRESH DAWN CART
         * ====================================================
         */

        await refreshCart();


        /*
         * Close modal after successful addition
         */

        setTimeout(
          function() {

            closeModal();

          },
          700
        );


      } catch (error) {

        console.error(
          "================================="
        );

        console.error(
          "ADD TO CART ERROR:",
          error
        );

        console.error(
          "================================="
        );


        showMessage(
          error.message ||
          "Unable to add product to cart.",
          true
        );


        addToCartButton.disabled =
          false;

        setAddToCartText(
          "Add to Cart"
        );
      }
    }


    /* ========================================================
       REFRESH CART
    ======================================================== */

    async function refreshCart() {

      console.log(
        "================================="
      );

      console.log(
        "REFRESHING SHOPIFY CART"
      );

      console.log(
        "================================="
      );


      try {

        const response =
          await fetch(
            "/?sections=cart-drawer,cart-icon-bubble",
            {
              method:
                "GET",

              headers: {
                "Accept":
                  "application/json"
              }
            }
          );


        console.log(
          "CART REFRESH STATUS:",
          response.status
        );


        if (!response.ok) {

          throw new Error(
            `Cart refresh failed: ${response.status}`
          );
        }


        const sections =
          await response.json();


        console.log(
          "CART SECTIONS:",
          sections
        );


        /*
         * ====================================================
         * CART DRAWER
         * ====================================================
         */

        if (
          sections["cart-drawer"]
        ) {

          const currentDrawer =
            document.querySelector(
              "cart-drawer"
            );


          if (currentDrawer) {

            const parser =
              new DOMParser();


            const documentFragment =
              parser.parseFromString(
                sections[
                  "cart-drawer"
                ],
                "text/html"
              );


            const newDrawer =
              documentFragment.querySelector(
                "cart-drawer"
              );


            if (newDrawer) {

              currentDrawer.replaceWith(
                newDrawer
              );


              console.log(
                "CART DRAWER UPDATED"
              );
            }
          }
        }


        /*
         * ====================================================
         * CART ICON
         * ====================================================
         */

        if (
          sections[
            "cart-icon-bubble"
          ]
        ) {

          const currentBubble =
            document.querySelector(
              "#cart-icon-bubble"
            );


          if (currentBubble) {

            const parser =
              new DOMParser();


            const bubbleDocument =
              parser.parseFromString(
                sections[
                  "cart-icon-bubble"
                ],
                "text/html"
              );


            const newBubble =
              bubbleDocument.querySelector(
                "#cart-icon-bubble"
              );


            if (newBubble) {

              currentBubble.replaceWith(
                newBubble
              );


              console.log(
                "CART ICON UPDATED"
              );
            }
          }
        }


        document.dispatchEvent(
          new CustomEvent(
            "cart:updated"
          )
        );


        console.log(
          "CART UPDATED EVENT DISPATCHED"
        );


        return sections;


      } catch (error) {

        console.error(
          "CART REFRESH ERROR:",
          error
        );

        throw error;
      }
    }


    /* ========================================================
       SHOW MESSAGE
    ======================================================== */

    function showMessage(
      text,
      isError
    ) {

      if (!message) {
        return;
      }

      message.textContent =
        text;

      message.style.display =
        "block";

      message.style.color =
        isError
          ? "#b00020"
          : "#008000";
    }


    /* ========================================================
       SET BUTTON TEXT
    ======================================================== */

    function setAddToCartText(
      text
    ) {

      const spans =
        addToCartButton.querySelectorAll(
          "span"
        );


      /*
       * Keep existing arrow.
       */

      if (
        spans.length > 1
      ) {

        spans[
          spans.length - 1
        ].textContent =
          text;

      } else {

        addToCartButton.textContent =
          text;
      }
    }


    /* ========================================================
       FORMAT MONEY
    ======================================================== */

    function formatMoney(
      cents
    ) {

      const amount =
        Number(cents) / 100;

      let currency =
        "USD";


      if (
        window.Shopify &&
        Shopify.currency &&
        Shopify.currency.active
      ) {

        currency =
          Shopify.currency.active;
      }


      return new Intl.NumberFormat(
        undefined,
        {
          style:
            "currency",

          currency:
            currency
        }
      ).format(
        amount
      );
    }


    /* ========================================================
       OPEN BUTTON EVENTS
    ======================================================== */

    openButtons.forEach(
      function(button) {

        button.addEventListener(
          "click",
          function() {

            const handle =
              this.dataset.productHandle;


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
        closeModal
      );
    }


    /* ========================================================
       OUTSIDE CLICK
    ======================================================== */

    modal.addEventListener(
      "click",
      function(event) {

        if (
          event.target ===
          modal
        ) {

          closeModal();
        }
      }
    );


    /* ========================================================
       ESCAPE
    ======================================================== */

    document.addEventListener(
      "keydown",
      function(event) {

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
       ADD TO CART
    ======================================================== */

    addToCartButton.addEventListener(
      "click",
      addToCart
    );

  });
}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeModal() {

  const modal =
    document.querySelector(
      ".custom-product-modal.is-active"
    );

  if (!modal) {
    return;
  }


  modal.classList.remove(
    "is-active"
  );

  modal.style.display =
    "none";

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";


  const sizeSelect =
    modal.querySelector(
      ".custom-modal-size-select"
    );

  if (sizeSelect) {

    sizeSelect.value =
      "";
  }


  const colorContainer =
    modal.querySelector(
      ".custom-modal-colors"
    );

  if (colorContainer) {

    colorContainer
      .querySelectorAll(
        ".custom-color-option"
      )
      .forEach(
        function(button) {

          button.classList.remove(
            "active"
          );
        }
      );
  }


  const colorSlider =
    modal.querySelector(
      ".custom-color-slider"
    );

  if (colorSlider) {

    colorSlider.style.width =
      "0px";

    colorSlider.style.transform =
      "translateX(0px)";
  }
}


/* ============================================================
   INITIALIZE ON PAGE LOAD
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
   SHOPIFY THEME EDITOR
============================================================ */

document.addEventListener(
  "shopify:section:load",
  function() {

    initializeProductPopup();

  }
);