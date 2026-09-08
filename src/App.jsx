import React from 'react'
import AdminPage from './AdminPage.jsx'
import { GeoAPI } from 'ua-geo-set'
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  Leaf,
  Ruler,
  CreditCard,
  MapPin,
  Phone,
  User,
  Heart,
  Clock3,
  Star,
  Bell,
  Monitor,
  Smartphone,
  LayoutDashboard,
  Send,
  BadgeCheck,
  Rocket,
} from 'lucide-react'

const NAV_LINKS = [
  ['/', 'Головна'],
  ['/catalog', 'Каталог'],
  ['/about', 'Про нас'],
  ['/delivery', 'Доставка'],
  ['/contacts', 'Контакти'],
]

const HOME_CATEGORIES = [
  ['Дивани', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'],
  ['Ліжка', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
  ['Шафи', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'],
  ['Столи', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'],
]

const GALLERY_POOL = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
]

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Диван «Осло»', price: 24900, category: 'Дивани', image: GALLERY_POOL[0], shortDescription: 'М’який диван у скандинавському стилі для вітальні.', description: 'Лаконічний диван із глибокою посадкою, зносостійкою тканиною та надійним дерев’яним каркасом.', dimensions: '220 × 95 × 82 см', material: 'Бук, фанера, велюр', colors: ['Бежевий', 'Сірий', 'Графіт'], availability: 'В наявності', specs: ['Каркас із натурального дерева', 'Наповнення HR-піна', 'Знімні подушки'], gallery: GALLERY_POOL },
  { id: 2, name: 'Ліжко «Верден»', price: 31400, category: 'Ліжка', image: GALLERY_POOL[1], shortDescription: 'Комфортне двоспальне ліжко з м’яким узголів’ям.', description: 'Ліжко з високим узголів’ям, міцною ламельною основою та спокійним сучасним дизайном.', dimensions: '180 × 215 × 110 см', material: 'Дерево, текстиль', colors: ['Молочний', 'Сірий', 'Оливковий'], availability: 'Під замовлення 7–14 днів', specs: ['Ламельна основа', 'Посилений каркас', 'Безшумна конструкція'], gallery: GALLERY_POOL.slice().reverse() },
  { id: 3, name: 'Шафа «Тарту»', price: 27800, category: 'Шафи', image: GALLERY_POOL[2], shortDescription: 'Містка шафа з мінімалістичними фасадами.', description: 'Продумане внутрішнє наповнення, велика кількість полиць і секція для довгого одягу.', dimensions: '180 × 60 × 230 см', material: 'МДФ, ЛДСП', colors: ['Білий', 'Дуб', 'Графіт'], availability: 'В наявності', specs: ['Фурнітура з доводчиками', 'Регульовані полиці', 'Матове покриття'], gallery: GALLERY_POOL },
  { id: 4, name: 'Комод «Брюгге»', price: 12900, category: 'Комоди', image: GALLERY_POOL[3], shortDescription: 'Компактний комод на шість містких шухляд.', description: 'Практичний комод для спальні або вітальні з плавним закриванням шухляд.', dimensions: '120 × 45 × 78 см', material: 'МДФ, дерево', colors: ['Дуб', 'Чорний', 'Бежевий'], availability: 'В наявності', specs: ['6 шухляд', 'Доводчики', 'Металеві ручки'], gallery: GALLERY_POOL },
  { id: 5, name: 'Стіл «Ольден»', price: 18600, category: 'Столи', image: GALLERY_POOL[3], shortDescription: 'Обідній стіл з натуральною текстурою дерева.', description: 'Стійкий обідній стіл, який добре пасує до сучасних інтер’єрів.', dimensions: '160 × 90 × 75 см', material: 'Масив дуба, метал', colors: ['Натуральний дуб', 'Темний дуб'], availability: 'В наявності', specs: ['Масив дерева', 'Порошкове фарбування ніжок', 'Захисне покриття'], gallery: GALLERY_POOL },
  { id: 6, name: 'Стілець «Мілан»', price: 3200, category: 'Стільці', image: GALLERY_POOL[1], shortDescription: 'Зручний стілець із м’якою спинкою.', description: 'Універсальний стілець для кухні, вітальні або домашнього кабінету.', dimensions: '48 × 55 × 84 см', material: 'Метал, тканина', colors: ['Бежевий', 'Сірий', 'Зелений'], availability: 'В наявності', specs: ['М’яке сидіння', 'Зносостійка тканина', 'Стійкий каркас'], gallery: GALLERY_POOL },
  { id: 7, name: 'Кухня «Нордік»', price: 68000, category: 'Кухні', image: GALLERY_POOL[2], shortDescription: 'Модульна кухня у сучасному скандинавському стилі.', description: 'Комплект кухонних модулів із продуманим зберіганням та можливістю зміни конфігурації.', dimensions: 'від 240 см', material: 'МДФ, ЛДСП, HPL', colors: ['Білий', 'Дуб', 'Кашемір'], availability: 'Під замовлення', specs: ['Модульна система', 'Доводчики', 'Стільниця HPL'], gallery: GALLERY_POOL },
  { id: 8, name: 'Крісло офісне «Аксіс»', price: 5400, category: 'Офісні меблі', image: GALLERY_POOL[0], shortDescription: 'Ергономічне крісло для тривалої роботи.', description: 'Підтримка попереку, регулювання висоти й зручна посадка для домашнього офісу.', dimensions: '62 × 62 × 115 см', material: 'Сітка, пластик, метал', colors: ['Чорний', 'Сірий'], availability: 'В наявності', specs: ['Газліфт', 'Регулювання нахилу', 'Підтримка попереку'], gallery: GALLERY_POOL },
]


const geo = new GeoAPI()
const REGION_MAP = new Map(geo.getAllRegions().map(item => [item.id, item]))
const DISTRICT_MAP = new Map(geo.getAllRegionDistricts().map(item => [item.id, item]))
const COMMUNITY_MAP = new Map(geo.getAllCommunities().map(item => [item.id, item]))

const SETTLEMENT_TYPE = {
  City: 'м.',
  CitySpecial: 'м.',
  Urban: 'с-ще',
  Village: 'с.',
}

function settlementMeta(item) {
  const region = item.regionId ? REGION_MAP.get(item.regionId) : null
  const parentCommunity = item.parentId ? COMMUNITY_MAP.get(item.parentId) : null
  const parentDistrict = item.parentId ? DISTRICT_MAP.get(item.parentId) : null
  const district = parentCommunity?.districtId ? DISTRICT_MAP.get(parentCommunity.districtId) : parentDistrict
  return {
    regionName: region?.nameFull || region?.name || '',
    districtName: district?.nameFull || district?.name || '',
    communityName: parentCommunity?.nameFull || parentCommunity?.name || '',
  }
}

function SettlementPicker({ value, selected, onChange, onSelect }) {
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState([])
  const wrapperRef = React.useRef(null)

  React.useEffect(() => {
    const q = value.trim()
    if (selected && value === selected.name) {
      setResults([])
      return
    }
    if (q.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      const found = geo.searchSettlementsByName(q)
        .filter(item => item?.name)
        .slice(0, 12)
      setResults(found)
      setOpen(true)
    }, 120)
    return () => clearTimeout(timer)
  }, [value, selected])

  React.useEffect(() => {
    const close = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return <div className="settlement-picker" ref={wrapperRef}>
    <input
      required
      autoComplete="off"
      placeholder="Населений пункт"
      value={value}
      onFocus={() => results.length && setOpen(true)}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Населений пункт"
    />
    {selected && <div className="selected-settlement"><Check size={15}/><span>{selected.label}</span></div>}
    {open && results.length > 0 && <div className="settlement-dropdown">
      {results.map(item => {
        const meta = settlementMeta(item)
        const type = SETTLEMENT_TYPE[item.category] || ''
        const secondary = [meta.regionName, meta.districtName, meta.communityName].filter(Boolean).join(' · ')
        return <button type="button" key={item.id} onClick={() => {
          onSelect({
            id: item.id,
            name: item.name,
            type,
            category: item.category,
            regionName: meta.regionName,
            districtName: meta.districtName,
            communityName: meta.communityName,
            label: `${type} ${item.name}${meta.regionName ? `, ${meta.regionName}` : ''}`.trim(),
          })
          setOpen(false)
        }}>
          <strong>{type} {item.name}</strong>
          {secondary && <span>{secondary}</span>}
        </button>
      })}
    </div>}
    {value.trim().length >= 2 && !selected && open && results.length === 0 && <div className="settlement-empty">Нічого не знайдено. Спробуйте іншу назву.</div>}
  </div>
}

const formatPrice = (n) => new Intl.NumberFormat('uk-UA').format(n) + ' ₴'
const productPath = (p) => `/product/${encodeURIComponent(p?.slug || p?.id || '')}`

function productMerch(product) {
  const salePercent = Math.max(0, Math.min(95, Number(product.salePercent ?? product.sale_percent ?? 0) || 0))
  const isNew = Boolean(product.isNew ?? product.is_new)
  const bestseller = Boolean(product.bestseller ?? product.is_bestseller)
  const currentPrice = Number(product.price) || 0
  const oldPrice = Number(product.oldPrice ?? product.old_price) || (salePercent > 0 ? Math.round(currentPrice / (1 - salePercent / 100) / 100) * 100 : 0)
  return { salePercent, isNew, bestseller, currentPrice, oldPrice }
}


function productAvailability(product) {
  const mode = product.availabilityMode || product.availability_mode || (String(product.availability || '').toLowerCase().includes('під замовлення') ? 'preorder' : 'auto')
  const stock = product.stock === undefined || product.stock === null ? (String(product.availability||'').toLowerCase().includes('в наявності') ? 1 : 0) : Math.max(0, Number(product.stock || 0))
  if (mode === 'preorder') {
    const preorderText = String(product.availability || '').trim()
    const label = preorderText.toLowerCase().includes('під замовлення') ? preorderText : 'Під замовлення'
    return { mode, stock, canBuy: true, inStock: false, label, button: 'Замовити' }
  }
  if (mode === 'out') return { mode, stock, canBuy: false, inStock: false, label: 'Немає в наявності', button: 'Тимчасово недоступно' }
  return stock > 0
    ? { mode: 'auto', stock, canBuy: true, inStock: true, label: `В наявності · ${stock} шт.`, button: 'Додати в кошик' }
    : { mode: 'auto', stock, canBuy: false, inStock: false, label: 'Немає в наявності', button: 'Тимчасово недоступно' }
}

function customerAvailabilityInfo(product) {
  const a = productAvailability(product)
  if (a.mode === 'preorder') {
    const term = String(a.label || '').replace(/^Під замовлення\s*/i, '').trim()
    return {
      ...a,
      tone: 'preorder',
      title: 'Під замовлення',
      detail: term ? `Орієнтовний термін: ${term}` : 'Термін поставки уточнюється після оформлення.',
      note: 'Замовлення можна оформити вже зараз.'
    }
  }
  if (a.inStock) {
    return {
      ...a,
      tone: a.stock <= 3 ? 'low' : 'in-stock',
      title: 'В наявності',
      detail: a.stock <= 3 ? `Залишилось лише ${a.stock} шт.` : `На складі: ${a.stock} шт.`,
      note: 'Товар доступний для оформлення.'
    }
  }
  return {
    ...a,
    tone: 'out',
    title: 'Немає в наявності',
    detail: 'Зараз товар відсутній на складі.',
    note: 'Оформлення тимчасово недоступне.'
  }
}

function materialTokens(product) {
  return String(product.material || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
}

function categoryPath(category) {
  return `/category/${encodeURIComponent(category)}`
}

function Header({ navigate, cartCount, favoriteCount=0, recentCount=0, settings={} }) {
  const [open, setOpen] = React.useState(false)
  return <header className="header">
    <div className="container header-inner">
      <button className="logo" onClick={() => navigate('/')}>{settings.logoUrl?<img className="store-logo-img" src={settings.logoUrl} alt={settings.storeName || 'NordHome'}/>:settings.storeName || 'NordHome'}</button>
      <nav className="desktop-nav">{NAV_LINKS.map(([path,label]) => <button key={path} onClick={() => navigate(path)}>{label}</button>)}</nav>
      <div className="header-actions">
        <button className="wishlist-header-button" onClick={() => navigate('/favorites')} aria-label="Обране" title="Обране"><Heart size={20}/>{favoriteCount > 0 && <span>{favoriteCount}</span>}</button>
        <button className="recent-header-button" onClick={() => navigate('/recent')} aria-label="Нещодавно переглянуті" title="Нещодавно переглянуті"><Clock3 size={20}/>{recentCount > 0 && <span>{recentCount}</span>}</button>
        <button className="account-button" onClick={() => navigate('/account')} aria-label="Особистий кабінет"><User size={20}/><span>Кабінет</span></button>
        <button className="cart-button" onClick={() => navigate('/cart')} aria-label="Кошик"><ShoppingCart size={21}/>{cartCount > 0 && <span>{cartCount}</span>}</button>
        <button className="menu-button" onClick={() => setOpen(v => !v)}>{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
    {open && <div className="mobile-nav">{NAV_LINKS.map(([path,label]) => <button key={path} onClick={() => {navigate(path); setOpen(false)}}>{label}</button>)}<button onClick={()=>{navigate('/favorites');setOpen(false)}}>Обране</button><button onClick={()=>{navigate('/recent');setOpen(false)}}>Нещодавно переглянуті</button><button onClick={()=>{navigate('/account');setOpen(false)}}>Особистий кабінет</button><button onClick={()=>{navigate('/track-order');setOpen(false)}}>Статус замовлення</button></div>}
  </header>
}

function Footer({ navigate, settings={} }) {
  const storeName=settings.storeName || 'NordHome'
  const city=settings.city || 'Львів'
  return <footer className="footer"><div className="container footer-grid"><div><div className="logo footer-logo">{settings.logoUrl?<img className="store-logo-img footer-store-logo" src={settings.logoUrl} alt={storeName}/>:storeName}</div><p>{settings.footerText || 'Сучасні меблі для дому та офісу.'}</p></div><div><strong>Контакти</strong>{settings.phone&&<p>{settings.phone}</p>}{settings.email&&<p>{settings.email}</p>}<p>{city}, Україна</p>{settings.instagram&&<p>{settings.instagram}</p>}</div><div><strong>Для покупця</strong><button className="footer-customer-link" onClick={()=>navigate('/track-order')}>Статус замовлення</button><button className="footer-customer-link" onClick={()=>navigate('/delivery')}>Доставка та оплата</button><button className="footer-customer-link" onClick={()=>navigate('/returns')}>Повернення та обмін</button><button className="footer-customer-link" onClick={()=>navigate('/offer')}>Публічна оферта</button><button className="footer-customer-link" onClick={()=>navigate('/privacy')}>Політика конфіденційності</button></div></div><div className="container footer-bottom"><span>© {storeName}</span><span>Меблі для дому та офісу</span></div></footer>
}

function ProductCard({ product, navigate, isFavorite=false, onToggleFavorite }) {
  const availability = productAvailability(product)
  const merch = productMerch(product)
  return <article className="product-card" onClick={() => navigate(productPath(product))}>
    <div className="product-card-media">
      <img src={product.image} alt={product.name}/>
      {onToggleFavorite && <button type="button" className={`favorite-button ${isFavorite?'active':''}`} aria-label={isFavorite?'Прибрати з обраного':'Додати в обране'} onClick={(e)=>{e.stopPropagation();onToggleFavorite(product.id)}}><Heart size={19} fill={isFavorite?'currentColor':'none'}/></button>}
      <div className="product-badges">
        {merch.salePercent > 0 && <span className="product-flag sale">−{merch.salePercent}%</span>}
        {merch.isNew && <span className="product-flag new">Новинка</span>}
        {merch.bestseller && <span className="product-flag hit">Хіт</span>}
      </div>
      <span className={`product-stock-badge ${availability.mode==='preorder'?'preorder':availability.inStock?'in-stock':'out-stock'}`}>{availability.label}</span>
      <button type="button" className="product-view-button">Переглянути</button>
    </div>
    <div className="product-card-body">
      {product.reviewCount>0&&<div className="card-rating"><Star size={15} fill="currentColor"/><strong>{Number(product.rating).toFixed(1)}</strong><span>({product.reviewCount})</span></div>}
      <div className="product-card-meta"><button className="category-mini-link" onClick={(e)=>{e.stopPropagation();navigate(categoryPath(product.category))}}>{product.category}</button>{product.sku && <span>SKU {product.sku}</span>}</div>
      <h3>{product.name}</h3>
      <p>{product.shortDescription}</p>
      <div className={`customer-stock-line ${customerAvailabilityInfo(product).tone}`}>
        <span className="stock-dot"></span>
        <span>{customerAvailabilityInfo(product).title}</span>
        {customerAvailabilityInfo(product).inStock && customerAvailabilityInfo(product).stock <= 3 && <strong>· лише {customerAvailabilityInfo(product).stock} шт.</strong>}
      </div>
      <div className="product-card-bottom"><div className="card-price-stack"><strong>{formatPrice(merch.currentPrice)}</strong>{merch.oldPrice > merch.currentPrice && <del>{formatPrice(merch.oldPrice)}</del>}</div><span>Детальніше →</span></div>
    </div>
  </article>
}

function HomePage({ navigate, products, favorites=[], onToggleFavorite, settings={} }) {
  return <>
    <section className="hero"><div className="container hero-content"><p className="eyebrow">{settings.heroEyebrow || 'Меблі, створені для життя'}</p><h1>{settings.heroTitle || 'Сучасний комфорт у кожній деталі'}</h1><p>{settings.heroText || 'Колекція функціональних меблів у спокійному скандинавському стилі.'}</p><div className="hero-actions"><button className="primary" onClick={() => navigate('/catalog')}>Перейти до каталогу</button><button className="hero-secondary" onClick={() => navigate('/delivery')}>Доставка по Україні</button></div></div></section>
    <section className="home-proof"><div className="container home-proof-grid"><div><strong>{products.length}+</strong><span>моделей у каталозі</span></div><div><strong>Україна</strong><span>доставка Новою поштою</span></div><div><strong>5 років</strong><span>гарантії на окремі моделі</span></div></div></section>
    <section className="section container"><div className="section-title split-title"><div><p className="eyebrow">Категорії</p><h2>Оберіть меблі для свого простору</h2></div><button className="text-link" onClick={()=>navigate('/catalog')}>Увесь каталог →</button></div><div className="category-grid">{HOME_CATEGORIES.map(([name,img]) => <button className="category-card" key={name} onClick={() => navigate(categoryPath(name))}><div><img src={img} alt={name}/></div><span>{name}<small>Переглянути колекцію</small></span></button>)}</div></section>
    <section className="section muted"><div className="container"><div className="section-title split-title"><div><p className="eyebrow">Популярне</p><h2>Моделі, які обирають найчастіше</h2></div><button className="text-link" onClick={()=>navigate('/catalog')}>Дивитися всі →</button></div><div className="product-grid">{products.filter(p=>productMerch(p).bestseller).slice(0,4).concat(products.filter(p=>!productMerch(p).bestseller)).slice(0,4).map(p => <ProductCard key={p.id} product={p} navigate={navigate} isFavorite={favorites.includes(Number(p.id))} onToggleFavorite={onToggleFavorite}/>)}</div></div></section>
    <section className="section container"><div className="adv-grid">{[[Truck,'Доставка по Україні'],[ShieldCheck,'Гарантія до 5 років'],[Leaf,'Натуральні матеріали'],[Ruler,'Індивідуальні розміри']].map(([Icon,text]) => <div className="adv" key={text}><Icon/><div><strong>{text}</strong><span>Зручний сервіс NordHome</span></div></div>)}</div></section>
  </>
}

function CatalogPage({ navigate, products, initialCategory = 'Усі', favorites=[], onToggleFavorite }) {
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState(initialCategory || 'Усі')
  const [sort, setSort] = React.useState('popular')
  const [onlyInStock, setOnlyInStock] = React.useState(false)
  const [special, setSpecial] = React.useState('Усі')
  const [selectedMaterials, setSelectedMaterials] = React.useState([])
  const [selectedColors, setSelectedColors] = React.useState([])
  React.useEffect(()=>setCategory(initialCategory || 'Усі'),[initialCategory])
  const prices = products.map(p => Number(productMerch(p).currentPrice) || 0)
  const absoluteMax = Math.max(0, ...prices)
  const [maxPrice, setMaxPrice] = React.useState(absoluteMax)
  React.useEffect(() => setMaxPrice(current => current || absoluteMax), [absoluteMax])
  const categories = ['Усі', ...new Set(products.map(p => p.category).filter(Boolean))]
  const materials = [...new Set(products.flatMap(materialTokens))].sort((a,b)=>a.localeCompare(b,'uk'))
  const colors = [...new Set(products.flatMap(p=>Array.isArray(p.colors)?p.colors:[]))].sort((a,b)=>a.localeCompare(b,'uk'))
  const toggle = (value, setter) => setter(current => current.includes(value) ? current.filter(x=>x!==value) : [...current,value])
  const normalizedSearch = search.trim().toLowerCase()
  let filteredProducts = products.filter(p => {
    const merch = productMerch(p)
    const matchesCategory = category === 'Усі' || p.category === category
    const haystack = [p.name,p.category,p.shortDescription,p.description,p.sku,p.material,...(p.colors||[])].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch)
    const matchesStock = !onlyInStock || productAvailability(p).inStock
    const matchesPrice = merch.currentPrice <= maxPrice
    const pMaterials = materialTokens(p)
    const matchesMaterial = !selectedMaterials.length || selectedMaterials.some(x=>pMaterials.includes(x))
    const matchesColor = !selectedColors.length || selectedColors.some(x=>(p.colors||[]).includes(x))
    const matchesSpecial = special === 'Усі' || (special === 'Новинки' && merch.isNew) || (special === 'Хіти' && merch.bestseller) || (special === 'Акції' && merch.salePercent > 0)
    return matchesCategory && matchesSearch && matchesStock && matchesPrice && matchesMaterial && matchesColor && matchesSpecial
  })
  if (sort === 'priceAsc') filteredProducts = [...filteredProducts].sort((a,b)=>productMerch(a).currentPrice-productMerch(b).currentPrice)
  if (sort === 'priceDesc') filteredProducts = [...filteredProducts].sort((a,b)=>productMerch(b).currentPrice-productMerch(a).currentPrice)
  if (sort === 'name') filteredProducts = [...filteredProducts].sort((a,b)=>a.name.localeCompare(b.name,'uk'))
  if (sort === 'discount') filteredProducts = [...filteredProducts].sort((a,b)=>productMerch(b).salePercent-productMerch(a).salePercent)
  const resetFilters = () => {setSearch('');setCategory(initialCategory || 'Усі');setOnlyInStock(false);setMaxPrice(absoluteMax);setSort('popular');setSpecial('Усі');setSelectedMaterials([]);setSelectedColors([])}
  const title = initialCategory && initialCategory !== 'Усі' ? initialCategory : 'Меблі для дому та офісу'
  return <main className="catalog-page">
    <section className="catalog-hero"><div className="container"><p className="eyebrow">NordHome / {initialCategory && initialCategory !== 'Усі' ? initialCategory : 'Каталог'}</p><h1>{title}</h1><p>{initialCategory && initialCategory !== 'Усі' ? `Колекція «${initialCategory}» — добірка моделей NordHome з актуальними цінами та наявністю.` : 'Продумані форми, спокійні матеріали та моделі, які легко вписати у сучасний інтер’єр.'}</p></div></section>
    <section className="catalog-section container">
      <div className="special-tabs">{['Усі','Новинки','Хіти','Акції'].map(x=><button key={x} className={special===x?'active':''} onClick={()=>setSpecial(x)}>{x}</button>)}</div>
      <div className="catalog-topbar"><label className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук за назвою, матеріалом, кольором або SKU..."/></label><select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">За популярністю</option><option value="priceAsc">Спочатку дешевші</option><option value="priceDesc">Спочатку дорожчі</option><option value="discount">Найбільша знижка</option><option value="name">За назвою</option></select></div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="filter-head"><strong>Фільтри</strong><button onClick={resetFilters}>Очистити</button></div>
          <div className="filter-block"><span>Категорія</span><div className="filter-categories">{categories.map(c => <button className={category===c?'active':''} onClick={()=>{setCategory(c); if(c!=='Усі') window.history.replaceState({},'',categoryPath(c)); else window.history.replaceState({},'','/catalog')}} key={c}><span>{c}</span><small>{c==='Усі'?products.length:products.filter(p=>p.category===c).length}</small></button>)}</div></div>
          <div className="filter-block"><span>Матеріал</span><div className="filter-checks">{materials.map(m=><label key={m}><input type="checkbox" checked={selectedMaterials.includes(m)} onChange={()=>toggle(m,setSelectedMaterials)}/><span>{m}</span></label>)}</div></div>
          <div className="filter-block"><span>Колір</span><div className="color-filter-grid">{colors.map(c=><button key={c} className={selectedColors.includes(c)?'active':''} onClick={()=>toggle(c,setSelectedColors)}>{c}</button>)}</div></div>
          <div className="filter-block"><span>Ціна до</span><div className="price-filter-value">{formatPrice(maxPrice || 0)}</div><input className="price-range" type="range" min="0" max={absoluteMax || 1} step="100" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/><div className="range-labels"><small>0 ₴</small><small>{formatPrice(absoluteMax)}</small></div></div>
          <label className="stock-toggle"><input type="checkbox" checked={onlyInStock} onChange={e=>setOnlyInStock(e.target.checked)}/><span><strong>Тільки в наявності</strong><small>Показувати товари із залишком</small></span></label>
        </aside>
        <div className="catalog-results">
          <div className="catalog-results-head"><div><strong>{filteredProducts.length} товарів</strong><span>{category==='Усі'?'Усі категорії':category}{special!=='Усі'?` · ${special}`:''}</span></div><div className="mobile-category-chips">{categories.map(c=><button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div></div>
          {filteredProducts.length ? <div className="product-grid catalog-product-grid">{filteredProducts.map(p => <ProductCard key={p.id} product={p} navigate={navigate} isFavorite={favorites.includes(Number(p.id))} onToggleFavorite={onToggleFavorite}/>)}</div> : <div className="catalog-empty"><Search size={38}/><h3>Нічого не знайдено</h3><p>Спробуйте змінити пошук або фільтри.</p><button className="primary" onClick={resetFilters}>Скинути фільтри</button></div>}
        </div>
      </div>
    </section>
  </main>
}

function ProductReviews({productId,onRatingChanged}){const[reviews,setReviews]=React.useState([]),[name,setName]=React.useState(''),[rating,setRating]=React.useState(5),[text,setText]=React.useState(''),[message,setMessage]=React.useState(''),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false);const load=React.useCallback(async()=>{try{const r=await fetch(`/api/products/${productId}/reviews`,{cache:'no-store'}),d=await r.json();if(r.ok)setReviews(d.reviews||[])}catch{}},[productId]);React.useEffect(()=>{load()},[load]);const submit=async e=>{e.preventDefault();setBusy(true);setError('');setMessage('');try{const r=await fetch(`/api/products/${productId}/reviews`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:name,rating,text})}),d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Помилка');setName('');setRating(5);setText('');setMessage(d.message);onRatingChanged?.()}catch(e){setError(e.message)}finally{setBusy(false)}};return <section className="reviews-section"><div className="reviews-head"><div><p className="eyebrow">Відгуки покупців</p><h2>Відгуки про товар</h2></div></div><div className="reviews-layout"><div className="reviews-list">{reviews.length===0?<div className="review-empty">Ще немає опублікованих відгуків. Будьте першим.</div>:reviews.map(r=><article className="review-card" key={r.id}><div className="review-card-head"><strong>{r.customerName}</strong><div className="review-stars">{[1,2,3,4,5].map(n=><Star key={n} size={16} fill={n<=r.rating?'currentColor':'none'}/>)}</div></div><p>{r.text}</p><small>{new Date(r.createdAt).toLocaleDateString('uk-UA')}</small></article>)}</div><form className="review-form" onSubmit={submit}><h3>Залишити відгук</h3><label>Ваше ім’я<input required maxLength="120" value={name} onChange={e=>setName(e.target.value)}/></label><label>Оцінка<div className="rating-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?'active':''} onClick={()=>setRating(n)} aria-label={`${n} з 5`}><Star size={24} fill={n<=rating?'currentColor':'none'}/></button>)}</div></label><label>Відгук<textarea required minLength="3" maxLength="2000" value={text} onChange={e=>setText(e.target.value)} placeholder="Поділіться враженнями про товар"/></label>{message&&<div className="review-success">{message}</div>}{error&&<div className="form-error">{error}</div>}<button className="primary" disabled={busy}>{busy?'Надсилаємо…':'Надіслати відгук'}</button><small>Відгук з’явиться після перевірки адміністратором.</small></form></div></section>}

function ProductPage({ id, navigate, addToCart, products, isFavorite=false, favorites=[], onToggleFavorite, onViewed }) {
  const product = products.find(p => p.id === Number(id))
  const [selectedColor, setSelectedColor] = React.useState(product?.colors?.[0] || '')
  const [image, setImage] = React.useState(product?.gallery?.[0] || product?.image)
  React.useEffect(()=>{ if(product) onViewed?.(product.id) },[product?.id])
  if (!product) return <SimplePage title="Товар не знайдено" navigate={navigate}/>
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0,3)
  const gallery = product.gallery?.length ? product.gallery : [product.image]
  const availability = productAvailability(product)
  const merch = productMerch(product)
  const cartProduct = {...product, price: merch.currentPrice}
  return <main className="product-page container">
    <div className="product-breadcrumb"><button onClick={()=>navigate('/')}>Головна</button><span>/</span><button onClick={()=>navigate('/catalog')}>Каталог</button><span>/</span><span>{product.name}</span></div>
    <div className="product-detail">
      <div className="product-gallery"><div className="main-image-wrap"><img className="main-image" src={image} alt={product.name}/>{product.sku&&<span className="image-sku">SKU {product.sku}</span>}</div><div className="thumbs">{gallery.map((g,i)=><button className={image===g?'active':''} onClick={()=>setImage(g)} key={i}><img src={g} alt=""/></button>)}</div></div>
      <div className="product-info"><span className="eyebrow">{product.category}</span><div className="detail-flags">{merch.salePercent>0&&<span className="product-flag sale">−{merch.salePercent}%</span>}{merch.isNew&&<span className="product-flag new">Новинка</span>}{merch.bestseller&&<span className="product-flag hit">Хіт</span>}</div><div className="product-title-row"><div><h1>{product.name}</h1>{product.reviewCount>0&&<div className="detail-rating"><Star size={18} fill="currentColor"/><strong>{Number(product.rating).toFixed(1)}</strong><span>{product.reviewCount} відгуків</span></div>}</div><button className={`detail-favorite ${isFavorite?'active':''}`} onClick={()=>onToggleFavorite?.(product.id)}><Heart size={20} fill={isFavorite?'currentColor':'none'}/><span>{isFavorite?'В обраному':'В обране'}</span></button></div><div className="product-price-row"><div className="detail-price"><div className="big-price">{formatPrice(merch.currentPrice)}</div>{merch.oldPrice>merch.currentPrice&&<del>{formatPrice(merch.oldPrice)}</del>}</div><span className={`availability-pill ${availability.mode==='preorder'?'preorder':availability.inStock?'yes':'no'}`}>{availability.label}</span></div><p className="product-lead">{product.description}</p><div className={`customer-availability-panel ${customerAvailabilityInfo(product).tone}`}><div className="availability-panel-head"><span className="stock-dot"></span><strong>{customerAvailabilityInfo(product).title}</strong></div><p>{customerAvailabilityInfo(product).detail}</p><small>{customerAvailabilityInfo(product).note}</small></div>{product.colors?.length>0&&<div className="color-section"><strong>Колір</strong><div className="chips">{product.colors.map(c=><button className={selectedColor===c?'active':''} onClick={()=>setSelectedColor(c)} key={c}>{c}</button>)}</div></div>}<button className="primary wide product-buy" disabled={!availability.canBuy} onClick={()=>addToCart(cartProduct, selectedColor)}><ShoppingCart size={18}/>{availability.button}</button><div className="product-service"><div><Truck size={20}/><span><strong>Доставка по Україні</strong><small>Нова пошта, Укрпошта, Meest</small></span></div><div><ShieldCheck size={20}/><span><strong>Гарантія</strong><small>Умови залежать від моделі</small></span></div></div><div className="specs"><div><span>Розміри</span><strong>{product.dimensions||'Уточнюйте'}</strong></div><div><span>Матеріал</span><strong>{product.material||'Уточнюйте'}</strong></div></div>{product.specs?.length>0&&<div className="product-features"><h3>Характеристики</h3><ul>{product.specs.map(s=><li key={s}><Check size={16}/><span>{s}</span></li>)}</ul></div>}</div>
    </div>
    <ProductReviews productId={product.id}/>
    {related.length>0 && <section className="section related-section"><div className="section-title split-title"><div><p className="eyebrow">Ще варіанти</p><h2>Схожі товари</h2></div><button className="text-link" onClick={()=>navigate('/catalog')}>Увесь каталог →</button></div><div className="product-grid">{related.map(p=><ProductCard key={p.id} product={p} navigate={navigate} isFavorite={favorites.includes(Number(p.id))} onToggleFavorite={onToggleFavorite}/>)}</div></section>}
  </main>
}

function CartPage({ cart, navigate, updateQuantity, removeFromCart, products }) {
  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0)
  const rows = cart.map(item => {
    const current = products?.find(p => Number(p.id) === Number(item.id)) || item
    return { item, availability: customerAvailabilityInfo(current) }
  })
  const hasUnavailable = rows.some(row => !row.availability.canBuy)
  return <main className="section container"><div className="section-title"><p className="eyebrow">Кошик</p><h1>Ваші покупки</h1></div>{cart.length===0 ? <div className="empty"><ShoppingCart size={48}/><h2>Кошик порожній</h2><button className="primary" onClick={()=>navigate('/catalog')}>До каталогу</button></div> : <div className="cart-layout"><div className="cart-list">{rows.map(({item,availability})=><div className="cart-item" key={item.key}><img src={item.image} alt={item.name}/><div className="cart-main"><h3>{item.name}</h3><p>{item.selectedColor}</p><div className={`cart-availability ${availability.tone}`}><span className="stock-dot"></span><span>{availability.title}</span>{availability.inStock&&availability.stock<=3&&<small>· {availability.stock} шт.</small>}</div><strong>{formatPrice(item.price)}</strong></div><div className="qty"><button onClick={()=>updateQuantity(item.key,item.quantity-1)}><Minus size={16}/></button><span>{item.quantity}</span><button onClick={()=>updateQuantity(item.key,item.quantity+1)}><Plus size={16}/></button></div><button className="icon-danger" onClick={()=>removeFromCart(item.key)}><Trash2 size={18}/></button></div>)}</div><aside className="summary"><h3>Разом</h3><div><span>Товарів</span><strong>{cart.reduce((s,i)=>s+i.quantity,0)}</strong></div><div><span>Сума</span><strong>{formatPrice(total)}</strong></div>{hasUnavailable&&<div className="cart-warning">У кошику є товар, якого зараз немає в наявності.</div>}<button className="primary wide" disabled={hasUnavailable} onClick={()=>navigate('/checkout')}>Оформити замовлення</button></aside></div>}</main>
}

function NovaPoshtaPointPicker({ settlement, type, value, pointRef, onSelect }) {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [retryKey, setRetryKey] = React.useState(0)
  const clientCacheRef = React.useRef(new Map())

  React.useEffect(() => {
    if (!settlement || !['branch','parcel-locker'].includes(type)) {
      setItems([])
      setError('')
      return
    }

    const requestKey = `${settlement.name}|${settlement.regionName || ''}|${type}`
    const cached = clientCacheRef.current.get(requestKey)
    if (cached) {
      setItems(cached)
      setError('')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ settlement: settlement.name, region: settlement.regionName || '', type })
        const response = await fetch(`/api/nova-poshta/warehouses?${params.toString()}`, { signal: controller.signal })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.ok) {
          const err = new Error(result.error || 'Не вдалося завантажити список.')
          err.rateLimited = response.status === 429 || result.code === 'rate_limited'
          throw err
        }
        const list = result.warehouses || []
        clientCacheRef.current.set(requestKey, list)
        setItems(list)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.rateLimited ? 'Нова пошта тимчасово обмежила запити. Зачекайте кілька секунд і натисніть «Спробувати ще раз».' : (err.message || 'Помилка завантаження.'))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 450)

    return () => { clearTimeout(timer); controller.abort() }
  }, [settlement?.name, settlement?.regionName, type, retryKey])

  const retry = () => {
    setRetryKey(v => v + 1)
  }
  const q = search.trim().toLowerCase()
  const filtered = q ? items.filter(item => `${item.number} ${item.description} ${item.shortAddress}`.toLowerCase().includes(q)) : items

  return <div className="np-point-picker">
    <label className="field-label">{type === 'parcel-locker' ? 'Поштомат Нової пошти' : 'Відділення Нової пошти'}</label>
    {loading && <div className="delivery-status">Завантажуємо актуальний список Нової пошти…</div>}
    {error && <div className="form-error">{error}<div style={{marginTop:10}}><button type="button" className="secondary" onClick={retry}>Спробувати ще раз</button></div></div>}
    {!loading && !error && <>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук за номером або адресою" />
      <select required value={pointRef || ''} onChange={e => { const item = items.find(x => x.ref === e.target.value); if (item) onSelect(item) }}>
        <option value="">{filtered.length ? 'Оберіть зі списку' : 'Немає доступних точок'}</option>
        {filtered.map(item => <option key={item.ref} value={item.ref}>{item.description || item.shortAddress}</option>)}
      </select>
      {value && <div className="selected-settlement"><Check size={15}/><span>{value}</span></div>}
    </>}
  </div>
}

