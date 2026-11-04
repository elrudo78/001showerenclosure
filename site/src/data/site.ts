// Facts about the company that appear on every page and in structured data. Only what the client's material shows.
export const company = {
  name: 'Dulifei',
  brand: 'DLIFE',
  description:
    'Dulifei (brand DLIFE) is a manufacturer of glass shower enclosures, sliding shower doors and glass bathroom doors in Zhongshan, Guangdong, China. Most orders are made to the customer’s measurements.',
  locality: 'Zhongshan',
  region: 'Guangdong',
  country: 'CN',
  countryName: 'China',
}

/**
 * Ways to reach the company. Empty until the team or client confirms them (see docs/HANDOFF.md, section 7).
 * Anything filled in appears on the Contact page, in the footer and in the Organization data for search and AI tools.
 */
export const contact = {
  email: '', // e.g. 'sales@example.com'
  whatsapp: '', // with country code, e.g. '+86 760 0000 0000'
  phone: '',
  address: '', // one line, as it should appear on the site
  social: [] as { name: string; url: string }[], // e.g. { name: 'YouTube', url: 'https://www.youtube.com/@...' }
}

export const whatsappUrl = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`
export const hasContact = () => Boolean(contact.email || contact.whatsapp || contact.phone || contact.address || contact.social.length)

export const absolute = (path: string, site?: URL) => new URL(path, site).href

export function organizationLd(site?: URL) {
  return {
    '@type': 'Organization',
    '@id': absolute('/#organization', site),
    name: company.name,
    alternateName: company.brand,
    url: absolute('/', site),
    logo: absolute('/logo.png', site),
    description: company.description,
    address: { '@type': 'PostalAddress', addressLocality: company.locality, addressRegion: company.region, addressCountry: company.country },
    ...(contact.email && { email: contact.email }),
    ...((contact.phone || contact.whatsapp) && { telephone: contact.phone || contact.whatsapp }),
    ...(contact.social.length && { sameAs: contact.social.map((s) => s.url) }),
  }
}

export function breadcrumbLd(items: { name: string; href: string }[], site?: URL) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.href, site) })),
  }
}
