/* ============================================================
   PRODUCT API
   Handles product JSON requests.
   ============================================================ */

export async function fetchProduct(handle) {
  const response = await fetch(`/products/${handle}.js`);

  if (!response.ok) {
    throw new Error("Product request failed");
  }

  return await response.json();
}