const DELIVERY_CARRIERS = [
  { id:'nova-poshta', name:'Нова пошта', short:'НП', description:'Відділення, поштомат або кур’єр', types:[['branch','Відділення'],['parcel-locker','Поштомат'],['courier','Кур’єр на адресу']] },
  { id:'ukrposhta', name:'Укрпошта', short:'УП', description:'Відділення або доставка на адресу', types:[['branch','Відділення'],['courier','Доставка на адресу']] },
  { id:'meest', name:'Meest Пошта', short:'M', description:'Відділення, поштомат або кур’єр', types:[['branch','Відділення'],['parcel-locker','Поштомат'],['courier','Кур’єр на адресу']] },
]

function DeliveryProfileEditor({ value, onChange }) {
  const d = value || {}
  const set = (patch) => onChange({...d, ...patch})
  const carrier = DELIVERY_CARRIERS.find(x=>x.id===d.carrier)
  const needsAddress = d.deliveryType === 'courier'
  const needsPoint = d.deliveryType === 'branch' || d.deliveryType === 'parcel-locker'
  return <div className="saved-delivery-editor">
    <h3><MapPin size={18}/> Збережена доставка</h3>
    <p className="field-hint">Ці дані автоматично підставлятимуться під час оформлення замовлення.</p>
    <SettlementPicker
      value={d.city||''}
      selected={d.settlement||null}
      onChange={(city)=>set({city,settlement:null,deliveryPoint:'',deliveryPointRef:''})}
      onSelect={(settlement)=>set({city:settlement.name,settlement,deliveryPoint:'',deliveryPointRef:''})}
    />
    <div className="carrier-grid compact-carriers">
      {DELIVERY_CARRIERS.map(c=><button type="button" key={c.id} className={`carrier-card ${d.carrier===c.id?'active':''}`} onClick={()=>set({carrier:c.id,deliveryType:'',deliveryPoint:'',deliveryPointRef:'',streetAddress:''})}><span className="carrier-mark">{c.short}</span><span className="carrier-copy"><strong>{c.id==='nova-poshta'?'Нова':c.id==='ukrposhta'?'Укр': 'Meest'}</strong></span>{d.carrier===c.id&&<Check className="carrier-check" size={14}/>}</button>)}
    </div>
    {carrier&&<>
      <label className="field-label">Спосіб отримання</label>
      <div className="delivery-type-grid">{carrier.types.map(([id,label])=><button type="button" key={id} className={`delivery-type ${d.deliveryType===id?'active':''}`} onClick={()=>set({deliveryType:id,deliveryPoint:'',deliveryPointRef:'',streetAddress:''})}>{label}</button>)}</div>
      {needsPoint&&d.carrier==='nova-poshta'&&<NovaPoshtaPointPicker settlement={d.settlement||null} type={d.deliveryType} value={d.deliveryPoint||''} pointRef={d.deliveryPointRef||''} onSelect={(item)=>set({deliveryPoint:item.description||item.shortAddress,deliveryPointRef:item.ref})}/>} 
      {needsPoint&&d.carrier!=='nova-poshta'&&<><label className="field-label">Відділення / поштомат</label><input value={d.deliveryPoint||''} onChange={e=>set({deliveryPoint:e.target.value})} placeholder="Номер або адреса"/></>}
      {needsAddress&&<><label className="field-label">Адреса доставки</label><input value={d.streetAddress||''} onChange={e=>set({streetAddress:e.target.value})} placeholder="Вулиця, будинок, квартира"/></>}
    </>}
    {(d.city||d.carrier||d.deliveryType||d.deliveryPoint||d.streetAddress)&&<button type="button" className="text-link clear-saved-delivery" onClick={()=>onChange({})}>Очистити збережену доставку</button>}
  </div>
}

