// The product range. Specifications are copied from Dulifei's 2025 catalog
// (reference/2025年小图册-高端市场.pdf), each one checked against the printed page on 2026-11-02.
// Nothing here is estimated: a field that the catalog leaves blank is left out.
import type { ImageMetadata } from 'astro'

const studio = import.meta.glob<{ default: ImageMetadata }>('../assets/catalog/*.png', { eager: true })
const photos = import.meta.glob<{ default: ImageMetadata }>('../assets/{products,dlfc,catalog,hero}/*.jpg', { eager: true })
const img = (path: string): ImageMetadata => {
  const hit = studio[`../assets/${path}`] || photos[`../assets/${path}`]
  if (!hit) throw new Error(`Missing image ${path}`)
  return hit.default
}

export type LayoutId = 'sliding' | 'neo-angle' | 'pivot' | 'l-t' | 'panoramic' | 'bathroom-door'

export interface Layout {
  id: LayoutId
  slug: string
  name: string
  short: string
  title: string
  description: string
  intro: string
}

export const layouts: Layout[] = [
  {
    id: 'sliding',
    slug: 'sliding-shower-doors',
    name: 'Sliding shower doors',
    short: 'Sliding doors',
    title: 'Sliding shower doors, made to measure',
    description:
      'Glass sliding shower doors from Dulifei: two-panel, three-panel and fixed-plus-sliding designs in 8 mm or 10 mm glass, made to your width and height.',
    intro:
      'Sliding doors save space because nothing swings into the room. Choose one fixed panel and one sliding panel, two panels that pass each other, or three panels for wider openings. Each model has a standard size and a width and height range it can be made to.',
  },
  {
    id: 'neo-angle',
    slug: 'neo-angle-shower-enclosures',
    name: 'Neo-angle shower enclosures',
    short: 'Neo-angle corners',
    title: 'Neo-angle corner shower enclosures',
    description:
      'Five-sided neo-angle (diamond) corner shower enclosures from Dulifei with pivot, hinged or sliding doors, 1100 × 1100 mm standard and made to measure.',
    intro:
      'A neo-angle enclosure, also called a diamond enclosure, cuts the corner off a square shower so the door sits on the angle. Most models have a pivot door that opens both ways; some use hinges and open outwards only.',
  },
  {
    id: 'pivot',
    slug: 'pivot-shower-doors',
    name: 'Pivot and hinged shower screens',
    short: 'Pivot and hinged doors',
    title: 'Pivot and hinged shower screens',
    description:
      'Straight glass shower screens with a pivot or hinged door and fixed panels, 1600 × 2600 mm standard, made to measure up to 2800 mm high.',
    intro:
      'A straight screen closes off a shower recess from wall to wall: a door in the middle or at one end, with fixed glass panels beside it. Pivot doors in this range open both inwards and outwards.',
  },
  {
    id: 'l-t',
    slug: 'l-and-t-shape-enclosures',
    name: 'L-shape and T-shape enclosures',
    short: 'L and T shapes',
    title: 'L-shape and T-shape shower enclosures',
    description:
      'Corner and T-shaped glass shower enclosures from Dulifei, including a curved-glass corner model, made to measure up to 3000 mm high.',
    intro:
      'L-shape enclosures close two sides of a corner shower. T-shape enclosures divide a larger room, with two pivot doors. Both are made to the room, within the ranges listed for each model.',
  },
  {
    id: 'panoramic',
    slug: 'panoramic-sliding-systems',
    name: 'Panoramic sliding systems',
    short: 'Panoramic sliding',
    title: 'Panoramic sliding glass systems',
    description:
      'Panoramic sliding glass doors from Dulifei with 600 to 1200 mm panels, up to 3000 mm high, in brushed grey, black, rose gold and champagne gold.',
    intro:
      'Panoramic systems use tall glass panels on a top track for wide openings, in bathrooms or as room dividers. Panels are 600 to 1200 mm wide and can be made up to 3000 mm high.',
  },
  {
    id: 'bathroom-door',
    slug: 'bathroom-doors',
    name: 'Glass bathroom doors',
    short: 'Bathroom doors',
    title: 'Glass bathroom doors',
    description: 'A framed glass bathroom door with laminated wired glass, 800 mm wide and made up to 2800 mm high.',
    intro: 'A single framed door for the bathroom itself, with laminated glass. It opens inwards or outwards.',
  },
]

export const layoutById = (id: LayoutId) => layouts.find((l) => l.id === id)!

