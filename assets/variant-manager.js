/* ============================================================
   VARIANT MANAGER
   Handles option indexes, colors, sizes and selected variants.
   ============================================================ */

export function findOptionIndex(product, optionName) {
  if (!product) return -1;

  return (product.options || []).findIndex(function (option) {
    return (
      option.name &&
      option.name.trim().toLowerCase() === optionName.trim().toLowerCase()
    );
  });
}

export function findVariant(product, selectedOptions) {
  const options = product.options || [];
  const variants = product.variants || [];

  const allSelected = options.every(function (option, index) {
    return selectedOptions[index] && selectedOptions[index] !== "";
  });

  if (!allSelected) return null;

  return (
    variants.find(function (variant) {
      return options.every(function (option, index) {
        return variant.options[index] === selectedOptions[index];
      });
    }) || null
  );
}

export function isColorAvailable(variants, colorIndex, color, selectedOptions, sizeIndex) {
  return variants.some(function (variant) {
    if (!variant.available) return false;

    if (variant.options[colorIndex] !== color) return false;

    if (
      sizeIndex !== -1 &&
      selectedOptions[sizeIndex] &&
      variant.options[sizeIndex] !== selectedOptions[sizeIndex]
    ) {
      return false;
    }

    return true;
  });
}

export function isSizeAvailable(variants, sizeIndex, size, selectedOptions, colorIndex) {
  return variants.some(function (variant) {
    if (!variant.available) return false;

    if (variant.options[sizeIndex] !== size) return false;

    if (
      colorIndex !== -1 &&
      selectedOptions[colorIndex] &&
      variant.options[colorIndex] !== selectedOptions[colorIndex]
    ) {
      return false;
    }

    return true;
  });
}