function CheckoutPage({ cart, navigate, clearCart, onOrderPlaced }) {
  const [form, setForm] = React.useState({
    firstName: '', lastName: '', phone: '', email: '', city: '', settlement: null,
    carrier: '', deliveryType: '', deliveryPoint: '', deliveryPointRef: '', streetAddress: '', payment: '', comment: ''
  })
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState({})
  const [orderId, setOrderId] = React.useState('')
  const [promoInput,setPromoInput]=React.useState('')
  const [promo,setPromo]=React.useState(null)
  const [promoBusy,setPromoBusy]=React.useState(false)
  const [accountLoaded,setAccountLoaded]=React.useState(false)
  const [loggedCustomer,setLoggedCustomer]=React.useState(null)
  const [saveDelivery,setSaveDelivery]=React.useState(true)
  React.useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      const token=localStorage.getItem('nordhome-customer-token')||''
      if(!token){setAccountLoaded(true);return}
      try{
        const r=await fetch('/api/customer/me',{headers:{Authorization:`Bearer ${token}`}})
        const d=await r.json().catch(()=>({}))
        if(!r.ok||!d.ok||!d.customer)return
        if(cancelled)return
        const c=d.customer, sd=c.savedDelivery||{}
        setLoggedCustomer(c)
        setForm(current=>({...current,
          firstName:c.firstName||current.firstName,
          lastName:c.lastName||current.lastName,
          phone:c.phone||current.phone,
          email:c.email||current.email,
          city:sd.city||current.city,
          settlement:sd.settlement||current.settlement,
          carrier:sd.carrier||current.carrier,
          deliveryType:sd.deliveryType||current.deliveryType,
          deliveryPoint:sd.deliveryPoint||current.deliveryPoint,
          deliveryPointRef:sd.deliveryPointRef||current.deliveryPointRef,
          streetAddress:sd.streetAddress||current.streetAddress,
        }))
      }catch{}finally{if(!cancelled)setAccountLoaded(true)}
    })()
    return()=>{cancelled=true}
  },[])
  const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0)
  const total = promo ? promo.total : subtotal
  React.useEffect(()=>{setPromo(null)},[subtotal])
  const applyPromo=async()=>{setPromoBusy(true);setError('');try{const r=await fetch('/api/promo/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:promoInput,subtotal})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.error||'Промокод не застосовано.');setPromo(d)}catch(e){setPromo(null);setError(e.message)}finally{setPromoBusy(false)}}

  const carriers = DELIVERY_CARRIERS

  const selectedCarrier = carriers.find(item => item.id === form.carrier)
  const selectedDeliveryType = selectedCarrier?.types.find(([id]) => id === form.deliveryType)
  const needsAddress = form.deliveryType === 'courier'
  const needsPoint = form.deliveryType === 'branch' || form.deliveryType === 'parcel-locker'

  const digitsOnly = (value) => String(value || '').replace(/\D/g, '')
  const validPhone = (value) => {
    const digits = digitsOnly(value)
    return (digits.length === 10 && digits.startsWith('0')) || (digits.length === 12 && digits.startsWith('380'))
  }
  const validEmail = (value) => !String(value || '').trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim())
  const validateCheckout = () => {
    const errors = {}
    const firstName = form.firstName.trim(), lastName = form.lastName.trim()
    if (firstName.length < 2) errors.firstName = 'Вкажіть ім’я (мінімум 2 символи).'
    if (lastName.length < 2) errors.lastName = 'Вкажіть прізвище (мінімум 2 символи).'
    if (!validPhone(form.phone)) errors.phone = 'Вкажіть український номер: 0XXXXXXXXX або +380XXXXXXXXX.'
    if (!validEmail(form.email)) errors.email = 'Перевірте формат email, наприклад name@example.com.'
    if (!form.settlement || !form.city.trim()) errors.city = 'Оберіть населений пункт саме зі списку підказок.'
    if (!form.carrier) errors.carrier = 'Оберіть службу доставки.'
    if (!form.deliveryType) errors.deliveryType = 'Оберіть спосіб отримання.'
    if (form.carrier && form.deliveryType && !selectedCarrier?.types.some(([id]) => id === form.deliveryType)) errors.deliveryType = 'Цей спосіб отримання недоступний для обраного перевізника.'
    if (needsPoint && !form.deliveryPoint.trim()) errors.deliveryPoint = 'Оберіть або вкажіть відділення / поштомат.'
    if (needsPoint && form.carrier === 'nova-poshta' && !form.deliveryPointRef) errors.deliveryPoint = 'Оберіть відділення / поштомат зі списку Нової пошти.'
    if (needsAddress && form.streetAddress.trim().length < 5) errors.streetAddress = 'Вкажіть повну адресу доставки.'
    if (!form.payment) errors.payment = 'Оберіть спосіб оплати.'
    if (form.comment.length > 600) errors.comment = 'Коментар має містити не більше 600 символів.'
    return errors
  }
  const clearFieldError = (name) => setFieldErrors(current => current[name] ? ({...current, [name]: ''}) : current)
  const field = (name) => ({
    value: form[name],
    'aria-invalid': Boolean(fieldErrors[name]),
    className: fieldErrors[name] ? 'input-invalid' : '',
    onChange: (e) => { setForm(current => ({...current, [name]: e.target.value})); clearFieldError(name) }
  })
  const FieldError = ({name}) => fieldErrors[name] ? <div className="field-error" role="alert">{fieldErrors[name]}</div> : null

  const chooseCarrier = (carrierId) => {
    setFieldErrors(current=>({...current,carrier:'',deliveryType:'',deliveryPoint:'',streetAddress:''}))
    setForm(current => ({
      ...current,
      carrier: carrierId,
      deliveryType: '',
      deliveryPoint: '',
      deliveryPointRef: '',
      streetAddress: '',
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const validation = validateCheckout()
      setFieldErrors(validation)
      if (Object.keys(validation).length) {
        setError('Перевірте виділені поля — замовлення ще не відправлено.')
        requestAnimationFrame(()=>document.querySelector('.input-invalid, .validation-block-error')?.scrollIntoView({behavior:'smooth',block:'center'}))
        return
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email
          },
          delivery: {
            city: form.city,
            settlement: form.settlement,
            carrierId: form.carrier,
            carrier: selectedCarrier?.name || form.carrier,
            deliveryTypeId: form.deliveryType,
            deliveryType: selectedDeliveryType?.[1] || form.deliveryType,
            point: form.deliveryPoint,
            pointRef: form.deliveryPointRef,
            address: form.streetAddress,
          },
          payment: form.payment,
          comment: form.comment,
          promoCode: promo?.code || '',
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            selectedColor: item.selectedColor,
            price: item.price,
            quantity: item.quantity
          }))
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.ok) throw new Error(result.error || 'Не вдалося оформити замовлення.')
      if(loggedCustomer&&saveDelivery){
        const token=localStorage.getItem('nordhome-customer-token')||''
        const savedDelivery={city:form.city,settlement:form.settlement,carrier:form.carrier,deliveryType:form.deliveryType,deliveryPoint:form.deliveryPoint,deliveryPointRef:form.deliveryPointRef,streetAddress:form.streetAddress}
        try{await fetch('/api/customer/profile',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({firstName:form.firstName,lastName:form.lastName,email:form.email,savedDelivery})})}catch{}
      }
      try{window.nordhomeTrack?.('purchase',{transaction_id:result.orderId,currency:'UAH',value:Number(result.total)||cart.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.quantity)||1),0),items:cart.map(i=>({item_id:String(i.id),item_name:i.name,quantity:i.quantity,price:Number(i.price)||0}))})}catch{}
      setOrderId(result.orderId)
      clearCart()
      await onOrderPlaced?.()
    } catch (err) {
      setError(err.message || 'Помилка з’єднання із сервером.')
    } finally {
      setSending(false)
    }
  }

  if (orderId) return <main className="section container"><div className="success"><Check size={52}/><h1>Замовлення прийнято</h1><p>Номер вашого замовлення:</p><strong className="order-id">{orderId}</strong><p>Ми отримали дані замовлення. Менеджер зможе зв’язатися з вами для підтвердження.</p><div className="success-actions"><button className="primary" onClick={()=>navigate('/track-order')}>Стежити за замовленням</button><button className="secondary" onClick={()=>navigate('/')}>На головну</button></div></div></main>
  if (!cart.length) return <main className="section container"><div className="empty"><h2>Кошик порожній</h2><button className="primary" onClick={()=>navigate('/catalog')}>До каталогу</button></div></main>

  return <main className="section container">
    <div className="section-title"><p className="eyebrow">Оформлення</p><h1>Дані для замовлення</h1></div>
    <form className="checkout" onSubmit={submit} noValidate>
      <div className="form-card">
        <h3><User size={18}/> Контактні дані</h3>
        {loggedCustomer&&<div className="account-prefill-note"><Check size={17}/><span>Дані підставлено з вашого кабінету.</span></div>}
        <div className="form-grid">
          <label className="checkout-field"><span>Ім’я *</span><input placeholder="Ім’я" autoComplete="given-name" {...field('firstName')}/><FieldError name="firstName"/></label>
          <label className="checkout-field"><span>Прізвище *</span><input placeholder="Прізвище" autoComplete="family-name" {...field('lastName')}/><FieldError name="lastName"/></label>
          <label className="checkout-field"><span>Телефон *</span><input placeholder="+380 67 123 45 67" inputMode="tel" autoComplete="tel" {...field('phone')}/><FieldError name="phone"/></label>
          <label className="checkout-field"><span>Email <small>необов’язково</small></span><input placeholder="name@example.com" type="email" autoComplete="email" {...field('email')}/><FieldError name="email"/></label>
        </div>

        <h3><MapPin size={18}/> Населений пункт</h3>
        <div className="form-grid one-col">
          <div className={fieldErrors.city ? 'validation-block-error' : ''}>
            <SettlementPicker
              value={form.city}
              selected={form.settlement}
              onChange={(value)=>{setForm(current=>({...current, city:value, settlement:null, deliveryPoint:'', deliveryPointRef:''}));clearFieldError('city')}}
              onSelect={(settlement)=>{setForm(current=>({...current, city:settlement.name, settlement, deliveryPoint:'', deliveryPointRef:''}));clearFieldError('city')}}
            />
            <FieldError name="city"/>
          </div>
        </div>

        <h3><Truck size={18}/> Служба доставки</h3>
        <div className="carrier-grid">
          {carriers.map(carrier => <button
            type="button"
            key={carrier.id}
            className={`carrier-card ${form.carrier === carrier.id ? 'active' : ''}`}
            onClick={()=>chooseCarrier(carrier.id)}
          >
            <span className="carrier-mark">{carrier.short}</span>
            <span className="carrier-copy"><strong>{carrier.name}</strong><small>{carrier.description}</small></span>
            {form.carrier === carrier.id && <Check className="carrier-check" size={18}/>} 
          </button>)}
        </div>
        <FieldError name="carrier"/>

        {selectedCarrier && <div className="delivery-details">
          <label className="field-label">Спосіб отримання</label>
          <div className="delivery-type-grid">
            {selectedCarrier.types.map(([id,label]) => <button
              type="button"
              key={id}
              className={`delivery-type ${form.deliveryType === id ? 'active' : ''}`}
              onClick={()=>{setForm(current=>({...current, deliveryType:id, deliveryPoint:'', deliveryPointRef:'', streetAddress:''}));setFieldErrors(current=>({...current,deliveryType:'',deliveryPoint:'',streetAddress:''}))}}
            >{label}</button>)}
          </div>
          <FieldError name="deliveryType"/>

          {needsPoint && form.carrier === 'nova-poshta' && <div className={`delivery-input-block ${fieldErrors.deliveryPoint ? 'validation-block-error' : ''}`}>
            <NovaPoshtaPointPicker
              settlement={form.settlement}
              type={form.deliveryType}
              value={form.deliveryPoint}
              pointRef={form.deliveryPointRef}
              onSelect={(item)=>{setForm(current=>({...current, deliveryPoint:item.description || item.shortAddress, deliveryPointRef:item.ref}));clearFieldError('deliveryPoint')}}
            />
            <FieldError name="deliveryPoint"/>
          </div>}

          {needsPoint && form.carrier !== 'nova-poshta' && <div className="delivery-input-block">
            <label className="field-label">{form.deliveryType === 'parcel-locker' ? 'Поштомат' : 'Відділення'}</label>
            <input
              required
              placeholder={form.deliveryType === 'parcel-locker' ? 'Наприклад: поштомат №12345 або адреса' : 'Наприклад: відділення №1, вул. ...'}
              {...field('deliveryPoint')}
            />
            <FieldError name="deliveryPoint"/>
            <p className="field-hint">Для {selectedCarrier?.name} поки введення вручну. Живий API підключимо наступним етапом.</p>
          </div>}

          {needsAddress && <div className="delivery-input-block">
            <label className="field-label">Адреса доставки</label>
            <input placeholder="Вулиця, будинок, квартира" autoComplete="street-address" {...field('streetAddress')}/>
            <FieldError name="streetAddress"/>
          </div>}
        </div>}

        {loggedCustomer&&<label className="save-delivery-check"><input type="checkbox" checked={saveDelivery} onChange={e=>setSaveDelivery(e.target.checked)}/><span>Зберегти цю доставку як основну в моєму кабінеті</span></label>}

        <h3><CreditCard size={18}/> Оплата</h3>
        <select {...field('payment')}>
          <option value="" disabled>Оберіть спосіб</option>
          <option value="Оплата при отриманні">Оплата при отриманні</option>
          <option value="Оплата карткою">Оплата карткою (підключимо пізніше)</option>
        </select>
        <FieldError name="payment"/>
        <textarea placeholder="Коментар до замовлення" maxLength={600} {...field('comment')}/>
        <div className="comment-counter">{form.comment.length}/600</div>
        <FieldError name="comment"/>
        {error && <div className="form-error">{error}</div>}
      </div>

      <aside className="summary">
        <h3>Ваше замовлення</h3>
        {cart.map(i=><div key={i.key}><span>{i.name} × {i.quantity}</span><strong>{formatPrice(i.price*i.quantity)}</strong></div>)}
        {selectedCarrier && <><hr/><div><span>Доставка</span><strong>{selectedCarrier.name}</strong></div></>}
        <div className="promo-box"><label>Промокод</label><div className="promo-row"><input value={promoInput} onChange={e=>{setPromoInput(e.target.value.toUpperCase());setPromo(null)}} placeholder="Наприклад NORD10"/><button type="button" className="secondary" onClick={applyPromo} disabled={promoBusy||!promoInput.trim()}>{promoBusy?'...':'Застосувати'}</button></div>{promo&&<small className="promo-success">✓ {promo.code}: знижка {formatPrice(promo.discount)}</small>}</div>
        <hr/>
        {promo&&<><div><span>Сума товарів</span><strong>{formatPrice(subtotal)}</strong></div><div className="discount-line"><span>Знижка</span><strong>−{formatPrice(promo.discount)}</strong></div></>}
        <div><span>Всього</span><strong>{formatPrice(total)}</strong></div>
        <button className="primary wide" type="submit" disabled={sending}>{sending ? 'Надсилаємо…' : 'Підтвердити замовлення'}</button>
      </aside>
    </form>
  </main>
}