const F_STD = ['Mirror steel', '37° grey', 'Brushed zirconium gold', 'Italian matte gold']
const F_MOON = ['Mirror steel', '37° grey', 'Brushed zirconium moon gold', 'Italian matte gold']
const F_BRUSHED = ['Brushed grey', 'Brushed black', 'Brushed rose gold', 'Brushed champagne gold']
const ALL_SHAPES = ['Straight', 'L-shape', 'T-shape', 'Diamond (neo-angle)']
const BOTH_WAYS = 'Opens inwards and outwards'
const MAGNETIC = 'Stainless steel magnetic strip'
const RUBBER = 'Rubber strip'
const NEO_SIZE = '1100 × 1100 × 2300 mm'

export interface Specs {
  shapes?: string[]
  door: string
  glass: string
  seal?: string
  standard: string
  custom: string
  finishes: string[]
  handle?: string
}

export interface Product {
  slug: string
  code: string
  name: string
  layout: LayoutId
  kind: string // short description used in sentences, e.g. "neo-angle enclosure with a pivot door"
  image: ImageMetadata
  imageIsPhoto?: boolean
  photos?: { src: ImageMetadata; alt: string }[]
  specs?: Specs
  finishGallery?: { finish: string; src: ImageMetadata }[]
  catalogPage?: number
  series?: 'DLFC'
}

const p = (x: Omit<Product, 'image'> & { image?: ImageMetadata }): Product => ({ ...x, image: x.image ?? img(`catalog/${x.slug}.png`) })

const dlfcFinishes = (slug: string) =>
  slug === 'dlfc05'
    ? [
        { finish: 'Matte black', src: img('hero/finish-black.jpg') },
        { finish: 'Brushed gold', src: img('hero/finish-gold.jpg') },
        { finish: 'Brushed silver', src: img('hero/finish-silver.jpg') },
        { finish: 'Polished chrome', src: img('hero/finish-chrome.jpg') },
      ]
    : [
        { finish: 'Matte black', src: img(`dlfc/${slug}-black.jpg`) },
        { finish: 'Brushed gold', src: img(`dlfc/${slug}-gold.jpg`) },
        { finish: 'Brushed silver', src: img(`dlfc/${slug}-silver.jpg`) },
        { finish: 'Polished chrome', src: img(`dlfc/${slug}-chrome.jpg`) },
      ]

const dlfc = (n: 1 | 2 | 3 | 4 | 5, kind: string, name: string): Product => {
  const slug = `dlfc0${n}`
  const gallery = dlfcFinishes(slug)
  return { slug, code: `DLFC0${n}`, name, layout: 'sliding', kind, image: gallery[0].src, imageIsPhoto: true, finishGallery: gallery, series: 'DLFC' }
}

