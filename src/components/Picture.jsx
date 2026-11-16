/**
 * <picture> with AVIF first and WebP as the fallback. `image` comes from responsiveImage() in src/images.js.
 * Always pass width and height so the browser reserves the space (no layout shift).
 */
export default function Picture({ image, sizes, alt, width, height, ...imgProps }) {
  return (
    <picture>
      <source type="image/avif" srcSet={image.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.webp} sizes={sizes} />
      <img src={image.src} srcSet={image.webp} sizes={sizes} alt={alt} width={width} height={height} {...imgProps} />
    </picture>
  );
}