const DELIVERY_STATUS_LABELS={pending:'Очікує відправки',preparing:'Готується до відправки',handed_over:'Передано перевізнику',in_transit:'В дорозі',arrived:'Прибуло у відділення',received:'Отримано клієнтом',returned:'Повернення'}

function ShipmentInfo({order}){if(!order?.trackingNumber&&!order?.shipmentCarrier)return null;return <div className="shipment-public"><div className="shipment-public-head"><span>Відправлення</span><strong>{DELIVERY_STATUS_LABELS[order.deliveryStatus||'pending']||order.deliveryStatus}</strong></div><div className="shipment-public-grid"><div><span>Служба доставки</span><strong>{order.shipmentCarrier||order.delivery?.carrier||'—'}</strong></div><div><span>Номер ТТН</span><strong className="public-ttn">{order.trackingNumber||'Ще не присвоєно'}</strong></div></div>{order.shipmentUpdatedAt&&<small>Оновлено {new Date(order.shipmentUpdatedAt).toLocaleString('uk-UA')}</small>}</div>}

function OrderTrackingPage({ navigate }) {
  const [orderId,setOrderId]=React.useState('')
  const [phone,setPhone]=React.useState('')
  const [loading,setLoading]=React.useState(false)
  const [error,setError]=React.useState('')
  const [order,setOrder]=React.useState(null)
  const statuses={
    new:{title:'Замовлення отримано',text:'Ми отримали ваше замовлення та готуємо його до підтвердження.',step:1},
    confirmed:{title:'Замовлення підтверджено',text:'Менеджер підтвердив замовлення. Готуємо товар до відправлення.',step:2},
    shipped:{title:'Замовлення відправлено',text:'Ваше замовлення вже передано службі доставки.',step:3},
    done:{title:'Замовлення виконано',text:'Замовлення завершено. Дякуємо за покупку!',step:4},
    cancelled:{title:'Замовлення скасовано',text:'Це замовлення було скасовано.',step:0}
  }
  const submit=async(e)=>{
    e.preventDefault();setLoading(true);setError('');setOrder(null)
    try{
      const r=await fetch('/api/order-track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId,phone})})
      const d=await r.json().catch(()=>({}))
      if(!r.ok||!d.ok)throw new Error(d.error||'Не вдалося знайти замовлення.')
      setOrder(d.order)
    }catch(e){setError(e.message)}finally{setLoading(false)}
  }
  const status=order?statuses[order.status]||statuses.new:null
  return <main className="section container">
    <button className="back" onClick={()=>navigate('/')}><ChevronLeft size={18}/> На головну</button>
    <div className="section-title"><p className="eyebrow">Для покупця</p><h1>Статус замовлення</h1><p>Введіть номер замовлення та телефон, який вказували під час оформлення.</p></div>
    <div className="tracking-layout">
      <form className="tracking-form" onSubmit={submit}>
        <label>Номер замовлення<input required value={orderId} onChange={e=>setOrderId(e.target.value.toUpperCase())} placeholder="Наприклад NH-20260906-ABC123"/></label>
        <label>Телефон<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+380..." inputMode="tel"/></label>
        {error&&<div className="form-error">{error}</div>}
        <button className="primary wide" disabled={loading}>{loading?'Перевіряємо…':'Перевірити статус'}</button>
      </form>
      {order&&<section className="tracking-result">
        <div className={`tracking-status ${order.status==='cancelled'?'cancelled':''}`}><span className="stock-dot"></span><div><small>Замовлення {order.id}</small><h2>{status.title}</h2><p>{status.text}</p></div></div>
        {order.status!=='cancelled'&&<div className="tracking-steps">{['Отримано','Підтверджено','Відправлено','Виконано'].map((label,i)=><div className={i<status.step?'active':''} key={label}><span>{i+1}</span><small>{label}</small></div>)}</div>}
        <div className="tracking-card"><div><span>Дата</span><strong>{new Date(order.createdAt).toLocaleString('uk-UA')}</strong></div><div><span>Сума</span><strong>{formatPrice(order.total)}</strong></div><div><span>Доставка</span><strong>{order.delivery?.carrier||'—'}{order.delivery?.deliveryType?` · ${order.delivery.deliveryType}`:''}</strong></div><div><span>Населений пункт</span><strong>{order.delivery?.city||'—'}</strong></div></div>
        <ShipmentInfo order={order}/>
        <div className="tracking-items"><h3>Товари</h3>{order.items.map((item,i)=><div key={`${item.id}-${i}`}><span>{item.name}{item.selectedColor?` · ${item.selectedColor}`:''} × {item.quantity}</span><strong>{formatPrice(item.price*item.quantity)}</strong></div>)}</div>
      </section>}
    </div>
  </main>
}



function CustomerAccountPage({ navigate, onRepeatOrder }) {
  const [token,setToken]=React.useState(()=>localStorage.getItem('nordhome-customer-token')||'')
  const [customer,setCustomer]=React.useState(null)
  const [orders,setOrders]=React.useState([])
  const [selectedOrder,setSelectedOrder]=React.useState(null)
  const [mode,setMode]=React.useState('login')
  const [busy,setBusy]=React.useState(false)
  const [error,setError]=React.useState('')
  const [statusNotice,setStatusNotice]=React.useState(null)
  const [notifications,setNotifications]=React.useState([])
  const [notificationsOpen,setNotificationsOpen]=React.useState(false)
  const notificationsRef=React.useRef(null)
  const [form,setForm]=React.useState({firstName:'',lastName:'',phone:'',email:'',login:'',password:''})
  const authHeaders=React.useCallback(()=>token?{Authorization:`Bearer ${token}`}:{},[token])
  const loadAccount=React.useCallback(async(currentToken=token)=>{
    if(!currentToken){setCustomer(null);setOrders([]);return}
    try{
      const h={Authorization:`Bearer ${currentToken}`}
      const [meR,ordersR]=await Promise.all([fetch('/api/customer/me',{headers:h}),fetch('/api/customer/orders',{headers:h})])
      const me=await meR.json().catch(()=>({})),od=await ordersR.json().catch(()=>({}))
      if(meR.status===401){localStorage.removeItem('nordhome-customer-token');setToken('');setCustomer(null);setOrders([]);return}
      if(me.ok)setCustomer(me.customer)
      if(od.ok){
        const nextOrders=od.orders||[]
        const customerId=me.ok?me.customer.id:customer?.id
        const storageKey=`nordhome-order-statuses-${customerId||'guest'}`
        const notificationKey=`nordhome-notifications-${customerId||'guest'}`
        let previous={}
        let savedNotifications=[]
        try{previous=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{}
        try{savedNotifications=JSON.parse(localStorage.getItem(notificationKey)||'[]')||[]}catch{}
        const changedOrders=nextOrders.filter(o=>previous[o.id]&&previous[o.id]!==o.status)
        const snapshot=Object.fromEntries(nextOrders.map(o=>[o.id,o.status]))
        localStorage.setItem(storageKey,JSON.stringify(snapshot))
        const labels={new:'Отримано',confirmed:'Підтверджено',shipped:'Відправлено',done:'Виконано',cancelled:'Скасовано'}
        if(changedOrders.length){
          const now=Date.now()
          const fresh=changedOrders.map((o,index)=>({
            key:`${o.id}-${o.status}-${now}-${index}`,
            orderId:o.id,
            status:o.status,
            label:labels[o.status]||o.status,
            title:'Статус замовлення оновлено',
            createdAt:new Date(now+index).toISOString(),
            read:false,
          }))
          const merged=[...fresh,...savedNotifications].slice(0,30)
          localStorage.setItem(notificationKey,JSON.stringify(merged))
          setNotifications(merged)
          const changed=changedOrders[0]
          setStatusNotice({id:changed.id,status:changed.status,label:labels[changed.status]||changed.status})
        }else{
          setNotifications(savedNotifications)
        }
        setOrders(nextOrders)
        setSelectedOrder(current=>current?nextOrders.find(o=>o.id===current.id)||current:current)
      }
    }catch{}
  },[token])
  React.useEffect(()=>{loadAccount()},[loadAccount])
  React.useEffect(()=>{
    if(!token)return
    const timer=setInterval(()=>loadAccount(token),10000)
    return ()=>clearInterval(timer)
  },[token,loadAccount])
  React.useEffect(()=>{
    const close=(event)=>{if(notificationsRef.current&&!notificationsRef.current.contains(event.target))setNotificationsOpen(false)}
    document.addEventListener('mousedown',close)
    return ()=>document.removeEventListener('mousedown',close)
  },[])
  const persistNotifications=React.useCallback((next)=>{
    setNotifications(next)
    if(customer?.id)localStorage.setItem(`nordhome-notifications-${customer.id}`,JSON.stringify(next))
  },[customer?.id])
  const openNotification=(notification)=>{
    const next=notifications.map(n=>n.key===notification.key?{...n,read:true}:n)
    persistNotifications(next)
    const order=orders.find(o=>o.id===notification.orderId)
    if(order)setSelectedOrder(order)
    setNotificationsOpen(false)
  }
  const unreadCount=notifications.filter(n=>!n.read).length
  const markAllNotificationsRead=()=>persistNotifications(notifications.map(n=>({...n,read:true})))
  const clearNotifications=()=>persistNotifications([])
  const submit=async(e)=>{
    e.preventDefault();setBusy(true);setError('')
    try{
      const endpoint=mode==='register'?'/api/customer/register':'/api/customer/login'
      const body=mode==='register'?form:{login:form.login,password:form.password}
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      const d=await r.json().catch(()=>({}))
      if(!r.ok||!d.ok)throw new Error(d.error||'Не вдалося виконати вхід.')
      localStorage.setItem('nordhome-customer-token',d.token);setToken(d.token);setCustomer(d.customer);setForm({firstName:'',lastName:'',phone:'',email:'',login:'',password:''})
      setTimeout(()=>loadAccount(d.token),0)
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  const logout=async()=>{try{await fetch('/api/customer/logout',{method:'POST',headers:authHeaders()})}catch{}localStorage.removeItem('nordhome-customer-token');setToken('');setCustomer(null);setOrders([]);setNotifications([]);setNotificationsOpen(false)}
  const saveProfile=async(e)=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/customer/profile',{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(customer)});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.error||'Не вдалося зберегти.');setCustomer(d.customer)}catch(e){setError(e.message)}finally{setBusy(false)}}
  const statusLabel={new:'Отримано',confirmed:'Підтверджено',shipped:'Відправлено',done:'Виконано',cancelled:'Скасовано'}
  const statusInfo={
    new:{title:'Замовлення отримано',text:'Ми отримали ваше замовлення та готуємо його до підтвердження.',step:1},
    confirmed:{title:'Замовлення підтверджено',text:'Менеджер підтвердив замовлення. Готуємо товар до відправлення.',step:2},
    shipped:{title:'Замовлення відправлено',text:'Ваше замовлення вже передано службі доставки.',step:3},
    done:{title:'Замовлення виконано',text:'Замовлення завершено. Дякуємо за покупку!',step:4},
    cancelled:{title:'Замовлення скасовано',text:'Це замовлення було скасовано.',step:0}
  }
  if(!customer)return <main className="section container account-page"><button className="back" onClick={()=>navigate('/')}><ChevronLeft size={18}/> На головну</button><div className="account-auth"><div><p className="eyebrow">NordHome Club</p><h1>Особистий кабінет</h1><p>Історія замовлень, статуси та швидке повторне замовлення в одному місці.</p><div className="account-benefits"><span>✓ Усі ваші замовлення</span><span>✓ Повторити покупку в один клік</span><span>✓ Дані профілю зберігаються</span></div></div><form className="account-form" onSubmit={submit}><div className="account-tabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}>Вхід</button><button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}>Реєстрація</button></div>{mode==='register'&&<><input required placeholder="Ім’я" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))}/><input required placeholder="Прізвище" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}/><input required placeholder="Телефон +380..." value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/><input type="email" placeholder="Email (необов’язково)" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></>}{mode==='login'&&<input required placeholder="Телефон або email" value={form.login} onChange={e=>setForm(f=>({...f,login:e.target.value}))}/>}<input required type="password" minLength="6" placeholder="Пароль — мінімум 6 символів" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>{error&&<div className="form-error">{error}</div>}<button className="primary wide" disabled={busy}>{busy?'Зачекайте…':mode==='register'?'Створити кабінет':'Увійти'}</button></form></div></main>
  return <main className="section container account-page">{statusNotice&&<div className="account-status-notice"><div><strong>Статус замовлення оновлено</strong><span>{statusNotice.id}: {statusNotice.label}</span></div><div><button className="secondary" onClick={()=>{const o=orders.find(x=>x.id===statusNotice.id);if(o)setSelectedOrder(o);setStatusNotice(null)}}>Переглянути</button><button className="status-notice-close" onClick={()=>setStatusNotice(null)} aria-label="Закрити">×</button></div></div>}<div className="account-head"><div><p className="eyebrow">Особистий кабінет</p><h1>Вітаємо, {customer.firstName}</h1><p>{customer.phone}{customer.email?` · ${customer.email}`:''}</p></div><div className="account-head-actions"><div className="notification-center" ref={notificationsRef}><button type="button" className={`notification-bell ${unreadCount?'has-unread':''}`} onClick={()=>setNotificationsOpen(v=>!v)} aria-label="Сповіщення"><Bell size={20}/>{unreadCount>0&&<span>{unreadCount>99?'99+':unreadCount}</span>}</button>{notificationsOpen&&<div className="notification-dropdown"><div className="notification-dropdown-head"><div><strong>Сповіщення</strong><small>{unreadCount?`Непрочитаних: ${unreadCount}`:'Усе прочитано'}</small></div>{notifications.length>0&&<button type="button" className="text-link" onClick={markAllNotificationsRead}>Прочитати всі</button>}</div><div className="notification-list">{notifications.length===0?<div className="notification-empty"><Bell size={26}/><span>Нових сповіщень поки немає</span></div>:notifications.map(n=><button type="button" key={n.key} className={`notification-item ${n.read?'':'unread'}`} onClick={()=>openNotification(n)}><span className="notification-dot"></span><div><strong>{n.title}</strong><span>{n.orderId} · {n.label}</span><small>{new Date(n.createdAt).toLocaleString('uk-UA')}</small></div></button>)}</div>{notifications.length>0&&<div className="notification-dropdown-foot"><button type="button" className="text-link danger-link" onClick={clearNotifications}>Очистити сповіщення</button></div>}</div>}</div><button className="secondary" onClick={logout}>Вийти</button></div></div>{error&&<div className="form-error">{error}</div>}<div className="account-grid"><section className="account-panel"><h2>Мої дані</h2><form onSubmit={saveProfile}><label>Ім’я<input value={customer.firstName||''} onChange={e=>setCustomer(c=>({...c,firstName:e.target.value}))}/></label><label>Прізвище<input value={customer.lastName||''} onChange={e=>setCustomer(c=>({...c,lastName:e.target.value}))}/></label><label>Телефон<input value={customer.phone||''} disabled/></label><label>Email<input type="email" value={customer.email||''} onChange={e=>setCustomer(c=>({...c,email:e.target.value}))}/></label><DeliveryProfileEditor value={customer.savedDelivery||{}} onChange={savedDelivery=>setCustomer(c=>({...c,savedDelivery}))}/><button className="secondary" disabled={busy}>Зберегти профіль і доставку</button></form></section><section className="account-orders"><div className="account-section-head"><h2>Мої замовлення</h2><button className="text-link" onClick={()=>navigate('/track-order')}>Відстежити за номером →</button></div>{orders.length===0?<div className="account-empty"><p>У цьому кабінеті ще немає замовлень.</p><button className="primary" onClick={()=>navigate('/catalog')}>Перейти до каталогу</button></div>:orders.map(o=><article className="account-order-card" key={o.id}><div className="account-order-top"><div><strong>{o.id}</strong><span>{new Date(o.createdAt).toLocaleDateString('uk-UA')}</span></div><span className={`account-status status-${o.status}`}>{statusLabel[o.status]||o.status}</span></div><div className="account-order-items">{o.items.slice(0,3).map((i,idx)=><span key={idx}>{i.name} × {i.quantity}</span>)}{o.items.length>3&&<span>+ ще {o.items.length-3}</span>}</div>{(o.trackingNumber||o.shipmentCarrier)&&<div className="account-shipment-line"><span>{o.shipmentCarrier||o.delivery?.carrier||'Доставка'}</span><strong>{o.trackingNumber?`ТТН ${o.trackingNumber}`:DELIVERY_STATUS_LABELS[o.deliveryStatus||'pending']}</strong></div>}<div className="account-order-bottom"><strong>{formatPrice(o.total)}</strong><div><button className="secondary" onClick={()=>setSelectedOrder(o)}>Статус</button><button className="primary" onClick={()=>onRepeatOrder(o)}>Повторити</button></div></div></article>)}</section></div>{selectedOrder&&(()=>{const st=statusInfo[selectedOrder.status]||statusInfo.new;return <div className="order-status-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedOrder(null)}}><section className="order-status-modal" role="dialog" aria-modal="true" aria-label={`Статус замовлення ${selectedOrder.id}`}><div className="order-status-modal-head"><div><small>Замовлення {selectedOrder.id}</small><h2>{st.title}</h2></div><button type="button" className="order-status-close" onClick={()=>setSelectedOrder(null)} aria-label="Закрити">×</button></div><p className="order-status-text">{st.text}</p>{selectedOrder.status!=='cancelled'&&<div className="tracking-steps account-status-steps">{['Отримано','Підтверджено','Відправлено','Виконано'].map((label,i)=><div className={i<st.step?'active':''} key={label}><span>{i+1}</span><small>{label}</small></div>)}</div>}<div className="tracking-card order-status-card"><div><span>Дата</span><strong>{new Date(selectedOrder.createdAt).toLocaleString('uk-UA')}</strong></div><div><span>Сума</span><strong>{formatPrice(selectedOrder.total)}</strong></div><div><span>Доставка</span><strong>{selectedOrder.delivery?.carrier||'—'}{selectedOrder.delivery?.deliveryType?` · ${selectedOrder.delivery.deliveryType}`:''}</strong></div><div><span>Населений пункт</span><strong>{selectedOrder.delivery?.city||'—'}</strong></div></div><ShipmentInfo order={selectedOrder}/><div className="tracking-items order-status-items"><h3>Товари</h3>{selectedOrder.items.map((item,i)=><div key={`${item.id}-${i}`}><span>{item.name}{item.selectedColor?` · ${item.selectedColor}`:''} × {item.quantity}</span><strong>{formatPrice(item.price*item.quantity)}</strong></div>)}</div><button type="button" className="primary wide" onClick={()=>setSelectedOrder(null)}>Зрозуміло</button></section></div>})()}</main>
}

function FavoritesPage({navigate,products,favorites,onToggleFavorite}){
  const items=products.filter(p=>favorites.includes(Number(p.id)))
  return <main className="section container saved-page"><div className="saved-head"><div><p className="eyebrow">Ваш вибір</p><h1>Обране</h1><p>Збережені товари залишаються тут на цьому пристрої.</p></div><Heart size={32}/></div>{items.length?<div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p} navigate={navigate} isFavorite onToggleFavorite={onToggleFavorite}/>)}</div>:<div className="saved-empty"><Heart size={40}/><h2>В обраному поки порожньо</h2><p>Натискайте сердечко на товарах, які хочете зберегти.</p><button className="primary" onClick={()=>navigate('/catalog')}>Перейти до каталогу</button></div>}</main>
}

function RecentPage({navigate,products,recent,favorites,onToggleFavorite,clearRecent}){
  const items=recent.map(id=>products.find(p=>Number(p.id)===Number(id))).filter(Boolean)
  return <main className="section container saved-page"><div className="saved-head"><div><p className="eyebrow">Історія переглядів</p><h1>Нещодавно переглянуті</h1><p>Останні товари, які ви відкривали.</p></div>{items.length>0&&<button className="secondary" onClick={clearRecent}>Очистити</button>}</div>{items.length?<div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p} navigate={navigate} isFavorite={favorites.includes(Number(p.id))} onToggleFavorite={onToggleFavorite}/>)}</div>:<div className="saved-empty"><Clock3 size={40}/><h2>Історія переглядів порожня</h2><p>Відкрийте будь-який товар — і він з’явиться тут.</p><button className="primary" onClick={()=>navigate('/catalog')}>Дивитися каталог</button></div>}</main>
}

function SimplePage({ title, text, navigate }) { return <main className="section container"><button className="back" onClick={()=>navigate('/')}><ChevronLeft size={18}/> На головну</button><div className="simple"><h1>{title}</h1><p>{text || 'Цей розділ готовий до наповнення реальним контентом.'}</p></div></main> }

function SeoManager({path,products,settings}){
  React.useEffect(()=>{
    const store=settings.storeName||'NordHome';let title=store,description=settings.seoHomeDescription||settings.heroText||'Інтернет-магазин сучасних товарів.',image=settings.logoUrl||'',canonicalPath=path;
    const setMeta=(name,content,property=false)=>{if(!content)return;let el=document.head.querySelector(`meta[${property?'property':'name'}="${name}"]`);if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.appendChild(el)}el.setAttribute('content',content)};
    if(path==='/'){title=settings.seoHomeTitle||`${store} — інтернет-магазин`;description=settings.seoHomeDescription||settings.heroText||description}
    else if(path==='/catalog'){title=`Каталог — ${store}`;description=`Каталог товарів ${store}. Переглядайте асортимент, ціни та наявність.`}
    else if(path.startsWith('/category/')){const c=decodeURIComponent(path.slice('/category/'.length));title=`${c} — ${store}`;description=`Купити ${c.toLowerCase()} у ${store}. Актуальні ціни, характеристики та наявність.`}
    else if(path.startsWith('/product/')){const key=decodeURIComponent(path.split('/')[2]||'');const p=products.find(x=>String(x.slug)===key||String(x.id)===key);if(p){title=p.seoTitle||`${p.name} — ${store}`;description=p.seoDescription||p.shortDescription||p.description||description;image=p.image||image;canonicalPath=productPath(p)}}
    else {const names={'/about':'Про магазин','/delivery':'Доставка та оплата','/returns':'Повернення та обмін','/offer':'Публічна оферта','/privacy':'Політика конфіденційності','/contacts':'Контакти'};if(names[path])title=`${names[path]} — ${store}`}
    const base=(settings.publicUrl||window.location.origin).replace(/\/$/,'');const imageUrl=image?(image.startsWith('http://')||image.startsWith('https://')?image:base+(image.startsWith('/')?'':'/')+image):'';
    document.title=title;setMeta('description',description);setMeta('og:title',title,true);setMeta('og:description',description,true);setMeta('og:type',path.startsWith('/product/')?'product':'website',true);if(imageUrl)setMeta('og:image',imageUrl,true);
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}link.href=base+canonicalPath;setMeta('og:url',link.href,true);setMeta('twitter:card','summary_large_image');setMeta('twitter:title',title);setMeta('twitter:description',description);if(imageUrl)setMeta('twitter:image',imageUrl);const privatePaths=['/admin','/checkout','/account','/track-order','/cart','/favorites','/recent'];setMeta('robots',privatePaths.some(x=>path===x||path.startsWith(x+'/'))?'noindex,nofollow':'index,follow');
  },[path,products,settings]);return null
}

