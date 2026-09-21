import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const appPath = path.join(root, 'src', 'App.tsx')
const catalogPath = path.join(root, 'src', 'data', 'product-catalog.json')
const errors = []
const appSource = fs.readFileSync(appPath, 'utf8')

if (/productImages\.slice\([^)]*\)\.map/.test(appSource)) {
  errors.push('Legacy productImages.slice(...).map product cards still render outside the canonical catalog.')
}

for (const legacyName of [
  'Sliding Door Enclosure',
  'Corner Sliding Enclosure',
  'Corner Shower Enclosure',
  'Hinged Door Enclosure',
  'Framed Shower Enclosure',
  'Minimal Shower Screen',
  'Custom Enclosure Solution',
]) {
  if (appSource.includes(`'${legacyName}'`) || appSource.includes(`"${legacyName}"`)) {
    errors.push(`Legacy placeholder product name is still rendered: ${legacyName}`)
  }
}

if (/const\s+productsPortfolio\s*=/.test(appSource)) {
  errors.push('A separate Products-page product collection still exists outside the canonical catalog.')
}

if (!fs.existsSync(catalogPath)) {
  errors.push('Canonical product catalog is missing: src/data/product-catalog.json')
} else {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  const products = catalog.products || []
  const unique = (field, label, predicate = () => true) => {
    const seen = new Map()
    for (const product of products.filter(predicate)) {
      const value = product[field]
      if (!value) continue
      if (seen.has(value)) errors.push(`${label} is duplicated by ${seen.get(value)} and ${product.id}: ${value}`)
      else seen.set(value, product.id)
    }
  }

  unique('id', 'Product ID')
  unique('detailUrl', 'Canonical detail URL', product => Boolean(product.detailUrl))
  unique('primaryDerivedAsset', 'Primary derived asset')
  unique('sourceGroup', 'Canonical source/product group')
  unique('originalSource', 'Primary original source mapping')

  const confirmedProducts = products.filter(product => product.status === 'CONFIRMED')
  const confirmedById = new Map(confirmedProducts.map(product => [product.id, product]))
  if (confirmedProducts.length !== 7) {
    errors.push(`Expected 7 confirmed products, found ${confirmedProducts.length}.`)
  }

  for (const product of products) {
    const assetPath = path.join(root, 'src', 'assets', product.primaryDerivedAsset || '')
    if (!product.primaryDerivedAsset || !fs.existsSync(assetPath)) {
      errors.push(`Primary derived asset is missing for ${product.id}: ${product.primaryDerivedAsset || '(empty)'}`)
    }
    if (product.status === 'NEEDS_CONFIRMATION' && product.detailUrl) {
      errors.push(`Unconfirmed product has a formal detail URL: ${product.id}`)
    }
    if (!['CONFIRMED', 'NEEDS_CONFIRMATION'].includes(product.status)) {
      errors.push(`Invalid product status for ${product.id}: ${product.status}`)
    }
    if (product.status === 'CONFIRMED' && !product.detailUrl) {
      errors.push(`Confirmed product is missing a formal detail URL: ${product.id}`)
    }
    if (product.detailUrl && (!/^\/products\/[a-z0-9-]+\/[a-z0-9-]+$/.test(product.detailUrl) || product.detailUrl !== product.detailUrl.toLowerCase())) {
      errors.push(`Invalid canonical product URL for ${product.id}: ${product.detailUrl}`)
    }
  }

  const detailStart = appSource.indexOf('const productDetails:')
  const detailEnd = appSource.indexOf('\ntype PageHeroProps', detailStart)
  const detailSource = detailStart >= 0 && detailEnd > detailStart ? appSource.slice(detailStart, detailEnd) : ''
  const metaSource = appSource.slice(appSource.indexOf('const pageMeta:'), appSource.indexOf('\nfunction Seo'))
  const detailRecords = new Map()
  const detailPattern = /'([^']+)': \{\s+productId: '([^']+)',([\s\S]*?)relatedIds: \[([^\]]*)\],\s+\},/g
  for (const match of detailSource.matchAll(detailPattern)) {
    const [, route, productId, body, relatedText] = match
    const galleryAssets = [...body.matchAll(/asset\('([^']+)'\)/g)].map(assetMatch => assetMatch[1])
    const relatedIds = [...relatedText.matchAll(/'([^']+)'/g)].map(idMatch => idMatch[1])
    detailRecords.set(route, { productId, galleryAssets, relatedIds })
  }

  const seenGalleryAssets = new Map()
  for (const product of confirmedProducts) {
    if (!metaSource.includes(`'${product.detailUrl}': [`)) {
      errors.push(`Confirmed product is missing unique page metadata: ${product.id}`)
    }
    const detail = detailRecords.get(product.detailUrl)
    if (!detail) {
      errors.push(`Confirmed product detail route is missing: ${product.id} -> ${product.detailUrl}`)
      continue
    }
    if (detail.productId !== product.id) {
      errors.push(`Detail route ${product.detailUrl} points to ${detail.productId}, expected ${product.id}`)
    }
    if (!detail.galleryAssets.length) {
      errors.push(`Product detail gallery is empty: ${product.id}`)
    }
    for (const galleryAsset of detail.galleryAssets) {
      const galleryPath = path.join(root, 'src', 'assets', galleryAsset)
      if (!fs.existsSync(galleryPath)) errors.push(`Gallery asset is missing for ${product.id}: ${galleryAsset}`)
      if (seenGalleryAssets.has(galleryAsset)) errors.push(`Gallery asset is shared by ${seenGalleryAssets.get(galleryAsset)} and ${product.id}: ${galleryAsset}`)
      else seenGalleryAssets.set(galleryAsset, product.id)
    }
    if (new Set(detail.galleryAssets).size !== detail.galleryAssets.length) {
      errors.push(`Product detail gallery contains duplicate assets: ${product.id}`)
    }
    if (new Set(detail.relatedIds).size !== detail.relatedIds.length) {
      errors.push(`Related products contain duplicates: ${product.id}`)
    }
    for (const relatedId of detail.relatedIds) {
      const related = confirmedById.get(relatedId)
      if (relatedId === product.id) errors.push(`Product relates to itself: ${product.id}`)
      if (!related) errors.push(`Related product is not confirmed or does not exist: ${product.id} -> ${relatedId}`)
      else if (!related.detailUrl || !detailRecords.has(related.detailUrl)) errors.push(`Related product route is unavailable: ${product.id} -> ${relatedId}`)
    }
  }

  if (detailRecords.size !== confirmedProducts.length) {
    errors.push(`Product detail route count ${detailRecords.size} does not match confirmed product count ${confirmedProducts.length}.`)
  }
}

if (errors.length) {
  console.error('Product catalog uniqueness check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Product catalog uniqueness check passed.')
