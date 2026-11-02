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
  }
}

export function breadcrumbLd(items: { name: string; href: string }[], site?: URL) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.href, site) })),
  }
}