function ThemeManager({settings}){
  React.useEffect(()=>{const root=document.documentElement;root.style.setProperty('--brand-primary',settings.primaryColor||'#1d1f1c');root.style.setProperty('--brand-accent',settings.accentColor||'#2f7d55');root.style.setProperty('--brand-surface',settings.surfaceColor||'#f8f7f3')},[settings.primaryColor,settings.accentColor,settings.surfaceColor]);return null
}
function BrandAssetsManager({settings}){
  React.useEffect(()=>{const url=String(settings.faviconUrl||'').trim();let link=document.head.querySelector('link[data-nordhome-favicon]');if(url){if(!link){link=document.createElement('link');link.rel='icon';link.dataset.nordhomeFavicon='1';document.head.appendChild(link)}link.href=url}else if(link){link.remove()}},[settings.faviconUrl]);return null
}
function TemplateShowcasePage({navigate,settings}){
  const features=['Адаптивний дизайн для ПК і телефона','Каталог, пошук, фільтри та обране','Кошик і оформлення замовлення','Кабінет клієнта та історія замовлень','ТТН, перевізники й статуси доставки','Промокоди, залишки та відгуки','SEO, GA4 / Meta Pixel readiness','Імпорт / експорт товарів CSV та Excel','White Label: бренд, кольори й контакти','Повноцінна адміністративна панель']
  const plans=[
    {name:'START',price:settings.templateStarterPrice||'від 12 000 ₴',text:'Готовий магазин під ваш бренд',items:['White Label і адаптивний дизайн','Каталог, кошик та оформлення','Базове налаштування контенту']},
    {name:'BUSINESS',price:settings.templateBusinessPrice||'від 20 000 ₴',text:'Для магазину, який починає продавати',featured:true,items:['Усе зі START','Кабінет клієнта, промокоди, відгуки','ТТН, доставка, SEO та аналітика']},
    {name:'PRO',price:settings.templateProPrice||'від 30 000 ₴',text:'Максимальна адаптація під бізнес',items:['Усе з BUSINESS','Імпорт каталогу та перенесення бренду','Доопрацювання під процеси клієнта']},
  ]
  const[lead,setLead]=React.useState({name:'',contact:'',plan:'BUSINESS',message:''})
  const[leadStatus,setLeadStatus]=React.useState('')
  const[leadBusy,setLeadBusy]=React.useState(false)
  const submitLead=async e=>{e.preventDefault();setLeadBusy(true);setLeadStatus('');try{const r=await fetch('/api/template-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Не вдалося надіслати заявку.');setLeadStatus('Заявку надіслано ✓ Я зв’яжусь з вами за вказаним контактом.');setLead({name:'',contact:'',plan:lead.plan,message:''})}catch(err){setLeadStatus(err.message||'Не вдалося надіслати заявку.')}finally{setLeadBusy(false)}}
  return <main className="template-showcase">
    <section className="template-showcase-hero"><div className="template-hero-copy"><span className="eyebrow">NordHome White Label</span><h1>Готовий інтернет-магазин, який легко перетворити на ваш бренд</h1><p>Не макет і не просто дизайн — готова система з каталогом, замовленнями, клієнтами, доставкою, адмінкою та мобільною версією.</p><div className="hero-actions"><button className="primary" onClick={()=>navigate('/catalog')}>Переглянути магазин</button><button className="secondary" onClick={()=>navigate('/admin')}>Відкрити адмінку</button></div><div className="template-trust"><span><BadgeCheck size={17}/>10+ готових модулів</span><span><BadgeCheck size={17}/>ПК + телефон</span><span><BadgeCheck size={17}/>White Label</span></div></div><div className="template-hero-mock"><div className="mock-browser"><div className="mock-top"><i/><i/><i/></div><div className="mock-store-head"><b>{settings.storeName||'NordHome'}</b><span>Каталог · Доставка · Кабінет</span></div><div className="mock-products"><i/><i/><i/><i/></div></div></div></section>
    <section className="template-proof-strip"><article><strong>100%</strong><span>Client Handoff readiness</span></article><article><strong>Backup</strong><span>Export & restore даних магазину</span></article><article><strong>Storage</strong><span>Постійні фото через Supabase</span></article><article><strong>White Label</strong><span>Бренд без правок коду</span></article></section>
    <section className="template-preview-section"><div className="template-section-head"><span>Показ клієнту</span><h2>Один продукт — три ключові екрани</h2><p>Покупець одразу бачить, що отримує: магазин, мобільну версію та повноцінну адмінку.</p></div><div className="template-preview-grid"><article><div className="preview-icon"><Monitor/></div><div className="preview-screen desktop"><div/><div className="preview-cards"><i/><i/><i/></div></div><h3>Магазин на ПК</h3><p>Каталог, фільтри, товар, кошик та checkout.</p></article><article><div className="preview-icon"><Smartphone/></div><div className="preview-screen phone"><div/><div/><div/></div><h3>Мобільна версія</h3><p>Повністю адаптивний інтерфейс для покупців.</p></article><article><div className="preview-icon"><LayoutDashboard/></div><div className="preview-screen admin"><aside/><section><i/><i/><i/><i/></section></div><h3>Адмін-панель</h3><p>Товари, замовлення, ТТН, клієнти, промокоди та налаштування.</p></article></div></section>
    <section className="template-feature-grid">{features.map((x,i)=><article key={x}><strong>{String(i+1).padStart(2,'0')}</strong><h3>{x}</h3><p>Функція вже інтегрована в шаблон і керується без редагування основного коду.</p></article>)}</section>
    <section className="template-packages"><div className="template-section-head"><span>Пакети</span><h2>Можна продавати як готове рішення</h2><p>Ціни редагуються в адмінці, тому під кожного клієнта можна сформувати свою пропозицію.</p></div><div className="package-grid">{plans.map(p=><article className={p.featured?'featured':''} key={p.name}>{p.featured&&<em>Найпопулярніший</em>}<span>{p.name}</span><h3>{p.price}</h3><p>{p.text}</p><ul>{p.items.map(x=><li key={x}><BadgeCheck size={16}/>{x}</li>)}</ul><button className={p.featured?'primary':'secondary'} onClick={()=>{setLead(v=>({...v,plan:p.name}));document.getElementById('template-lead')?.scrollIntoView({behavior:'smooth'})}}>Обрати {p.name}</button></article>)}</div></section>
    <section className="template-handoff"><div><Rocket size={34}/><span>Передача клієнту</span><h2>Нова копія під інший магазин — без переписування сайту</h2><p>Змінюєте бренд, контакти й кольори, імпортуєте каталог, переносите налаштування JSON та передаєте готову копію клієнту.</p></div><ol><li><b>01</b>Змінити White Label</li><li><b>02</b>Імпортувати товари</li><li><b>03</b>Перенести налаштування</li><li><b>04</b>Підключити домен клієнта</li></ol></section>
    <section className="template-lead" id="template-lead"><div><span className="eyebrow">Замовити магазин</span><h2>Потрібен такий сайт під ваш бренд?</h2><p>Залиште контакт — заявка прийде напряму власнику шаблону. Можна вказати Telegram, телефон або email.</p><div className="lead-contact-hints">{settings.phone&&<span>Телефон: {settings.phone}</span>}{settings.email&&<span>Email: {settings.email}</span>}</div></div><form onSubmit={submitLead}><label>Ваше ім’я<input required value={lead.name} onChange={e=>setLead(v=>({...v,name:e.target.value}))} placeholder="Ім’я"/></label><label>Телефон / Telegram / Email<input required value={lead.contact} onChange={e=>setLead(v=>({...v,contact:e.target.value}))} placeholder="Як з вами зв’язатись"/></label><label>Пакет<select value={lead.plan} onChange={e=>setLead(v=>({...v,plan:e.target.value}))}>{plans.map(p=><option key={p.name}>{p.name}</option>)}</select></label><label>Коментар<textarea value={lead.message} onChange={e=>setLead(v=>({...v,message:e.target.value}))} placeholder="Що потрібно змінити або додати?"/></label><button className="primary" disabled={leadBusy}><Send size={17}/>{leadBusy?'Надсилаємо…':'Надіслати заявку'}</button>{leadStatus&&<div className="lead-status">{leadStatus}</div>}</form></section>
  </main>
}

