import { layouts, layoutUrl, products, productUrl } from './catalog'

/** Every public page, for the sitemap and llms.txt. */
export const routes = (): string[] => [
  '/',
  '/products/',
  ...layouts.map(layoutUrl),
  ...products.map(productUrl),
  '/factory/',
  '/projects/',
  '/contact/',
  '/faq/',
]