export const products: Product[] = [
  // DLFC series: the client's own renders, named by the client (DLFC01 to DLFC05). No printed specifications.
  dlfc(1, 'frameless sliding shower screen on an exposed top rail', 'DLFC01 Frameless Sliding Shower Screen'),
  dlfc(2, 'frameless sliding shower door on a square top rail', 'DLFC02 Frameless Sliding Shower Door'),
  dlfc(3, 'frameless sliding shower door on an exposed top rail', 'DLFC03 Frameless Sliding Shower Door'),
  dlfc(4, 'frameless sliding shower door with a slim top rail', 'DLFC04 Frameless Sliding Shower Door'),
  dlfc(5, 'framed double sliding shower door on roller hangers', 'DLFC05 Double Sliding Shower Door'),

  // Sliding doors
  p({
    slug: 's88421', code: 'S88421', name: 'S88421 Sliding Shower Door', layout: 'sliding', catalogPage: 9,
    kind: 'sliding door with one fixed and one sliding panel',
    image: img('catalog/card-s88421.jpg'), imageIsPhoto: true,
    photos: [{ src: img('catalog/scene-s88421.jpg'), alt: 'S88421 sliding glass door with a slim black frame opening onto a terrace' }],
    specs: { shapes: ['Straight', 'L-shape'], door: 'One fixed panel, one sliding panel', glass: '10 mm clear glass', seal: MAGNETIC, standard: '1300 × 2100 mm', custom: 'Width 1100 to 1600 mm, height 2000 to 2300 mm', finishes: F_STD, handle: 'U301 flared handle' },
  }),
  p({
    slug: 's86821', code: 'S86821', name: 'S86821 Sliding Shower Door', layout: 'sliding', catalogPage: 10,
    kind: 'sliding door with one fixed and one sliding panel',
    specs: { shapes: ['Straight', 'L-shape'], door: 'One fixed panel, one sliding panel', glass: '10 mm clear glass', seal: MAGNETIC, standard: '1300 × 2100 mm', custom: 'Width 1100 to 1600 mm, height 2000 to 2300 mm', finishes: F_STD, handle: 'U401 / SK-30N with knurled inner pull' },
  }),
  p({
    slug: 'fullframe', code: 'Full-frame', name: 'Full-Frame Bottom-Roller Sliding Door', layout: 'sliding', catalogPage: 10,
    kind: 'fully framed two-panel sliding door running on bottom rollers',
    specs: { shapes: ['Straight', 'L-shape', 'T-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', seal: MAGNETIC, standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2100 mm', finishes: ['37° grey'], handle: 'U402 handle (15 × 15 × 40 mm)' },
  }),
  p({
    slug: 's68722', code: 'S68722', name: 'S68722 Sliding Shower Door', layout: 'sliding', catalogPage: 10,
    kind: 'two-panel sliding door on a top track',
    specs: { shapes: ['Straight', 'L-shape', 'T-shape'], door: 'Two sliding panels', glass: '10 mm clear glass', seal: 'Rubber strip; stainless steel magnetic strip optional', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U502 small D-shaped handle' },
  }),
  p({
    slug: 'c52', code: 'C52', name: 'C52 Sliding Shower Door', layout: 'sliding', catalogPage: 10,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape', 'T-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', seal: MAGNETIC, standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U402 handle (15 × 15 × 40 mm)' },
  }),
  p({
    slug: 's88822', code: 'S88822', name: 'S88822 Sliding Shower Door', layout: 'sliding', catalogPage: 11,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape', 'T-shape'], door: 'Two sliding panels', glass: '10 mm clear glass', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U400 (881) handle' },
  }),
  p({
    slug: 'fandu60', code: 'Fandu 60', name: 'Fandu 60 Sliding Shower Door', layout: 'sliding', catalogPage: 11,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'Small rounded handle' },
  }),
  p({
    slug: 's68422', code: 'S68422', name: 'S68422 Sliding Shower Door', layout: 'sliding', catalogPage: 11,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '10 mm clear glass', seal: MAGNETIC, standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 mm', finishes: F_STD, handle: 'U502 small D-shaped handle' },
  }),
  p({
    slug: 'ys09', code: 'YS09', name: 'YS09 Sliding Shower Door', layout: 'sliding', catalogPage: 11,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', seal: MAGNETIC, standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD },
  }),
  p({
    slug: 's1912', code: 'S1912', name: 'S1912 Sliding Shower Door', layout: 'sliding', catalogPage: 12,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2100 mm', finishes: F_STD, handle: 'Small rounded handle' },
  }),
  p({
    slug: 's41522', code: 'S41522', name: 'S41522 Sliding Shower Door', layout: 'sliding', catalogPage: 12,
    kind: 'two-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '8 mm clear glass', seal: 'Soft-close available as an option', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'Small rounded handle or bevel-edge handle' },
  }),
  p({
    slug: 's41922', code: 'S41922', name: 'S41922 Soft-Close Sliding Shower Door', layout: 'sliding', catalogPage: 12,
    kind: 'two-panel sliding door with soft-close',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels with soft-close', glass: '8 mm clear glass', seal: 'Rubber strip; stainless steel magnetic strip optional', standard: '1400 × 2100 mm', custom: 'Width 1200 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U502 small D-shaped handle' },
  }),
  p({
    slug: 's26632', code: 'S26632', name: 'S26632 Sliding Shower Door', layout: 'sliding', catalogPage: 12,
    kind: 'two-panel sliding door with a long side handle',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two sliding panels', glass: '10 mm clear glass', seal: MAGNETIC, standard: '1200 × 2100 mm', custom: 'Width 1000 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U401 / SK-30N with knurled inner pull' },
  }),
  p({
    slug: 's26132', code: 'S26132', name: 'S26132 Three-Panel Sliding Shower Door', layout: 'sliding', catalogPage: 13,
    kind: 'three-panel sliding door with one fixed and two linked sliding panels',
    photos: [{ src: img('products/s26132-room.jpg'), alt: 'S26132 three-panel sliding shower door with a black frame in a bright bathroom' }],
    specs: { shapes: ['Straight', 'L-shape'], door: 'One fixed panel, two linked sliding panels', glass: '8 mm clear glass', seal: RUBBER, standard: '1200 × 2100 mm', custom: 'Width 1000 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: '261 handle with end caps' },
  }),
  p({
    slug: 'fhl', code: 'FHL', name: 'FHL Three-Panel Sliding Shower Door', layout: 'sliding', catalogPage: 13,
    kind: 'three-panel sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Three sliding panels', glass: '8 mm clear glass', seal: MAGNETIC, standard: '1200 × 2100 mm', custom: 'Width 1000 to 1800 mm, height 2000 to 2200 mm', finishes: F_STD, handle: '261 handle' },
  }),

  // Neo-angle
  ...(
    [
      ['d15131', 'D15131', 6, 'pivot', BOTH_WAYS, '10 mm clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_MOON, 'U503 large T-shaped handle (1180 × 450 mm)'],
      ['d15331', 'D15331', 5, 'pivot', BOTH_WAYS, '10 mm extra-clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_STD, '015 handle with end caps'],
      ['d12531', 'D12531', 5, 'pivot', BOTH_WAYS, '10 mm clear glass', MAGNETIC, 'Length 900 to 1500 mm, width 900 to 1500 mm, height up to 2800 mm', F_STD, 'U201 square knurled handle with end caps'],
      ['dr', 'DR', 5, 'pivot', BOTH_WAYS, '10 mm extra-clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_MOON, 'Crystal handle'],
      ['d15231', 'D15231', 5, 'pivot', BOTH_WAYS, '10 mm clear glass', MAGNETIC, 'Length 900 to 1500 mm, width 900 to 1500 mm, height up to 2800 mm', F_STD, 'U301 flared handle'],
      ['yd63', 'YD63', 6, 'pivot', 'Opens outwards', '8 mm clear glass', RUBBER, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_STD, '63 handle'],
      ['db', 'DB', 6, 'pivot', 'Opens outwards', '8 mm clear glass', RUBBER, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2400 mm', F_STD, '10 × 20 mm handle with end caps'],
      ['hd', 'HD', 6, 'hinged', 'Opens outwards', '10 mm clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_STD, 'U600 solid back-to-back handle'],
      ['d81231', 'D81231', 8, 'hinged', 'Opens outwards', '10 mm clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_STD, 'U605 small L-shaped handle'],
      ['d54131', 'D54131', 8, 'hinged', 'Opens outwards', '10 mm clear glass', MAGNETIC, 'Length 900 to 1200 mm, width 900 to 1200 mm, height up to 2800 mm', F_STD, 'U400 / 881 one-sided handle with end caps'],
    ] as const
  ).map(([slug, code, page, door, opening, glass, seal, custom, finishes, handle]) =>
    p({
      slug, code, name: `${code} Neo-Angle Shower Enclosure`, layout: 'neo-angle', catalogPage: page,
      kind: `neo-angle corner enclosure with a ${door} door`,
      photos:
        slug === 'd15131'
          ? [{ src: img('products/d15131-room.jpg'), alt: 'D15131 neo-angle shower enclosure with a black frame and long handle in a dark room' }]
          : slug === 'yd63'
            ? [
                { src: img('products/yd63-room-black.jpg'), alt: 'YD63 neo-angle shower enclosure with a black frame in a modern room' },
                { src: img('products/yd63-room-gold.jpg'), alt: 'YD63 neo-angle shower enclosure with a brushed gold frame in a white room' },
              ]
            : undefined,
      specs: { shapes: ALL_SHAPES, door: `${door === 'pivot' ? 'Pivot' : 'Hinged'} door. ${opening}`, glass, seal, standard: NEO_SIZE, custom, finishes: [...finishes], handle },
    }),
  ),
  p({
    slug: 's82431', code: 'S82431', name: 'S82431 Neo-Angle Sliding Shower Enclosure', layout: 'neo-angle', catalogPage: 13,
    kind: 'neo-angle corner enclosure with a sliding door',
    specs: { shapes: ['Diamond (neo-angle)', 'L-shape'], door: 'Two fixed panels, one sliding door', glass: '8 mm clear glass', standard: '1050 × 1050 × 2200 mm', custom: 'Width 1050 to 1500 mm, length 900 to 1500 mm, height 2000 to 2200 mm', finishes: F_STD, handle: 'U602 solid handle' },
  }),

  // Pivot and hinged screens
  p({
    slug: 's98231', code: 'S98231', name: 'S98231 Pivot Door Shower Screen', layout: 'pivot', catalogPage: 4,
    kind: 'straight screen with a pivot door between fixed panels',
    specs: { shapes: ALL_SHAPES, door: `Pivot door. ${BOTH_WAYS}`, glass: '10 mm extra-clear glass', seal: MAGNETIC, standard: '1600 × 2600 mm', custom: 'Length 1200 to 1800 mm, height up to 2800 mm', finishes: ['Mirror steel', 'Zirconium moon gold', 'Rose gold', 'Black titanium', 'Champagne gold'], handle: 'U601 solid knurled handle' },
  }),
  p({
    slug: 's12231', code: 'S12231', name: 'S12231 Pivot Door Shower Screen', layout: 'pivot', catalogPage: 4,
    kind: 'straight screen with a pivot door and fixed panels',
    specs: { shapes: ALL_SHAPES, door: `Pivot door. ${BOTH_WAYS}`, glass: '10 mm extra-clear glass', seal: MAGNETIC, standard: '1600 × 2600 mm', custom: 'Length 900 to 1500 mm, width 900 to 1500 mm, height up to 2800 mm', finishes: ['Mirror steel', '37° grey', 'Brushed zirconium gold', 'Italian matte gold'], handle: 'Threaded handle with end caps' },
  }),
  p({
    slug: 's93021', code: 'S93021', name: 'S93021 Hinged Door Shower Screen', layout: 'pivot', catalogPage: 8,
    kind: 'straight screen with a hinged glass door and a fixed panel',
    specs: { shapes: ALL_SHAPES, door: `Hinged door. ${BOTH_WAYS}`, glass: '10 mm clear glass', seal: MAGNETIC, standard: '1600 × 2600 mm', custom: 'Length 900 to 1500 mm, height up to 2800 mm (door up to 2400 mm)', finishes: F_STD, handle: 'U600 solid back-to-back handle' },
  }),
  p({
    slug: 's93031', code: 'S93031', name: 'S93031 Hinged Door Shower Screen', layout: 'pivot', catalogPage: 8,
    kind: 'straight screen with a hinged glass door and fixed panels',
    specs: { shapes: ALL_SHAPES, door: `Hinged door. ${BOTH_WAYS}`, glass: '10 mm extra-clear glass', seal: MAGNETIC, standard: '1600 × 2600 mm', custom: 'Length 900 to 1500 mm, height up to 2800 mm (door up to 2600 mm)', finishes: F_STD, handle: 'U600 solid back-to-back handle' },
  }),

  // L and T shapes
  p({
    slug: 'l99131', code: 'L99131', name: 'L99131 L-Shape Shower Enclosure', layout: 'l-t', catalogPage: 4,
    kind: 'L-shaped corner enclosure with a pivot door',
    specs: { shapes: ALL_SHAPES, door: `Pivot door. ${BOTH_WAYS}`, glass: '10 mm clear glass', seal: MAGNETIC, standard: '1400 × 1000 × 2600 mm', custom: 'Length 900 to 1500 mm, width 900 to 1300 mm, height up to 2400 mm', finishes: ['Mirror steel', '37° grey', 'Italian matte gold'], handle: 'Long handle' },
  }),
  p({
    slug: 'l15431', code: 'L15431', name: 'L15431 Curved Corner Shower Enclosure', layout: 'l-t', catalogPage: 4,
    kind: 'corner enclosure with curved glass and a pivot door',
    specs: { shapes: ALL_SHAPES, door: `Pivot door. ${BOTH_WAYS}`, glass: '10 mm extra-clear glass', seal: MAGNETIC, standard: '1600 × 1100 × 2300 mm', custom: 'Length 900 to 1500 mm, width 900 to 1500 mm, height up to 2300 mm with curved glass or 2800 mm with straight glass', finishes: ['Mirror steel', 'Champagne gold', 'Rose gold', 'Black titanium', 'Zirconium moon gold'], handle: 'U703 solid back-to-back handle' },
  }),
  p({
    slug: 't98152', code: 'T98152', name: 'T98152 T-Shape Shower Enclosure', layout: 'l-t', catalogPage: 3,
    kind: 'T-shaped enclosure with two pivot doors and fixed panels',
    image: img('catalog/card-t98152.jpg'), imageIsPhoto: true,
    photos: [{ src: img('catalog/scene-t98152.jpg'), alt: 'T98152 T-shaped shower enclosure with two pivot doors and a brushed gold frame in a white room' }],
    specs: { shapes: ALL_SHAPES, door: `Two pivot doors. ${BOTH_WAYS}`, glass: '10 mm extra-clear glass', seal: MAGNETIC, standard: '2400 × 1200 × 2600 mm', custom: 'Length 1200 to 3000 mm, width 1000 to 1300 mm, height up to 3000 mm', finishes: F_MOON, handle: 'Crystal handle' },
  }),
  p({
    slug: 't93152', code: 'T93152', name: 'T93152 T-Shape Shower Enclosure', layout: 'l-t', catalogPage: 7,
    kind: 'T-shaped enclosure with two pivot doors and fixed panels',
    image: img('catalog/card-t93152.jpg'), imageIsPhoto: true,
    photos: [{ src: img('catalog/scene-t93152.jpg'), alt: 'T93152 T-shaped shower enclosure with two pivot doors and a rose gold frame' }],
    specs: { door: `Two pivot doors. ${BOTH_WAYS}`, glass: '10 mm clear glass', seal: MAGNETIC, standard: '2400 × 1100 × 2300 mm', custom: 'Length 1200 to 3000 mm, width 1000 to 1300 mm, height up to 3000 mm', finishes: F_MOON, handle: 'U604 solid large L-shaped handle' },
  }),

  // Panoramic
  p({
    slug: 's890', code: 'S890', name: 'S890 Panoramic Sliding Door', layout: 'panoramic', catalogPage: 13,
    kind: 'panoramic sliding system with two fixed and two sliding panels',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Two fixed panels, two sliding panels', glass: '8 mm clear glass', seal: 'Seal system optional', standard: 'Panels 600 to 1200 mm wide, 2000 to 2440 mm high', custom: 'Panels 600 to 1200 mm wide, 2000 to 3000 mm high', finishes: F_BRUSHED, handle: 'U904 handle' },
  }),
  p({
    slug: 'singletrack', code: 'Single track', name: 'Single-Track Panoramic Sliding Door', layout: 'panoramic', catalogPage: 14,
    kind: 'single-track panoramic sliding door',
    specs: { shapes: ['Straight', 'L-shape'], door: 'Sliding panels on a single track', glass: '8 mm clear glass', seal: 'Rebound stopper optional', standard: 'Panels 600 to 1200 mm wide, 2000 to 2440 mm high', custom: 'Panels 600 to 1200 mm wide, 2000 to 3000 mm high', finishes: F_BRUSHED, handle: 'U904 handle' },
  }),

  // Bathroom door
  p({
    slug: 'bathroomdoor', code: 'Bathroom door', name: 'Framed Glass Bathroom Door', layout: 'bathroom-door', catalogPage: 14,
    kind: 'framed glass bathroom door',
    specs: { shapes: ['Single door'], door: 'Opens outwards or inwards', glass: '4 + 4 mm laminated wired glass', standard: '800 mm wide, 2000 to 2440 mm high', custom: '800 mm wide, 2000 to 2800 mm high', finishes: F_BRUSHED },
  }),
]

export const productsIn = (id: LayoutId) => products.filter((x) => x.layout === id)
export const productUrl = (x: Product) => `/products/${layoutById(x.layout).slug}/${x.slug}/`
export const layoutUrl = (l: Layout) => `/products/${l.slug}/`

/** One factual sentence built from the printed specifications. */
export function summary(x: Product): string {
  if (!x.specs) {
    return `${x.code} is a ${x.kind}, shown here in four frame finishes. Sizes are made to order: send your measurements and we will quote.`
  }
  const s = x.specs
  const made = s.custom.charAt(0).toLowerCase() + s.custom.slice(1)
  const n = s.finishes.length
  const count = n === 1 ? 'one' : ['two', 'three', 'four', 'five', 'six'][n - 2] ?? String(n)
  return `${x.code} is a ${x.kind}. The standard size is ${s.standard}, and it can be made to measure: ${made}. It comes with ${s.glass.toLowerCase()}, in a choice of ${count} frame finish${n === 1 ? '' : 'es'}.`
}

/** The matching choice in the inquiry form's Layout list. */
export const formLayout: Record<LayoutId, string> = {
  sliding: 'Sliding doors',
  'neo-angle': 'Neo-angle corner',
  pivot: 'Pivot or hinged door',
  'l-t': 'L or T shape',
  panoramic: 'Panoramic sliding',
  'bathroom-door': 'Bathroom door',
}