function AnalyticsManager({settings}){
  React.useEffect(()=>{
    const ga=String(settings.googleAnalyticsId||'').trim(), pixel=String(settings.metaPixelId||'').trim();
    window.nordhomeTrack=(event,params={})=>{
      try{if(ga&&window.gtag)window.gtag('event',event,params)}catch{}
      try{if(pixel&&window.fbq){const map={add_to_cart:'AddToCart',begin_checkout:'InitiateCheckout',purchase:'Purchase',view_item:'ViewContent'};window.fbq('track',map[event]||event,params)}}catch{}
    };
    if(ga&&!document.getElementById('nordhome-ga')){const a=document.createElement('script');a.id='nordhome-ga';a.async=true;a.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;document.head.appendChild(a);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',ga,{send_page_view:false})}
    if(pixel&&!window.fbq){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',pixel)}
    return()=>{}
  },[settings.googleAnalyticsId,settings.metaPixelId]);
  React.useEffect(()=>{try{if(settings.googleAnalyticsId&&window.gtag)window.gtag('event','page_view',{page_path:window.location.pathname,page_title:document.title});if(settings.metaPixelId&&window.fbq)window.fbq('track','PageView')}catch{}},[settings.googleAnalyticsId,settings.metaPixelId,window.location.pathname]);
  return null
}

export default function App(){
  const getPath=()=>window.location.pathname
  const [path,setPath]=React.useState(getPath)
  const [products,setProducts]=React.useState(DEFAULT_PRODUCTS)
  const [settings,setSettings]=React.useState({storeName:'NordHome',phone:'',email:'',city:'Львів',instagram:'',lowStockThreshold:3,logoUrl:'',faviconUrl:'',brandTagline:'',heroEyebrow:'',heroTitle:'',heroText:'',footerText:'',aboutText:'',seoHomeTitle:'',seoHomeDescription:'',publicUrl:'',googleAnalyticsId:'',metaPixelId:'',primaryColor:'#1d1f1c',accentColor:'#2f7d55',surfaceColor:'#f8f7f3',demoMode:false,demoBadge:'Демо-магазин',templateStarterPrice:'від 12 000 ₴',templateBusinessPrice:'від 20 000 ₴',templateProPrice:'від 30 000 ₴'})
  const loadSettings=React.useCallback(async()=>{
    try{const response=await fetch('/api/settings',{cache:'no-store'});const data=await response.json();if(response.ok&&data.ok&&data.settings)setSettings(v=>({...v,...data.settings}))}catch{}
  },[])
  const loadProducts=React.useCallback(async()=>{
    try{
      const response=await fetch('/api/products')
      const data=await response.json()
      if(response.ok&&data.ok&&Array.isArray(data.products))setProducts(data.products)
    }catch{}
  },[])
  React.useEffect(()=>{loadProducts();loadSettings()},[loadProducts,loadSettings])
  const [cart,setCart]=React.useState(()=>{try{return JSON.parse(localStorage.getItem('nordhome-cart')||'[]')}catch{return[]}})
  const [favorites,setFavorites]=React.useState(()=>{try{return JSON.parse(localStorage.getItem('nordhome-favorites')||'[]').map(Number)}catch{return[]}})
  const [recent,setRecent]=React.useState(()=>{try{return JSON.parse(localStorage.getItem('nordhome-recent')||'[]').map(Number)}catch{return[]}})
  React.useEffect(()=>{localStorage.setItem('nordhome-favorites',JSON.stringify(favorites))},[favorites])
  React.useEffect(()=>{localStorage.setItem('nordhome-recent',JSON.stringify(recent))},[recent])
  const toggleFavorite=(id)=>setFavorites(v=>v.includes(Number(id))?v.filter(x=>x!==Number(id)):[Number(id),...v])
  const markViewed=(id)=>setRecent(v=>[Number(id),...v.filter(x=>x!==Number(id))].slice(0,12))
  React.useEffect(()=>{localStorage.setItem('nordhome-cart',JSON.stringify(cart))},[cart])
  React.useEffect(()=>{const fn=()=>setPath(getPath());window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn)},[])
  const navigate=(to)=>{window.history.pushState({},'',to);setPath(to);window.scrollTo(0,0)}
  const addToCart=(product,selectedColor)=>{try{window.nordhomeTrack?.('add_to_cart',{currency:'UAH',value:Number(product.price)||0,items:[{item_id:String(product.id),item_name:product.name,quantity:1}]})}catch{};const key=`${product.id}-${selectedColor}`;setCart(c=>{const ex=c.find(i=>i.key===key);const a=productAvailability(product);const max=a.mode==='auto'?Math.max(1,a.stock):99;return ex?c.map(i=>i.key===key?{...i,quantity:Math.min(max,i.quantity+1)}:i):[...c,{...product,selectedColor,quantity:1,key}]});navigate('/cart')}
  const updateQuantity=(key,q)=>setCart(c=>q<=0?c.filter(i=>i.key!==key):c.map(i=>{if(i.key!==key)return i;const a=productAvailability(i);const max=a.mode==='auto'?Math.max(1,a.stock):99;return {...i,quantity:Math.min(max,q)}}))
  const removeFromCart=(key)=>setCart(c=>c.filter(i=>i.key!==key))
  const clearCart=()=>setCart([])
  const repeatOrder=(order)=>{
    const rebuilt=(order.items||[]).map((item,idx)=>{const product=products.find(p=>Number(p.id)===Number(item.id));if(!product)return null;const a=productAvailability(product);if(!a.canBuy)return null;const qty=a.mode==='auto'?Math.min(Number(item.quantity)||1,Math.max(1,a.stock)):(Number(item.quantity)||1);return {...product,selectedColor:item.selectedColor||product.colors?.[0]||'',quantity:qty,key:`${product.id}-${item.selectedColor||product.colors?.[0]||''}-${idx}`}}).filter(Boolean);setCart(rebuilt);navigate('/cart')}
  const cartCount=cart.reduce((s,i)=>s+i.quantity,0)
  let page
  if(path==='/') page=<HomePage navigate={navigate} products={products} favorites={favorites} onToggleFavorite={toggleFavorite} settings={settings}/>
  else if(path==='/catalog') page=<CatalogPage navigate={navigate} products={products} favorites={favorites} onToggleFavorite={toggleFavorite}/>
  else if(path.startsWith('/category/')) page=<CatalogPage navigate={navigate} products={products} initialCategory={decodeURIComponent(path.slice('/category/'.length))} favorites={favorites} onToggleFavorite={toggleFavorite}/>
  else if(path.startsWith('/product/')) { const key=decodeURIComponent(path.split('/')[2]||''); const found=products.find(p=>String(p.slug)===key||String(p.id)===key); const pid=Number(found?.id||key); page=<ProductPage id={pid} navigate={navigate} addToCart={addToCart} products={products} isFavorite={favorites.includes(pid)} favorites={favorites} onToggleFavorite={toggleFavorite} onViewed={markViewed}/> }
  else if(path==='/cart') page=<CartPage cart={cart} navigate={navigate} updateQuantity={updateQuantity} removeFromCart={removeFromCart} products={products}/>
  else if(path==='/checkout') {try{window.nordhomeTrack?.('begin_checkout',{currency:'UAH',value:cart.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.quantity)||1),0),items:cart.map(i=>({item_id:String(i.id),item_name:i.name,quantity:i.quantity,price:Number(i.price)||0}))})}catch{}; page=<CheckoutPage cart={cart} navigate={navigate} clearCart={clearCart} onOrderPlaced={loadProducts}/> }
  else if(path==='/track-order') page=<OrderTrackingPage navigate={navigate}/>
  else if(path==='/favorites') page=<FavoritesPage navigate={navigate} products={products} favorites={favorites} onToggleFavorite={toggleFavorite}/>
  else if(path==='/recent') page=<RecentPage navigate={navigate} products={products} recent={recent} favorites={favorites} onToggleFavorite={toggleFavorite} clearRecent={()=>setRecent([])}/>
  else if(path==='/account') page=<CustomerAccountPage navigate={navigate} onRepeatOrder={repeatOrder}/>
  else if(path==='/template') page=<TemplateShowcasePage navigate={navigate} settings={settings}/>
  else if(path==='/admin') return <AdminPage navigate={navigate} onProductsChanged={loadProducts} onSettingsChanged={loadSettings}/>
  else if(path==='/about') page=<SimplePage title={`Про ${settings.storeName || 'NordHome'}`} text={settings.aboutText || `${settings.storeName || 'NordHome'} — інтернет-магазин сучасних товарів для дому та офісу.`} navigate={navigate}/>
  else if(path==='/delivery') page=<SimplePage title="Доставка та оплата" text={settings.deliveryText || `Доставка по Україні здійснюється доступними перевізниками. Вартість і строки залежать від населеного пункту, габаритів товару та обраного способу доставки. Доступні способи оплати відображаються під час оформлення замовлення. Деталі замовлення менеджер може уточнити після оформлення.`} navigate={navigate}/>
  else if(path==='/returns') page=<SimplePage title="Повернення та обмін" text={settings.returnsText || `Умови повернення та обміну залежать від типу товару, його стану та вимог законодавства України. Перед поверненням зв’яжіться з магазином за контактами, вказаними на сайті. Для реального запуску магазину заповніть цей розділ актуальними умовами вашого бізнесу.`} navigate={navigate}/>
  else if(path==='/offer') page=<SimplePage title="Публічна оферта" text={settings.offerText || `Ця сторінка призначена для публічної оферти продавця. Перед запуском магазину заповніть реквізити продавця, порядок оформлення та оплати замовлень, умови доставки, відповідальність сторін та інші необхідні положення.`} navigate={navigate}/>
  else if(path==='/privacy') page=<SimplePage title="Політика конфіденційності" text={settings.privacyText || `Ця сторінка описує правила обробки персональних даних покупців. Перед реальним запуском вкажіть, які дані збираються, для яких цілей використовуються, як зберігаються та як покупець може звернутися щодо своїх даних.`} navigate={navigate}/>
  else if(path==='/contacts') page=<SimplePage title="Контакти" text={`${settings.phone ? `Телефон: ${settings.phone}. ` : ''}${settings.email ? `Email: ${settings.email}. ` : ''}${settings.city || 'Львів'}, Україна.${settings.instagram ? ` Instagram: ${settings.instagram}` : ''}`} navigate={navigate}/>
  else page=<SimplePage title="Сторінку не знайдено" navigate={navigate}/>
  return <><ThemeManager settings={settings}/><BrandAssetsManager settings={settings}/><AnalyticsManager settings={settings}/><SeoManager path={path} products={products} settings={settings}/>{settings.demoMode&&<div className="demo-site-badge">{settings.demoBadge||'Демо-магазин'}</div>}<Header navigate={navigate} cartCount={cartCount} favoriteCount={favorites.length} recentCount={recent.length} settings={settings}/>{page}<Footer navigate={navigate} settings={settings}/></>
}
