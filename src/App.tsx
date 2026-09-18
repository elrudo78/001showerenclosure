import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import brandLogo from './assets/brand/dulifei-logo.png'

const assetModules = import.meta.glob('./assets/**/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const asset = (path: string) => assetModules[`./assets/${path}`]

const nav = [
  ['/', 'Home'], ['/products', 'Products'], ['/factory', 'Factory'],
  ['/projects', 'Projects'], ['/certifications', 'Certifications'],
  ['/about', 'About'], ['/contact', 'Contact'],
] as const

const productImages = Array.from({ length: 20 }, (_, i) => asset(`products/product-${String(i + 1).padStart(2, '0')}.webp`))
const factoryImages = Array.from({ length: 12 }, (_, i) => asset(`factory/factory-${String(i + 1).padStart(2, '0')}.webp`))
const projectImages = Array.from({ length: 18 }, (_, i) => asset(`projects/project-${String(i + 1).padStart(2, '0')}.webp`))

const pageMeta: Record<string, [string, string]> = {
  '/': ['Shower Enclosure Manufacturer | Dulifei', 'Explore shower enclosures, manufacturing capabilities, completed installations and supporting supplier documentation.'],
  '/products': ['Shower Enclosures & Shower Doors | Dulifei', 'Explore Dulifei shower enclosure and shower door designs for distribution, project and OEM or ODM requirements.'],
  '/factory': ['Shower Enclosure Manufacturing | Dulifei', 'See Dulifei production environments, manufacturing processes and quality-focused workmanship.'],
  '/projects': ['Shower Enclosure Projects | Dulifei', 'View a curated gallery of completed shower enclosure and bathroom installations.'],
  '/certifications': ['Documentation & Compliance | Dulifei', 'Review available supplier safety-glass documentation supporting product and compliance discussions.'],
  '/about': ['About Dulifei Shower Enclosures', 'Learn about Dulifei product development, manufacturing, customization and B2B cooperation.'],
  '/contact': ['Get a Quote | Dulifei Shower Enclosures', 'Contact Dulifei to discuss shower enclosure products, project requirements and OEM or ODM cooperation.'],
}

function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const [title, description] = pageMeta[pathname] || ['Page Not Found | Dulifei', 'The requested page could not be found.']
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = description
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle) }
    ogTitle.content = title
    let ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (!ogDescription) { ogDescription = document.createElement('meta'); ogDescription.setAttribute('property', 'og:description'); document.head.appendChild(ogDescription) }
    ogDescription.content = description
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Mark() {
  return <Link className="mark" to="/" aria-label="Dulifei home"><img src={brandLogo} alt="Dulifei London" /></Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    if (!open) return () => document.body.classList.remove('menu-open')
    const focusable = Array.from(navRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || [])
    focusable[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])
  return <header className="site-header">
    <div className="header-inner">
      <Mark />
      <button ref={menuButtonRef} className="menu-button" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        <span/><span/>
      </button>
      <nav ref={navRef} id="main-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
        {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        <Link className="button button-small nav-cta" to="/contact">Get a Quote <Arrow /></Link>
      </nav>
    </div>
  </header>
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-lead container">
      <p className="eyebrow light">Start a conversation</p>
      <h2>Have a product or project in mind?</h2>
      <Link className="button button-invert" to="/contact">Discuss Your Project <Arrow /></Link>
    </div>
    <div className="footer-grid container">
      <div><Mark /><p>Shower enclosure solutions for international B2B cooperation.</p></div>
      <div><h3>Explore</h3>{nav.slice(1, 5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div>
      <div><h3>Company</h3>{nav.slice(5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div>
      <div><h3>Inquiries</h3><p>Tell us about your product, market or project requirements.</p><Link to="/contact">Request a quote <Arrow /></Link></div>
    </div>
    <div className="footer-bottom container"><span>© {new Date().getFullYear()} Dulifei Shower Enclosures</span><span>International B2B Website</span></div>
  </footer>
}

function Arrow() { return <span aria-hidden="true">↗</span> }

function Layout() { return <><Seo/><Header/><main><Routes>
  <Route path="/" element={<Home/>}/><Route path="/products" element={<Products/>}/><Route path="/factory" element={<Factory/>}/><Route path="/projects" element={<Projects/>}/><Route path="/certifications" element={<Certifications/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></main><Footer/></> }

type SectionHeadProps = { eyebrow: string; title: string; text?: string; action?: ReactNode }
function SectionHead({ eyebrow, title, text, action }: SectionHeadProps) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{text && <p>{text}</p>}{action}</div>
}

function Image({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />
}

function Home() {
  return <>
    <section className="hero">
      <Image src={asset('hero/product-hero.webp')} alt="Architectural shower enclosure by Dulifei" eager />
      <div className="hero-shade"/><div className="hero-content container"><p className="eyebrow light">Shower Enclosures for B2B Markets</p><h1>Premium Shower Enclosures,<br/>Built for Global Markets</h1><p className="hero-copy">Explore shower enclosure solutions for distribution, wholesale, development, and project-based procurement.</p><div className="button-row"><Link className="button button-invert" to="/products">Explore Products <Arrow /></Link><Link className="text-link light" to="/contact">Get a Quote <Arrow /></Link></div></div>
      <div className="hero-note">Product-focused design<br/>Manufacturing-backed delivery</div>
    </section>

    <section className="section intro container"><SectionHead eyebrow="Product portfolio" title="Engineered around the way spaces are built." text="Explore a visual selection of shower enclosure formats suited to distribution, specification, and project applications." /></section>
    <section className="category-strip container">
      {[
        [productImages[0], 'Sliding Enclosures'], [productImages[3], 'Hinged Enclosures'], [productImages[6], 'Walk-In Screens']
      ].map(([img, name], i) => <Link className={`category-card card-${i+1}`} to="/products" key={name}><Image src={img} alt={`${name} product`}/><span>{name}</span><Arrow/></Link>)}
    </section>

    <section className="section dark-section"><div className="container"><SectionHead eyebrow="A considered approach" title="From product intent to finished enclosure." text="Dulifei brings product presentation, manufacturing capability, and responsive B2B cooperation together in one focused process."/><div className="principles">
      {[['01','Product development','A practical approach to enclosure design, configuration, and finish selection.'],['02','Manufacturing focus','Real production environments and workmanship behind every product conversation.'],['03','Flexible cooperation','Support for distribution, project sourcing, and OEM or ODM requirements.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
    </div></div></section>

    <section className="section container"><SectionHead eyebrow="Selected products" title="Clean lines. Versatile formats." action={<Link className="text-link" to="/products">View all products <Arrow/></Link>}/><div className="product-grid featured">{productImages.slice(1,7).map((src,i)=><article className="product-card" key={src}><div className="media"><Image src={src} alt={`Selected shower enclosure design ${i+1}`}/></div><h3>{['Sliding Door Enclosure','Corner Shower Enclosure','Hinged Door Enclosure','Framed Shower Enclosure','Minimal Shower Screen','Custom Enclosure Solution'][i]}</h3><p>Contact us for specifications.</p></article>)}</div></section>

    <section className="split-feature"><div className="split-image"><Image src={factoryImages[0]} alt="Dulifei shower enclosure production environment"/></div><div className="split-copy"><p className="eyebrow light">Manufacturing</p><h2>Made where product detail matters.</h2><p>Our manufacturing story is grounded in real production environments, practical workmanship, and attention to product quality.</p><Link className="button button-invert" to="/factory">Explore Our Factory <Arrow/></Link></div></section>

    <section className="section container"><SectionHead eyebrow="Installed work" title="Enclosures in real spaces." text="A selection of completed installations, presented without unsupported project names or locations." action={<Link className="text-link" to="/projects">View projects <Arrow/></Link>}/><div className="project-preview">{projectImages.slice(0,4).map((src,i)=><div key={src} className={`preview-${i+1}`}><Image src={src} alt={`Completed shower enclosure installation ${i+1}`}/></div>)}</div></section>

    <section className="section cert-band"><div className="container cert-band-inner"><div><p className="eyebrow">Documented materials</p><h2>Compliance information, presented with care.</h2></div><p>Review the supplier documentation currently approved for public presentation. Contact our team if your market requires specific documentation.</p><Link className="text-link" to="/certifications">View documentation <Arrow/></Link></div></section>
    <section className="section container custom-section"><p className="eyebrow">OEM & ODM cooperation</p><h2>Bring your product direction.<br/>We’ll start with the right questions.</h2><p>Share your target application, preferred enclosure format, finish direction, and project context. Our team can discuss a suitable cooperation path.</p><Link className="button" to="/contact">Start an Inquiry <Arrow/></Link></section>
  </>
}

const productNames = ['Sliding Door Enclosure','Corner Sliding Enclosure','Hinged Door Enclosure','Corner Hinged Enclosure','Walk-In Shower Screen','Framed Enclosure','Minimal Frame Enclosure','Wall-to-Wall Enclosure','Corner Entry Enclosure','Pivot Door Enclosure','Single Panel Screen','Bath Screen','Compact Space Enclosure','Architectural Glass Enclosure','Black Frame Enclosure','Polished Finish Enclosure','Project Shower Enclosure','Residential Enclosure','Custom Configuration','OEM & ODM Solution']

function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: string; text: string; image?: string }) {
  return <section className={image ? 'page-hero has-image' : 'page-hero'}>{image && <Image src={image} alt="" eager/>}<div className="page-hero-overlay"/><div className="container page-hero-content"><p className={image ? 'eyebrow light':'eyebrow'}>{eyebrow}</p><h1>{title}</h1><p>{text}</p></div></section>
}

function Products() { return <><PageHero eyebrow="Product range" title="Shower enclosures designed for considered spaces." text="Explore enclosure formats for distribution, project specification, and OEM or ODM cooperation." image={productImages[8]}/><section className="section container"><div className="filter-note"><span>Selected portfolio</span><span>Specifications available on request</span></div><div className="product-grid catalog">{productImages.map((src,i)=><article className="product-card" key={src}><div className="media"><Image src={src} alt={`${productNames[i]} by Dulifei`}/></div><h2>{productNames[i]}</h2><p>Contact us for specifications.</p></article>)}</div></section><ProcessCTA/></> }

function Factory() { return <><PageHero eyebrow="Manufacturing" title="A closer look at where the work happens." text="Real views of the Dulifei production environment, processes, equipment, and hands-on workmanship." image={factoryImages[1]}/><section className="section container"><SectionHead eyebrow="Inside the factory" title="Production in focus." text="These images document the people, environments, and process behind the finished enclosures. Detailed capability requirements can be discussed directly with our team."/><div className="factory-gallery">{factoryImages.map((src,i)=><figure key={src} className={`factory-${i+1}`}><Image src={src} alt={`Dulifei manufacturing environment view ${i+1}`}/><figcaption>{i % 3 === 0 ? 'Production environment' : i % 3 === 1 ? 'Manufacturing process' : 'Product workmanship'}</figcaption></figure>)}</div></section><section className="section pale"><div className="container"><SectionHead eyebrow="How we work" title="A practical path from requirement to production."/><div className="steps">{['Share your requirements','Review product direction','Confirm project details','Proceed with production planning'].map((x,i)=><div key={x}><span>0{i+1}</span><h3>{x}</h3></div>)}</div></div></section><ProcessCTA/></> }

function Projects() { return <><PageHero eyebrow="Completed installations" title="Shower enclosures in lived-in spaces." text="A visual record of completed bathroom installations using approved project photography." image={projectImages[3]}/><section className="section container"><SectionHead eyebrow="Project gallery" title="Real installations. Varied applications." text="Project identities and locations are not shown where they have not been verified for public use."/><div className="masonry-grid">{projectImages.map((src,i)=><figure key={src}><Image src={src} alt={`Completed shower enclosure installation ${i+1}`}/><figcaption>{i%3===0?'Custom Bathroom Installation':i%3===1?'Residential Installation':'Shower Enclosure Project'}</figcaption></figure>)}</div></section><ProcessCTA/></> }

const certs = [
  [asset('certifications/cert-sgcc.webp'),'SGCC Authorization','Supplier document'],
  [asset('certifications/cert-asnz.webp'),'AS/NZS 2208 StandardsMark Licence','Supplier document'],
  [asset('certifications/cert-ce.webp'),'EN 12150 Tempered Glass Test Report','Supplier report'],
]
function Certifications() { return <><PageHero eyebrow="Documentation" title="Supporting Safety-Glass Documentation" text="A focused presentation of approved public supplier materials. Contact us to discuss documentation relevant to your market or project."/><section className="section container"><div className="cert-grid">{certs.map(([src,title,text])=><article key={title}><div className="cert-image"><Image src={src} alt={`${title} document preview`}/></div><p className="eyebrow">Documentation</p><h2>{title}</h2><p>{text}</p></article>)}</div><div className="cert-disclaimer"><strong>Important document context</strong><p>These materials relate to the named glass suppliers. Their scope, current applicability, and relevance to a specific Dulifei product or destination market must be confirmed before use.</p></div><div className="disclosure"><h2>Need documentation for a specific market?</h2><p>Requirements vary by product and destination. Tell us what you need so the appropriate available material can be reviewed with you.</p><Link className="button" to="/contact">Contact Our Team <Arrow/></Link></div></section></> }

function About() { return <><PageHero eyebrow="About Dulifei" title="Product thinking, manufacturing focus, and open collaboration." text="Dulifei works with international B2B buyers across shower enclosure sourcing, product development, and project requirements."/><section className="section container about-grid"><div><p className="eyebrow">Our focus</p><h2>Shower enclosures, thoughtfully developed.</h2></div><div><p>Our work centers on shower enclosure products and the manufacturing decisions behind them—from overall configuration and visual proportion to the details that shape a finished installation.</p><p>We support conversations with distributors, importers, wholesalers, project buyers, contractors, and OEM or ODM partners. Each inquiry begins with the buyer’s real requirements, not assumptions.</p></div></section><section className="about-image"><Image src={factoryImages[4]} alt="Work inside the Dulifei production environment"/></section><section className="section container"><SectionHead eyebrow="B2B cooperation" title="A direct, product-led way of working."/><div className="principles light-principles">{[['01','Understand the brief','We begin with the intended product, application, market, and project context.'],['02','Discuss the options','Available configurations and cooperation requirements are reviewed clearly.'],['03','Move forward together','Next steps are shaped around the confirmed scope and information available.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section><ProcessCTA/></> }

function Contact() {
  const [submitted,setSubmitted] = useState(false)
  const [errors,setErrors] = useState<Record<string,string>>({})
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f=new FormData(e.currentTarget); const next:Record<string,string>={}; if(!String(f.get('name')||'').trim()) next.name='Please enter your name.'; if(!String(f.get('company')||'').trim()) next.company='Please enter your company.'; const email=String(f.get('email')||''); if(!/^\S+@\S+\.\S+$/.test(email)) next.email='Please enter a valid email address.'; if(!String(f.get('message')||'').trim()) next.message='Please tell us about your requirements.'; setErrors(next); if(!Object.keys(next).length) setSubmitted(true) }
  return <><PageHero eyebrow="Contact" title="Tell us what you’re looking for." text="Share your product, sourcing, or project requirements. This V1 website does not yet have a live contact endpoint."/><section className="section container contact-layout"><div className="contact-aside"><p className="eyebrow">Get a quote</p><h2>Start with the essentials.</h2><p>Include the enclosure type, target market, application, preferred finishes, or any known project requirements.</p><div className="contact-list"><span>Product sourcing</span><span>Project requirements</span><span>OEM & ODM cooperation</span><span>Documentation requests</span></div></div><form className="inquiry-form" noValidate onSubmit={submit}>
    <Field label="Name" name="name" required error={errors.name}/><Field label="Company" name="company" required error={errors.company}/><Field label="Country or Region" name="region"/><Field label="Email" name="email" type="email" required error={errors.email}/><Field label="WhatsApp" name="whatsapp"/><label>Product Interest<select name="interest" defaultValue=""><option value="" disabled>Select an area</option><option>Shower Enclosures</option><option>Shower Doors</option><option>Project Requirements</option><option>OEM & ODM Cooperation</option><option>Certification Documentation</option></select></label><label className="full">Message <span aria-hidden="true">*</span><textarea name="message" rows={6} placeholder="Tell us about your product or project requirements." aria-invalid={!!errors.message}/>{errors.message&&<small role="alert">{errors.message}</small>}</label><div className="full form-end"><button className="button" type="submit">Send Inquiry <Arrow/></button><p>Your details are used only to respond to this inquiry.</p></div>{submitted&&<div className="form-status full" role="status"><strong>Your inquiry has not been sent.</strong><span>No contact endpoint is currently configured. Please save your message and try again when contact details are available.</span></div>}
  </form></section></>
}
function Field({label,name,type='text',required=false,error}:{label:string;name:string;type?:string;required?:boolean;error?:string}) { return <label>{label} {required&&<span aria-hidden="true">*</span>}<input name={name} type={type} aria-invalid={!!error}/>{error&&<small role="alert">{error}</small>}</label> }

function ProcessCTA() { return <section className="section process-cta"><div className="container"><p className="eyebrow light">Your requirements, clearly discussed</p><h2>Looking for a product or project partner?</h2><p>Contact us to discuss available products, specifications, customization, and B2B cooperation.</p><Link className="button button-invert" to="/contact">Get a Quote <Arrow/></Link></div></section> }
function NotFound() { return <section className="not-found container"><p className="eyebrow">404</p><h1>Page not found.</h1><p>The page you requested does not exist or may have moved.</p><Link className="button" to="/">Return Home <Arrow/></Link></section> }

export default function App() { return <Layout/> }
