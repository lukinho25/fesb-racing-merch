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

/**
 * Zalihe po veličini. Proizvodi spremljeni prije uvođenja varijanti imaju
 * samo popis veličina i jedan zbirni broj, pa im zalihu ravnomjerno ne
 * izmišljamo - dok ih admin ne uredi, svaka veličina dijeli isti `stock`.
 */
export function productVariants(product) {
  if (product?.variants?.length) return product.variants;
  return (product?.sizes ?? []).map((size) => ({
    size,
    stock: product?.stock ?? 0,
  }));
}

/** Koliko je dostupno za odabranu veličinu (ili ukupno, ako veličina nema). */
export function stockForSize(product, size) {
  if (!size) return product?.stock ?? 0;
  const variant = productVariants(product).find((v) => v.size === size);
  return variant ? variant.stock : 0;
}

/** Ukupna zaliha proizvoda. */
export function totalStock(product) {
  const variants = product?.variants ?? [];
  if (variants.length) {
    return variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  return product?.stock ?? 0;
}

/**
 * Varijante za admin formu. Proizvod spremljen prije uvođenja zaliha po
 * veličini nema stvarne brojeve, pa ih ne izmišljamo iz zbirne zalihe -
 * krećemo od nule da se zaliha ne bi umnožila po veličinama.
 */
export function editableVariants(product) {
  if (product?.variants?.length) return product.variants;
  return (product?.sizes ?? []).map((size) => ({ size, stock: 0 }));
}

/** Ima li proizvod još uvijek samo zbirnu zalihu? */
export function needsVariantStock(product) {
  return Boolean(product?.sizes?.length) && !product?.variants?.length;
}
