/**
 * Galerija proizvoda, s glavnom slikom na prvom mjestu.
 *
 * Stariji proizvodi imaju samo polje `image`, pa ga uvrštavamo ako ga nema
 * u nizu `images`.
 */
export function productImages(product) {
  const images = product?.images ?? [];
  if (product?.image && !images.includes(product.image)) {
    return [product.image, ...images];
  }
  return images;
}
