import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import { query, withTransaction } from './db.js'
import './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || '0.0.0.0'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const APP_VERSION = '3.28.0'
const uploadsDir = path.join(__dirname, 'public', 'uploads')
const distDir = path.join(__dirname, 'dist')
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
const ADMIN_PASSWORD_LEGACY = process.env.ADMIN_PASSWORD || ''
const sessions = new Map()
const adminLoginAttempts = new Map()
const apiRateBuckets = new Map()
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 7
const API_WINDOW_MS = 60 * 1000
const API_MAX_REQUESTS = 180

function clean(value, max = 300) { return String(value ?? '').trim().slice(0, max) }
function clientIp(req) {
  const forwarded = clean(req.headers['x-forwarded-for'] || '', 300).split(',')[0].trim()
  return forwarded || req.socket?.remoteAddress || 'unknown'
}
function pruneRateMap(map, olderThan) {
  const now = Date.now()
  for (const [key, value] of map) if ((value.resetAt || 0) < now - olderThan) map.delete(key)
}
function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  if (IS_PRODUCTION) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' https://www.googletagmanager.com https://connect.facebook.net 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
}
function apiRateLimited(req, res) {
  if (!String(req.url || '').startsWith('/api/')) return false
  const key = clientIp(req)
  const now = Date.now()
  let bucket = apiRateBuckets.get(key)
  if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + API_WINDOW_MS }
  bucket.count += 1
  apiRateBuckets.set(key, bucket)
  res.setHeader('RateLimit-Limit', String(API_MAX_REQUESTS))
  res.setHeader('RateLimit-Remaining', String(Math.max(0, API_MAX_REQUESTS - bucket.count)))
  if (bucket.count > API_MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
    json(res, 429, {ok:false,error:'Забагато запитів. Спробуйте трохи пізніше.'})
    return true
  }
  if (Math.random() < 0.01) pruneRateMap(apiRateBuckets, API_WINDOW_MS)
  return false
}
function adminLoginRateState(req) {
  const key = clientIp(req)
  const now = Date.now()
  let state = adminLoginAttempts.get(key)
  if (!state || state.resetAt <= now) state = { count: 0, resetAt: now + LOGIN_WINDOW_MS }
  adminLoginAttempts.set(key, state)
  return [key, state]
}
function verifyAdminPassword(password) {
  const pwd = String(password || '')
  if (ADMIN_PASSWORD_HASH) return passwordVerify(pwd, ADMIN_PASSWORD_HASH)
  return Boolean(ADMIN_PASSWORD_LEGACY) && safeEqual(pwd, ADMIN_PASSWORD_LEGACY)
}
function escapeHtml(value) { return clean(value, 2000).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') }
function json(res, status, payload) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(payload)) }
async function readJsonBody(req, maxBytes = 200_000) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > maxBytes) throw new Error('too_large')
  }
  return body ? JSON.parse(body) : {}
}
function rowToProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    shortDescription: row.short_description || '',
    description: row.description || '',
    dimensions: row.dimensions || '',
    material: row.material || '',
    colors: Array.isArray(row.colors) ? row.colors : [],
    availability: row.availability || 'В наявності',
    availabilityMode: row.availability_mode || (String(row.availability||'').toLowerCase().includes('під замовлення') ? 'preorder' : 'auto'),
    specs: Array.isArray(row.specs) ? row.specs : [],
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    active: row.active !== false,
    sku: row.sku || '',
    stock: Number(row.stock || 0),
    isNew: row.is_new === true,
    bestseller: row.bestseller === true,
    salePercent: Number(row.sale_percent || 0),
    oldPrice: Number(row.old_price || 0),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    slug: row.slug || '',
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
  }
}

async function readProducts(includeInactive = true) {
  const result = await query(`SELECT p.*, COALESCE(r.rating,0) AS rating, COALESCE(r.review_count,0) AS review_count FROM products p LEFT JOIN (SELECT product_id, ROUND(AVG(rating)::numeric,1) AS rating, COUNT(*)::int AS review_count FROM product_reviews WHERE status='approved' GROUP BY product_id) r ON r.product_id=p.id ${includeInactive ? '' : 'WHERE p.active = TRUE'} ORDER BY p.id ASC`)
  return result.rows.map(rowToProduct)
}

async function readOrders() {
  const result = await query(`
    SELECT o.*,
      COALESCE(json_agg(json_build_object(
        'id', oi.product_id,
        'name', oi.name,
        'selectedColor', oi.selected_color,
        'price', oi.price,
        'quantity', oi.quantity
      ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `)
  return result.rows.map(row => ({
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    status: row.status,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      phone: row.customer_phone,
      email: row.customer_email || '',
    },
    delivery: row.delivery || {},
    payment: row.payment,
    comment: row.comment || '',
    items: Array.isArray(row.items) ? row.items.map(item => ({...item, id: Number(item.id), price: Number(item.price), quantity: Number(item.quantity)})) : [],
    subtotal: Number(row.subtotal || row.total),
    discount: Number(row.discount || 0),
    promoCode: row.promo_code || '',
    total: Number(row.total),
    trackingNumber: row.tracking_number || '',
    shipmentCarrier: row.shipment_carrier || row.delivery?.carrier || '',
    deliveryStatus: row.delivery_status || 'pending',
    shipmentUpdatedAt: row.shipment_updated_at ? new Date(row.shipment_updated_at).toISOString() : null,
  }))
}


function normalizePhone(value) { return String(value || '').replace(/\D/g,'').slice(-12) }

function normalizeEmail(value){return clean(value,120).toLowerCase()}
function tokenHash(token){return crypto.createHash('sha256').update(String(token)).digest('hex')}
function passwordHash(password){
  const pwd=String(password||'')
  if(pwd.length<6)throw new Error('Пароль має містити щонайменше 6 символів.')
  const salt=crypto.randomBytes(16).toString('hex')
  const hash=crypto.scryptSync(pwd,salt,64).toString('hex')
  return `${salt}:${hash}`
}
function passwordVerify(password,stored){
  try{const [salt,hex]=String(stored||'').split(':');if(!salt||!hex)return false;const a=Buffer.from(hex,'hex');const b=crypto.scryptSync(String(password||''),salt,64);return a.length===b.length&&crypto.timingSafeEqual(a,b)}catch{return false}
}
function customerBearer(req){return clean(req.headers.authorization||'',500).replace(/^Bearer\s+/i,'')}
async function customerFromRequest(req){
  const token=customerBearer(req);if(!token)return null
  const h=tokenHash(token)
  const r=await query(`SELECT c.* FROM customer_sessions s JOIN customers c ON c.id=s.customer_id WHERE s.token_hash=$1 AND s.expires_at>NOW()`,[h])
  return r.rows[0]||null
}
function customerPublic(row){return {id:Number(row.id),firstName:row.first_name||'',lastName:row.last_name||'',phone:row.phone||'',email:row.email||'',savedDelivery:row.saved_delivery||{}}}
async function createCustomerSession(customerId){
  const token=crypto.randomBytes(32).toString('hex'),h=tokenHash(token)
  await query(`INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')`,[h,customerId])
  return token
}
async function customerRegister(req,res){
  try{
    const b=await readJsonBody(req),firstName=clean(b.firstName,80),lastName=clean(b.lastName,80),phone=clean(b.phone,40),pn=normalizePhone(phone),email=clean(b.email,120),en=normalizeEmail(email),pwd=String(b.password||'')
    if(!firstName||!lastName||pn.length<9)return json(res,400,{ok:false,error:'Заповніть ім’я, прізвище та телефон.'})
    if(en&&!/^\S+@\S+\.\S+$/.test(en))return json(res,400,{ok:false,error:'Перевірте email.'})
    const hash=passwordHash(pwd)
    const r=await query(`INSERT INTO customers(first_name,last_name,phone,phone_normalized,email,email_normalized,password_hash) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[firstName,lastName,phone,pn,email,en,hash])
    const token=await createCustomerSession(r.rows[0].id)
    return json(res,201,{ok:true,token,customer:customerPublic(r.rows[0])})
  }catch(e){const msg=/unique|duplicate/i.test(e.message)?'Акаунт з таким телефоном або email уже існує.':e.message;return json(res,400,{ok:false,error:clean(msg,220)})}
}
async function customerLogin(req,res){
  try{const b=await readJsonBody(req),login=clean(b.login,120),pwd=String(b.password||''),pn=normalizePhone(login),en=normalizeEmail(login);const r=await query(`SELECT * FROM customers WHERE phone_normalized=$1 OR email_normalized=$2 LIMIT 1`,[pn,en]);const c=r.rows[0];if(!c||!passwordVerify(pwd,c.password_hash))return json(res,401,{ok:false,error:'Невірний телефон/email або пароль.'});const token=await createCustomerSession(c.id);return json(res,200,{ok:true,token,customer:customerPublic(c)})}catch(e){return json(res,400,{ok:false,error:'Не вдалося увійти.'})}
}
async function customerMe(req,res){const c=await customerFromRequest(req);if(!c)return json(res,401,{ok:false,error:'Потрібен вхід.'});return json(res,200,{ok:true,customer:customerPublic(c)})}
async function customerLogout(req,res){const t=customerBearer(req);if(t)await query('DELETE FROM customer_sessions WHERE token_hash=$1',[tokenHash(t)]);return json(res,200,{ok:true})}
async function customerOrders(req,res){
  const c=await customerFromRequest(req);if(!c)return json(res,401,{ok:false,error:'Потрібен вхід.'})
  const r=await query(`SELECT o.*,COALESCE(json_agg(json_build_object('id',oi.product_id,'name',oi.name,'selectedColor',oi.selected_color,'price',oi.price,'quantity',oi.quantity) ORDER BY oi.id) FILTER(WHERE oi.id IS NOT NULL),'[]'::json) items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE RIGHT(REGEXP_REPLACE(o.customer_phone,'\\D','','g'),12)=$1 OR ($2<>'' AND LOWER(o.customer_email)=$2) GROUP BY o.id ORDER BY o.created_at DESC`,[c.phone_normalized,c.email_normalized])
  return json(res,200,{ok:true,orders:r.rows.map(row=>({id:row.id,status:row.status,createdAt:new Date(row.created_at).toISOString(),updatedAt:row.updated_at?new Date(row.updated_at).toISOString():null,delivery:row.delivery||{},total:Number(row.total||0),trackingNumber:row.tracking_number||'',shipmentCarrier:row.shipment_carrier||row.delivery?.carrier||'',deliveryStatus:row.delivery_status||'pending',shipmentUpdatedAt:row.shipment_updated_at?new Date(row.shipment_updated_at).toISOString():null,items:(row.items||[]).map(i=>({...i,id:Number(i.id),price:Number(i.price),quantity:Number(i.quantity)}))}))})
}
async function customerUpdateProfile(req,res){
  const c=await customerFromRequest(req);if(!c)return json(res,401,{ok:false,error:'Потрібен вхід.'})
  try{const b=await readJsonBody(req),firstName=clean(b.firstName,80)||c.first_name,lastName=clean(b.lastName,80)||c.last_name,email=clean(b.email,120),en=normalizeEmail(email),saved=(b.savedDelivery&&typeof b.savedDelivery==='object')?b.savedDelivery:{};if(en&&!/^\S+@\S+\.\S+$/.test(en))return json(res,400,{ok:false,error:'Перевірте email.'});const r=await query(`UPDATE customers SET first_name=$1,last_name=$2,email=$3,email_normalized=$4,saved_delivery=$5::jsonb,updated_at=NOW() WHERE id=$6 RETURNING *`,[firstName,lastName,email,en,JSON.stringify(saved),c.id]);return json(res,200,{ok:true,customer:customerPublic(r.rows[0])})}catch(e){return json(res,400,{ok:false,error:/unique|duplicate/i.test(e.message)?'Такий email уже використовується.':'Не вдалося зберегти профіль.'})}
}

async function trackOrder(req,res){
  try{
    const body=await readJsonBody(req)
    const orderId=clean(body.orderId,80).toUpperCase()
    const phone=normalizePhone(body.phone)
    if(!orderId||phone.length<9)return json(res,400,{ok:false,error:'Вкажіть номер замовлення та телефон.'})
    const result=await query(`
      SELECT o.*, COALESCE(json_agg(json_build_object(
        'id',oi.product_id,'name',oi.name,'selectedColor',oi.selected_color,'price',oi.price,'quantity',oi.quantity
      ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]'::json) AS items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE UPPER(o.id)=UPPER($1)
      GROUP BY o.id
    `,[orderId])
    const row=result.rows[0]
    if(!row||normalizePhone(row.customer_phone)!==phone)return json(res,404,{ok:false,error:'Замовлення з такими даними не знайдено.'})
    const items=Array.isArray(row.items)?row.items.map(i=>({...i,id:Number(i.id),price:Number(i.price),quantity:Number(i.quantity)})):[]
    return json(res,200,{ok:true,order:{id:row.id,status:row.status,createdAt:new Date(row.created_at).toISOString(),updatedAt:row.updated_at?new Date(row.updated_at).toISOString():null,delivery:row.delivery||{},payment:row.payment||'',trackingNumber:row.tracking_number||'',shipmentCarrier:row.shipment_carrier||row.delivery?.carrier||'',deliveryStatus:row.delivery_status||'pending',shipmentUpdatedAt:row.shipment_updated_at?new Date(row.shipment_updated_at).toISOString():null,items,total:Number(row.total||0)}})
  }catch(error){console.error('Track order:',error.message);return json(res,500,{ok:false,error:'Не вдалося перевірити замовлення. Спробуйте ще раз.'})}
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b))
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb)
}
function adminToken(req) { return clean(req.headers.authorization || '', 300).replace(/^Bearer\s+/i, '') }
function isAdmin(req) {
  const token = adminToken(req); if (!token) return false
  const expires = sessions.get(token); if (!expires || expires < Date.now()) { sessions.delete(token); return false }
  return true
}
function requireAdmin(req, res) { if (!isAdmin(req)) { json(res, 401, {ok:false,error:'Потрібен вхід адміністратора.'}); return false } return true }

function slugify(value){
  const map={'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ye','ж':'zh','з':'z','и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'yu','я':'ya'}
  return String(value||'').toLowerCase().split('').map(c=>map[c]??c).join('').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)
}

function sanitizeProduct(body, forcedId) {
  const price = Number(body.price)
  const product = {
    id: Number(forcedId ?? body.id),
    name: clean(body.name, 160),
    price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
    category: clean(body.category, 100),
    image: clean(body.image, 1200),
    shortDescription: clean(body.shortDescription, 300),
    description: clean(body.description, 2500),
    dimensions: clean(body.dimensions, 160),
    material: clean(body.material, 220),
    colors: Array.isArray(body.colors) ? body.colors.map(v=>clean(v,80)).filter(Boolean).slice(0,30) : [],
    availability: clean(body.availability, 160) || 'В наявності',
    availabilityMode: ['auto','preorder','out'].includes(clean(body.availabilityMode,20)) ? clean(body.availabilityMode,20) : 'auto',
    specs: Array.isArray(body.specs) ? body.specs.map(v=>clean(v,180)).filter(Boolean).slice(0,30) : [],
    gallery: Array.isArray(body.gallery) ? body.gallery.map(v=>clean(v,1200)).filter(Boolean).slice(0,20) : [],
    active: body.active !== false,
    sku: clean(body.sku, 80),
    stock: Math.max(0, Math.round(Number(body.stock) || 0)),
    isNew: body.isNew === true,
    bestseller: body.bestseller === true,
    salePercent: Math.max(0, Math.min(95, Math.round(Number(body.salePercent) || 0))),
    oldPrice: Math.max(0, Math.round(Number(body.oldPrice) || 0)),
    slug: slugify(clean(body.slug,160) || clean(body.name,160)),
    seoTitle: clean(body.seoTitle,180),
    seoDescription: clean(body.seoDescription,320),
  }
  if (product.salePercent > 0 && product.oldPrice <= product.price) {
    product.oldPrice = Math.round(product.price / (1 - product.salePercent / 100) / 100) * 100
  }
  if (product.oldPrice > product.price && product.salePercent === 0) {
    product.salePercent = Math.max(1, Math.min(95, Math.round((1 - product.price / product.oldPrice) * 100)))
  }
  if (product.salePercent === 0) product.oldPrice = 0
  if (!product.gallery.length && product.image) product.gallery = [product.image]
  if (!product.image && product.gallery[0]) product.image = product.gallery[0]
  if (!product.name || !product.category || !product.image) throw new Error('Заповніть назву, категорію та фото товару.')
  return product
}

const ORDER_STATUS_EMAIL = {
  new: { label: 'Замовлення отримано', text: 'Ми отримали ваше замовлення та передали його в обробку.' },
  confirmed: { label: 'Замовлення підтверджено', text: 'Ваше замовлення підтверджено та готується до відправлення.' },
  shipped: { label: 'Замовлення відправлено', text: 'Ваше замовлення передано службі доставки.' },
  done: { label: 'Замовлення виконано', text: 'Замовлення виконано. Дякуємо за покупку!' },
  cancelled: { label: 'Замовлення скасовано', text: 'Замовлення скасовано. Якщо це сталося помилково, зв’яжіться з магазином.' },
}

let mailTransporter = null
function emailIsConfigured() { return Boolean(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_FROM) }
function getMailTransporter() {
  if (mailTransporter) return mailTransporter
  if (!emailIsConfigured()) return null
  const port = Math.max(1, Number(process.env.EMAIL_SMTP_PORT || 587))
  const secure = String(process.env.EMAIL_SMTP_SECURE || '').toLowerCase() === 'true'
  const user = process.env.EMAIL_SMTP_USER || ''
  const pass = process.env.EMAIL_SMTP_PASS || ''
  mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
  })
  return mailTransporter
}
async function getStoreIdentity() {
  try {
    const r = await query('SELECT data FROM store_settings WHERE id=1')
    const d = r.rows[0]?.data || {}
    return { name: clean(d.storeName,120) || 'NordHome', phone: clean(d.phone,80), email: clean(d.email,160) }
  } catch { return { name: 'NordHome', phone: '', email: '' } }
}
function emailMoney(v) { return `${Number(v || 0).toLocaleString('uk-UA')} грн` }
async function sendCustomerOrderEmail(order, status = order.status || 'new') {
  if (!order?.customer?.email || !emailIsConfigured()) return false
  const transporter = getMailTransporter()
  if (!transporter) return false
  const store = await getStoreIdentity()
  const state = ORDER_STATUS_EMAIL[status] || ORDER_STATUS_EMAIL.new
  const rows = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)}${item.selectedColor ? `<div style="font-size:12px;color:#777">Колір: ${escapeHtml(item.selectedColor)}</div>` : ''}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center">${Number(item.quantity || 0)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">${emailMoney(Number(item.price || 0) * Number(item.quantity || 0))}</td>
    </tr>`).join('')
  const delivery = [order.delivery?.carrier, order.delivery?.deliveryType, order.delivery?.city, order.delivery?.point || order.delivery?.address].filter(Boolean).map(v=>escapeHtml(v)).join(' · ')
  const publicUrl = clean(process.env.PUBLIC_URL,500).replace(/\/$/,'')
  const trackHtml = publicUrl ? `<p style="margin:24px 0 0"><a href="${escapeHtml(publicUrl)}/track-order" style="display:inline-block;background:#1d1f1b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px">Перевірити статус замовлення</a></p>` : ''
  const html = `<!doctype html><html><body style="margin:0;background:#f4f3ef;font-family:Arial,sans-serif;color:#181a17"><div style="max-width:640px;margin:0 auto;padding:28px 14px"><div style="background:#fff;border-radius:16px;padding:28px"><div style="font-size:22px;font-weight:800;margin-bottom:22px">${escapeHtml(store.name)}</div><div style="font-size:13px;color:#777;text-transform:uppercase;letter-spacing:.08em">Замовлення ${escapeHtml(order.id)}</div><h1 style="font-size:26px;margin:8px 0 10px">${escapeHtml(state.label)}</h1><p style="font-size:16px;line-height:1.55;margin:0 0 22px">${escapeHtml(state.text)}</p><p style="margin:0 0 20px"><b>${escapeHtml(order.customer.firstName || '')},</b> дякуємо за замовлення.</p><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding-bottom:8px">Товар</th><th style="text-align:center;padding-bottom:8px">К-сть</th><th style="text-align:right;padding-bottom:8px">Сума</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:18px;font-size:15px"><p><b>Доставка:</b> ${delivery || '—'}</p><p><b>Оплата:</b> ${escapeHtml(order.payment || '—')}</p>${order.discount ? `<p><b>Знижка:</b> −${emailMoney(order.discount)}</p>` : ''}<p style="font-size:20px"><b>Разом: ${emailMoney(order.total)}</b></p></div>${trackHtml}<div style="margin-top:28px;padding-top:18px;border-top:1px solid #eee;color:#777;font-size:13px">${store.phone ? `Телефон: ${escapeHtml(store.phone)}<br>` : ''}${store.email ? `Email магазину: ${escapeHtml(store.email)}` : ''}</div></div></div></body></html>`
  const subject = `${store.name}: ${state.label} — ${order.id}`
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: order.customer.email, subject, html, text: `${state.label}\nЗамовлення: ${order.id}\nРазом: ${emailMoney(order.total)}\n${state.text}` })
  return true
}

async function sendTelegram(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  const items = order.items.map((item, index) => `${index+1}. <b>${escapeHtml(item.name)}</b>\nКолір: ${escapeHtml(item.selectedColor || '—')}\n${item.quantity} × ${item.price.toLocaleString('uk-UA')} грн`).join('\n\n')
  const text = [
    '🛒 <b>Нове замовлення NordHome</b>', `№ <code>${escapeHtml(order.id)}</code>`, '',
    `<b>Клієнт:</b> ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}`,
    `<b>Телефон:</b> ${escapeHtml(order.customer.phone)}`, order.customer.email ? `<b>Email:</b> ${escapeHtml(order.customer.email)}` : '', '',
    `<b>Доставка:</b> ${escapeHtml(order.delivery.carrier)} — ${escapeHtml(order.delivery.deliveryType)}`, `<b>Населений пункт:</b> ${escapeHtml(order.delivery.city)}`,
    order.delivery.point ? `<b>Відділення / поштомат:</b> ${escapeHtml(order.delivery.point)}` : '', order.delivery.address ? `<b>Адреса:</b> ${escapeHtml(order.delivery.address)}` : '',
    `<b>Оплата:</b> ${escapeHtml(order.payment)}`, order.promoCode ? `<b>Промокод:</b> ${escapeHtml(order.promoCode)} (−${order.discount.toLocaleString('uk-UA')} грн)` : '', order.comment ? `<b>Коментар:</b> ${escapeHtml(order.comment)}` : '', '', items, '', `💰 <b>Разом: ${order.total.toLocaleString('uk-UA')} грн</b>`
  ].filter(Boolean).join('\n')
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,parse_mode:'HTML'})})
  if (!response.ok) throw new Error(`Telegram API ${response.status}: ${(await response.text()).slice(0,250)}`)
  return true
}

const NP_CACHE_TTL = 30 * 60 * 1000
const npCache = new Map()
const npPending = new Map()

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function npCacheGet(key) {
  const entry = npCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { npCache.delete(key); return null }
  return entry.value
}
function npCacheSet(key, value, ttl = NP_CACHE_TTL) {
  npCache.set(key, { value, expiresAt: Date.now() + ttl })
}

async function novaRequest(modelName, calledMethod, methodProperties = {}, attempt = 0) {
  const apiKey = process.env.NOVA_POSHTA_API_KEY
  if (!apiKey) { const error = new Error('NOVA_POSHTA_API_KEY не налаштований у конфігурації NordHome'); error.code = 'np_key_missing'; throw error }
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey,modelName,calledMethod,methodProperties})})
  const payload = await response.json().catch(() => null)
  const messages = payload ? [...(payload.errors||[]),...(payload.warnings||[])].filter(Boolean) : []
  const message = messages.join('; ') || `Nova Poshta API HTTP ${response.status}`
  const rateLimited = response.status === 429 || /too many requests|rate limit/i.test(message)
  if (rateLimited && attempt < 1) { await sleep(900); return novaRequest(modelName, calledMethod, methodProperties, attempt + 1) }
  if (rateLimited) { const error = new Error('Нова пошта тимчасово обмежила кількість запитів. Зачекайте кілька секунд і спробуйте ще раз.'); error.code = 'np_rate_limit'; throw error }
  if (!response.ok || !payload) throw new Error(`Nova Poshta API HTTP ${response.status}`)
  if (!payload.success) throw new Error(message || 'Нова пошта повернула помилку API')
  return payload.data || []
}
function normalizeUa(value) { return clean(value,180).toLocaleLowerCase('uk-UA').replace(/[’'`]/g,'').replace(/\s+/g,' ').trim() }
function regionBase(value) { return normalizeUa(value).replace(/\bобласть\b/g,'').replace(/\bобл\.?\b/g,'').trim() }

async function loadNovaWarehouseData(settlementName, regionName) {
  const key = `np:${normalizeUa(settlementName)}:${regionBase(regionName)}`
  const cached = npCacheGet(key)
  if (cached) return cached
  if (npPending.has(key)) return npPending.get(key)

  const task = (async () => {
    let settlements = await novaRequest('AddressGeneral','getSettlements',{FindByString:settlementName,Page:'1',Limit:'100'})
    const target=normalizeUa(settlementName), targetRegion=regionBase(regionName), exact=settlements.filter(item=>normalizeUa(item.Description)===target)
    if(exact.length) settlements=exact
    if(targetRegion){const regional=settlements.filter(item=>{const area=regionBase(item.AreaDescription||'');return area&&(area.includes(targetRegion)||targetRegion.includes(area))});if(regional.length)settlements=regional}
    const settlement=settlements[0]
    if(!settlement?.Ref) { const error = new Error('Нова пошта не знайшла цей населений пункт.'); error.code='np_not_found'; throw error }
    const warehouses=await novaRequest('AddressGeneral','getWarehouses',{SettlementRef:settlement.Ref,Page:'1',Limit:'500',Language:'UA'})
    const value = { settlement, warehouses }
    npCacheSet(key, value)
    return value
  })()

  npPending.set(key, task)
  try { return await task } finally { npPending.delete(key) }
}

async function novaWarehouses(req,res,url) {
  try {
    const settlementName=clean(url.searchParams.get('settlement'),120), regionName=clean(url.searchParams.get('region'),120), type=clean(url.searchParams.get('type'),40)
    if (!settlementName) return json(res,400,{ok:false,error:'Не вказано населений пункт.'})
    const { settlement, warehouses } = await loadNovaWarehouseData(settlementName, regionName)
    const isLocker=item=>/поштомат/i.test(`${item.Description||''} ${item.DescriptionRu||''} ${item.CategoryOfWarehouse||''}`)
    const filtered=warehouses.filter(item=>type==='parcel-locker'?isLocker(item):!isLocker(item)).map(item=>({ref:item.Ref,number:item.Number||'',description:item.Description||'',shortAddress:item.ShortAddress||item.Description||'',category:item.CategoryOfWarehouse||'',maxWeight:item.TotalMaxWeightAllowed||item.PlaceMaxWeightAllowed||''}))
    return json(res,200,{ok:true,cached:true,settlement:{ref:settlement.Ref,description:settlement.Description,area:settlement.AreaDescription||'',region:settlement.RegionsDescription||''},warehouses:filtered})
  } catch(error){
    console.error('Nova Poshta API:',error.message)
    if(error.code==='np_key_missing') return json(res,503,{ok:false,error:'API-ключ Нової пошти ще не доданий у конфігурацію NordHome.'})
    if(error.code==='np_rate_limit') return json(res,429,{ok:false,code:'rate_limited',error:error.message,retryAfter:5})
    if(error.code==='np_not_found') return json(res,404,{ok:false,error:error.message})
    return json(res,502,{ok:false,error:`Не вдалося отримати відділення Нової пошти: ${clean(error.message,220)}`})
  }
}


function normalizePromoCode(value){return clean(value,40).toUpperCase().replace(/[^A-Z0-9_-]/g,'')}
async function resolvePromo(client, rawCode, subtotal){
  const code=normalizePromoCode(rawCode)
  if(!code)return {code:'',discount:0,total:subtotal,promo:null}
  const result=await client.query(`SELECT p.*, (SELECT COUNT(*)::int FROM orders o WHERE o.promo_code=p.code AND o.status <> 'cancelled') AS used FROM promo_codes p WHERE p.code=$1 FOR UPDATE`,[code])
  const p=result.rows[0]
  if(!p)throw new Error('Промокод не знайдено.')
  if(!p.active)throw new Error('Цей промокод вимкнено.')
  const now=Date.now()
  if(p.starts_at && new Date(p.starts_at).getTime()>now)throw new Error('Промокод ще не активний.')
  if(p.ends_at && new Date(p.ends_at).getTime()<now)throw new Error('Термін дії промокоду завершився.')
  if(Number(p.min_order)>subtotal)throw new Error(`Промокод діє від ${Number(p.min_order).toLocaleString('uk-UA')} грн.`)
  if(Number(p.max_uses)>0 && Number(p.used)>=Number(p.max_uses))throw new Error('Ліміт використань промокоду вичерпано.')
  let discount=p.discount_type==='percent'?Math.round(subtotal*Number(p.discount_value)/100):Number(p.discount_value)
  discount=Math.max(0,Math.min(discount,subtotal))
  return {code:p.code,discount,total:subtotal-discount,promo:{code:p.code,type:p.discount_type,value:Number(p.discount_value)}}
}
async function validatePromo(req,res){
  try{
    const body=await readJsonBody(req), subtotal=Math.max(0,Math.round(Number(body.subtotal)||0))
    const result=await withTransaction(client=>resolvePromo(client,body.code,subtotal))
    return json(res,200,{ok:true,...result})
  }catch(error){return json(res,400,{ok:false,error:clean(error.message,220)})}
}

async function createOrder(req,res){
  try{
    const body=await readJsonBody(req)
    const customer={firstName:clean(body.customer?.firstName,80),lastName:clean(body.customer?.lastName,80),phone:clean(body.customer?.phone,40),email:clean(body.customer?.email,120)}
    const delivery={city:clean(body.delivery?.city,100),settlement:body.delivery?.settlement&&typeof body.delivery.settlement==='object'?body.delivery.settlement:null,carrierId:clean(body.delivery?.carrierId,60),carrier:clean(body.delivery?.carrier,100),deliveryTypeId:clean(body.delivery?.deliveryTypeId,60),deliveryType:clean(body.delivery?.deliveryType,100),point:clean(body.delivery?.point,240),pointRef:clean(body.delivery?.pointRef,120),address:clean(body.delivery?.address,240)}
    const payment=clean(body.payment,100),comment=clean(body.comment,600),promoCode=normalizePromoCode(body.promoCode)
    const requested=Array.isArray(body.items)?body.items.slice(0,50).map(item=>({id:Number(item.id),selectedColor:clean(item.selectedColor,80),quantity:Math.max(1,Math.min(99,Number(item.quantity)||1))})).filter(item=>Number.isFinite(item.id)):[]
    const phoneDigits=normalizePhone(customer.phone)
    const phoneValid=(phoneDigits.length===10&&phoneDigits.startsWith('0'))||(phoneDigits.length===12&&phoneDigits.startsWith('380'))
    const emailValid=!customer.email||/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(customer.email)
    const allowedCarriers={
      'nova-poshta':['branch','parcel-locker','courier'],
      'ukrposhta':['branch','courier'],
      'meest':['branch','parcel-locker','courier']
    }
    if(customer.firstName.length<2)return json(res,400,{ok:false,error:'Вкажіть коректне ім’я.'})
    if(customer.lastName.length<2)return json(res,400,{ok:false,error:'Вкажіть коректне прізвище.'})
    if(!phoneValid)return json(res,400,{ok:false,error:'Вкажіть коректний український номер телефону.'})
    if(!emailValid)return json(res,400,{ok:false,error:'Перевірте формат email.'})
    if(!delivery.city||!delivery.settlement)return json(res,400,{ok:false,error:'Оберіть населений пункт зі списку підказок.'})
    if(!allowedCarriers[delivery.carrierId])return json(res,400,{ok:false,error:'Оберіть коректну службу доставки.'})
    if(!allowedCarriers[delivery.carrierId].includes(delivery.deliveryTypeId))return json(res,400,{ok:false,error:'Оберіть коректний спосіб отримання.'})
    if(['branch','parcel-locker'].includes(delivery.deliveryTypeId)&&!delivery.point)return json(res,400,{ok:false,error:'Вкажіть відділення або поштомат.'})
    if(['branch','parcel-locker'].includes(delivery.deliveryTypeId)&&delivery.carrierId==='nova-poshta'&&!delivery.pointRef)return json(res,400,{ok:false,error:'Оберіть відділення або поштомат Нової пошти зі списку.'})
    if(delivery.deliveryTypeId==='courier'&&delivery.address.length<5)return json(res,400,{ok:false,error:'Вкажіть повну адресу доставки.'})
    if(!['Оплата при отриманні','Оплата карткою'].includes(payment))return json(res,400,{ok:false,error:'Оберіть коректний спосіб оплати.'})
    if(!requested.length)return json(res,400,{ok:false,error:'Додайте товар до кошика.'})
    const order={id:`NH-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,createdAt:new Date().toISOString(),status:'new',customer,delivery,payment,comment,items:[],subtotal:0,discount:0,promoCode:'',total:0}
    await withTransaction(async client => {
      for(const reqItem of requested){
        const result=await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE',[reqItem.id])
        const row=result.rows[0]
        if(!row||row.active===false)throw new Error('Один із товарів більше недоступний. Оновіть кошик.')
        const product=rowToProduct(row), mode=product.availabilityMode||'auto', qty=reqItem.quantity
        if(mode==='out')throw new Error(`${product.name}: товар позначений як «Немає в наявності».`)
        let reserved=0
        if(mode==='auto'){
          if(product.stock<qty)throw new Error(`${product.name}: доступно лише ${product.stock} шт.`)
          await client.query('UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2',[qty,product.id])
          reserved=qty
        }
        order.items.push({id:product.id,name:product.name,selectedColor:reqItem.selectedColor,price:product.price,quantity:qty,stockReserved:reserved})
      }
      order.subtotal=order.items.reduce((sum,item)=>sum+item.price*item.quantity,0)
      const promo=await resolvePromo(client,promoCode,order.subtotal)
      order.discount=promo.discount;order.promoCode=promo.code;order.total=promo.total
      await client.query(`INSERT INTO orders (id,status,customer_first_name,customer_last_name,customer_phone,customer_email,delivery,payment,comment,subtotal,discount,promo_code,total,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$14)`, [order.id,order.status,order.customer.firstName,order.customer.lastName,order.customer.phone,order.customer.email,JSON.stringify(order.delivery),order.payment,order.comment,order.subtotal,order.discount,order.promoCode,order.total,order.createdAt])
      for (const item of order.items) {
        await client.query(`INSERT INTO order_items (order_id,product_id,name,selected_color,price,quantity,stock_reserved,stock_applied) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [order.id,item.id,item.name,item.selectedColor,item.price,item.quantity,item.stockReserved,item.stockReserved>0])
      }
    });let telegramSent=false;try{telegramSent=await sendTelegram(order)}catch(error){console.error('Telegram notification failed:',error.message)}
    let emailSent=false;try{emailSent=await sendCustomerOrderEmail(order,'new')}catch(error){console.error('Customer email failed:',error.message)}
    return json(res,201,{ok:true,orderId:order.id,telegramSent,emailSent})
  }catch(error){console.error(error);return json(res,error.message==='too_large'?413:400,{ok:false,error:clean(error.message,240)||'Не вдалося зберегти замовлення.'})}
}

async function adminLogin(req,res){
  const [ipKey, attempt] = adminLoginRateState(req)
  const now = Date.now()
  if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((attempt.resetAt-now)/1000))))
    return json(res,429,{ok:false,error:'Забагато невдалих спроб входу. Спробуйте пізніше.'})
  }
  try{
    const body=await readJsonBody(req)
    const userOk=safeEqual(clean(body.username,100),ADMIN_USERNAME)
    const passOk=verifyAdminPassword(clean(body.password,300))
    if(!userOk||!passOk){
      attempt.count += 1; adminLoginAttempts.set(ipKey,attempt)
      return json(res,401,{ok:false,error:'Невірний логін або пароль.'})
    }
    adminLoginAttempts.delete(ipKey)
    const token=crypto.randomBytes(48).toString('base64url');sessions.set(token,Date.now()+ADMIN_SESSION_MS)
    return json(res,200,{ok:true,token,username:ADMIN_USERNAME})
  }catch{return json(res,400,{ok:false,error:'Некоректний запит.'})}
}
async function adminLogout(req,res){const token=adminToken(req);sessions.delete(token);return json(res,200,{ok:true})}
async function adminOrders(req,res){if(!requireAdmin(req,res))return;return json(res,200,{ok:true,orders:await readOrders()})}
async function adminOrderStatus(req,res,id){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req);const allowed=['new','confirmed','shipped','done','cancelled'];const status=clean(body.status,30)
    if(!allowed.includes(status))return json(res,400,{ok:false,error:'Некоректний статус.'})
    let statusChanged=false
    await withTransaction(async client=>{
      const current=(await client.query('SELECT status FROM orders WHERE id=$1 FOR UPDATE',[id])).rows[0]
      if(!current)throw new Error('Замовлення не знайдено.')
      statusChanged=current.status!==status
      if(current.status!=='cancelled'&&status==='cancelled'){
        const rows=(await client.query('SELECT id,product_id,stock_reserved,stock_applied FROM order_items WHERE order_id=$1 FOR UPDATE',[id])).rows
        for(const item of rows){if(item.stock_applied&&Number(item.stock_reserved)>0){await client.query('UPDATE products SET stock=stock+$1,updated_at=NOW() WHERE id=$2',[item.stock_reserved,item.product_id]);await client.query('UPDATE order_items SET stock_applied=FALSE WHERE id=$1',[item.id])}}
      }
      if(current.status==='cancelled'&&status!=='cancelled'){
        const rows=(await client.query('SELECT id,product_id,stock_reserved,stock_applied,name FROM order_items WHERE order_id=$1 FOR UPDATE',[id])).rows
        for(const item of rows){if(!item.stock_applied&&Number(item.stock_reserved)>0){const p=(await client.query('SELECT stock FROM products WHERE id=$1 FOR UPDATE',[item.product_id])).rows[0];if(!p||Number(p.stock)<Number(item.stock_reserved))throw new Error(`${item.name}: недостатній залишок для відновлення замовлення.`);await client.query('UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2',[item.stock_reserved,item.product_id]);await client.query('UPDATE order_items SET stock_applied=TRUE WHERE id=$1',[item.id])}}
      }
      await client.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2',[status,id])
    })
    const order=(await readOrders()).find(o=>o.id===id)
    let emailSent=false
    if(statusChanged&&order){try{emailSent=await sendCustomerOrderEmail(order,status)}catch(error){console.error('Customer status email failed:',error.message)}}
    return json(res,200,{ok:true,order,emailSent})
  }catch(error){console.error(error);return json(res,400,{ok:false,error:clean(error.message,240)||'Не вдалося оновити статус.'})}
}

async function adminOrderShipment(req,res,id){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req)
    const allowed=['pending','preparing','handed_over','in_transit','arrived','received','returned']
    const deliveryStatus=clean(body.deliveryStatus,30)||'pending'
    if(!allowed.includes(deliveryStatus))return json(res,400,{ok:false,error:'Некоректний статус доставки.'})
    const trackingNumber=clean(body.trackingNumber,120)
    const shipmentCarrier=clean(body.shipmentCarrier,80)
    const result=await query(`UPDATE orders SET tracking_number=$1,shipment_carrier=$2,delivery_status=$3,shipment_updated_at=NOW(),updated_at=NOW() WHERE id=$4 RETURNING id`,[trackingNumber,shipmentCarrier,deliveryStatus,id])
    if(!result.rowCount)return json(res,404,{ok:false,error:'Замовлення не знайдено.'})
    const order=(await readOrders()).find(o=>o.id===id)
    return json(res,200,{ok:true,order})
  }catch(error){console.error('Shipment update:',error);return json(res,400,{ok:false,error:clean(error.message,240)||'Не вдалося оновити доставку.'})}
}

async function adminBulkImportProducts(req,res){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req,2_500_000)
    const rows=Array.isArray(body.products)?body.products:[]
    if(!rows.length)return json(res,400,{ok:false,error:'Файл не містить товарів.'})
    if(rows.length>1000)return json(res,400,{ok:false,error:'За один імпорт можна додати до 1000 товарів.'})
    const report={created:0,updated:0,skipped:0,errors:[]}
    await withTransaction(async client=>{
      for(let i=0;i<rows.length;i++){
        try{
          const product=sanitizeProduct(rows[i],0)
          let existing=null
          if(product.sku) existing=(await client.query('SELECT * FROM products WHERE LOWER(sku)=LOWER($1) LIMIT 1',[product.sku])).rows[0]
          if(existing){
            await client.query(`UPDATE products SET name=$1,price=$2,category=$3,image=$4,short_description=$5,description=$6,dimensions=$7,material=$8,colors=$9::jsonb,availability=$10,availability_mode=$11,specs=$12::jsonb,gallery=$13::jsonb,active=$14,sku=$15,stock=$16,is_new=$17,bestseller=$18,sale_percent=$19,old_price=$20,slug=$21,seo_title=$22,seo_description=$23,updated_at=NOW() WHERE id=$24`,[product.name,product.price,product.category,product.image,product.shortDescription,product.description,product.dimensions,product.material,JSON.stringify(product.colors),product.availability,product.availabilityMode,JSON.stringify(product.specs),JSON.stringify(product.gallery),product.active,product.sku,product.stock,product.isNew,product.bestseller,product.salePercent,product.oldPrice,product.slug,product.seoTitle,product.seoDescription,existing.id])
            report.updated++
          }else{
            await client.query(`INSERT INTO products (name,price,category,image,short_description,description,dimensions,material,colors,availability,availability_mode,specs,gallery,active,sku,stock,is_new,bestseller,sale_percent,old_price,slug,seo_title,seo_description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13::jsonb,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,[product.name,product.price,product.category,product.image,product.shortDescription,product.description,product.dimensions,product.material,JSON.stringify(product.colors),product.availability,product.availabilityMode,JSON.stringify(product.specs),JSON.stringify(product.gallery),product.active,product.sku,product.stock,product.isNew,product.bestseller,product.salePercent,product.oldPrice,product.slug,product.seoTitle,product.seoDescription])
            report.created++
          }
        }catch(error){report.skipped++;if(report.errors.length<30)report.errors.push(`Рядок ${i+2}: ${clean(error.message,180)}`)}
      }
    })
    return json(res,200,{ok:true,...report,total:rows.length})
  }catch(error){console.error('Bulk product import:',error);return json(res,400,{ok:false,error:clean(error.message,240)||'Не вдалося імпортувати товари.'})}
}

async function adminCreateProduct(req,res){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req);const product=sanitizeProduct(body,0)
    const result=await query(`INSERT INTO products (name,price,category,image,short_description,description,dimensions,material,colors,availability,availability_mode,specs,gallery,active,sku,stock,is_new,bestseller,sale_percent,old_price,slug,seo_title,seo_description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13::jsonb,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *`,[product.name,product.price,product.category,product.image,product.shortDescription,product.description,product.dimensions,product.material,JSON.stringify(product.colors),product.availability,product.availabilityMode,JSON.stringify(product.specs),JSON.stringify(product.gallery),product.active,product.sku,product.stock,product.isNew,product.bestseller,product.salePercent,product.oldPrice,product.slug,product.seoTitle,product.seoDescription])
    return json(res,201,{ok:true,product:rowToProduct(result.rows[0])})
  }catch(error){return json(res,400,{ok:false,error:clean(error.message,240)})}
}
async function adminUpdateProduct(req,res,id){
  if(!requireAdmin(req,res))return
  try{
    const existing=(await query('SELECT * FROM products WHERE id=$1',[id])).rows[0]
    if(!existing)return json(res,404,{ok:false,error:'Товар не знайдено.'})
    const body=await readJsonBody(req);const product=sanitizeProduct({...rowToProduct(existing),...body},Number(id))
    const result=await query(`UPDATE products SET name=$1,price=$2,category=$3,image=$4,short_description=$5,description=$6,dimensions=$7,material=$8,colors=$9::jsonb,availability=$10,availability_mode=$11,specs=$12::jsonb,gallery=$13::jsonb,active=$14,sku=$15,stock=$16,is_new=$17,bestseller=$18,sale_percent=$19,old_price=$20,slug=$21,seo_title=$22,seo_description=$23,updated_at=NOW() WHERE id=$24 RETURNING *`,[product.name,product.price,product.category,product.image,product.shortDescription,product.description,product.dimensions,product.material,JSON.stringify(product.colors),product.availability,product.availabilityMode,JSON.stringify(product.specs),JSON.stringify(product.gallery),product.active,product.sku,product.stock,product.isNew,product.bestseller,product.salePercent,product.oldPrice,product.slug,product.seoTitle,product.seoDescription,id])
    return json(res,200,{ok:true,product:rowToProduct(result.rows[0])})
  }catch(error){return json(res,400,{ok:false,error:clean(error.message,240)})}
}
async function adminDeleteProduct(req,res,id){
  if(!requireAdmin(req,res))return
  const result=await query('DELETE FROM products WHERE id=$1',[id])
  if(!result.rowCount)return json(res,404,{ok:false,error:'Товар не знайдено.'})
  return json(res,200,{ok:true})
}
const SUPABASE_URL = clean(process.env.SUPABASE_URL || '', 500).replace(/\/$/, '')
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const SUPABASE_STORAGE_BUCKET = clean(process.env.SUPABASE_STORAGE_BUCKET || 'product-images', 80) || 'product-images'
function storageConfigured(){return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)}
async function ensureStorageBucket(){
  const headers={apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'}
  const check=await fetch(`${SUPABASE_URL}/storage/v1/bucket/${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}`,{headers})
  if(check.ok)return
  if(check.status!==404)throw new Error(`storage_bucket_${check.status}`)
  const create=await fetch(`${SUPABASE_URL}/storage/v1/bucket`,{method:'POST',headers,body:JSON.stringify({id:SUPABASE_STORAGE_BUCKET,name:SUPABASE_STORAGE_BUCKET,public:true,file_size_limit:8000000,allowed_mime_types:['image/jpeg','image/png','image/webp']})})
  if(!create.ok && create.status!==409)throw new Error(`storage_create_${create.status}`)
}
async function uploadToSupabase(buffer,ext){
  await ensureStorageBucket()
  const name=`products/${new Date().toISOString().slice(0,10)}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const mime=ext==='jpg'?'image/jpeg':`image/${ext}`
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}/${name.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':mime,'x-upsert':'false'},body:buffer})
  if(!r.ok)throw new Error(`storage_upload_${r.status}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(SUPABASE_STORAGE_BUCKET)}/${name.split('/').map(encodeURIComponent).join('/')}`
}
async function adminUploadImage(req,res){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req,12_000_000), dataUrl=String(body.dataUrl||''), match=dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/s)
    if(!match)return json(res,400,{ok:false,error:'Підтримуються JPG, PNG або WEBP.'})
    const ext=match[1]==='jpeg'?'jpg':match[1], buffer=Buffer.from(match[2],'base64');if(buffer.length>8_000_000)return json(res,413,{ok:false,error:'Фото завелике. Максимум 8 МБ.'})
    if(storageConfigured()){
      const url=await uploadToSupabase(buffer,ext)
      return json(res,201,{ok:true,url,storage:'supabase'})
    }
    if(IS_PRODUCTION)return json(res,503,{ok:false,error:'Постійне сховище фото не налаштоване. Додайте SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY у Render.'})
    await fs.mkdir(uploadsDir,{recursive:true});const name=`${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;await fs.writeFile(path.join(uploadsDir,name),buffer);return json(res,201,{ok:true,url:`/uploads/${name}`,storage:'local'})
  }catch(error){console.error('Image upload:',error);return json(res,error.message==='too_large'?413:500,{ok:false,error:'Не вдалося завантажити фото у постійне сховище.'})}
}



function promoRow(row){return {id:Number(row.id),code:row.code,discountType:row.discount_type,discountValue:Number(row.discount_value),minOrder:Number(row.min_order||0),maxUses:Number(row.max_uses||0),used:Number(row.used||0),active:row.active!==false,startsAt:row.starts_at?new Date(row.starts_at).toISOString():'',endsAt:row.ends_at?new Date(row.ends_at).toISOString():''}}
async function adminPromoCodes(req,res){
  if(!requireAdmin(req,res))return
  const r=await query(`SELECT p.*, (SELECT COUNT(*)::int FROM orders o WHERE o.promo_code=p.code AND o.status <> 'cancelled') AS used FROM promo_codes p ORDER BY p.created_at DESC`)
  return json(res,200,{ok:true,promoCodes:r.rows.map(promoRow)})
}
async function adminCreatePromo(req,res){
  if(!requireAdmin(req,res))return
  try{const b=await readJsonBody(req),code=normalizePromoCode(b.code),type=clean(b.discountType,12),value=Math.round(Number(b.discountValue)||0),minOrder=Math.max(0,Math.round(Number(b.minOrder)||0)),maxUses=Math.max(0,Math.round(Number(b.maxUses)||0)),active=b.active!==false,starts=b.startsAt?new Date(b.startsAt):null,ends=b.endsAt?new Date(b.endsAt):null;if(!code||!['percent','fixed'].includes(type)||value<=0)return json(res,400,{ok:false,error:'Заповніть код, тип і розмір знижки.'});if(type==='percent'&&value>95)return json(res,400,{ok:false,error:'Відсоткова знижка має бути до 95%.'});const r=await query(`INSERT INTO promo_codes(code,discount_type,discount_value,min_order,max_uses,active,starts_at,ends_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *,0::int AS used`,[code,type,value,minOrder,maxUses,active,starts,ends]);return json(res,201,{ok:true,promoCode:promoRow(r.rows[0])})}catch(e){return json(res,400,{ok:false,error:/unique/i.test(e.message)?'Такий промокод уже існує.':clean(e.message,220)})}
}
async function adminUpdatePromo(req,res,id){
  if(!requireAdmin(req,res))return
  try{const b=await readJsonBody(req),code=normalizePromoCode(b.code),type=clean(b.discountType,12),value=Math.round(Number(b.discountValue)||0),minOrder=Math.max(0,Math.round(Number(b.minOrder)||0)),maxUses=Math.max(0,Math.round(Number(b.maxUses)||0)),active=b.active!==false,starts=b.startsAt?new Date(b.startsAt):null,ends=b.endsAt?new Date(b.endsAt):null;if(!code||!['percent','fixed'].includes(type)||value<=0)return json(res,400,{ok:false,error:'Некоректні дані промокоду.'});if(type==='percent'&&value>95)return json(res,400,{ok:false,error:'Відсоткова знижка має бути до 95%.'});const r=await query(`UPDATE promo_codes SET code=$1,discount_type=$2,discount_value=$3,min_order=$4,max_uses=$5,active=$6,starts_at=$7,ends_at=$8,updated_at=NOW() WHERE id=$9 RETURNING *`,[code,type,value,minOrder,maxUses,active,starts,ends,id]);if(!r.rowCount)return json(res,404,{ok:false,error:'Промокод не знайдено.'});const used=(await query(`SELECT COUNT(*)::int AS used FROM orders WHERE promo_code=$1 AND status <> 'cancelled'`,[code])).rows[0].used;return json(res,200,{ok:true,promoCode:promoRow({...r.rows[0],used})})}catch(e){return json(res,400,{ok:false,error:/unique/i.test(e.message)?'Такий промокод уже існує.':clean(e.message,220)})}
}
async function adminDeletePromo(req,res,id){if(!requireAdmin(req,res))return;const r=await query('DELETE FROM promo_codes WHERE id=$1',[id]);return r.rowCount?json(res,200,{ok:true}):json(res,404,{ok:false,error:'Промокод не знайдено.'})}

async function adminDashboard(req,res){
  if(!requireAdmin(req,res))return
  try{
    const [summary,statuses,recent] = await Promise.all([
      query(`SELECT
        COUNT(*)::int AS orders,
        COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'),0)::bigint AS revenue,
        COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND created_at >= date_trunc('month', NOW())),0)::bigint AS month_revenue,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS month_orders,
        COUNT(DISTINCT customer_phone)::int AS customers
      FROM orders`),
      query(`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`),
      query(`SELECT id,status,customer_first_name,customer_last_name,total,created_at FROM orders ORDER BY created_at DESC LIMIT 6`)
    ])
    const products = await query(`SELECT COUNT(*)::int AS products, COUNT(*) FILTER (WHERE active=TRUE)::int AS active_products, COUNT(*) FILTER (WHERE stock <= 3)::int AS low_stock, COALESCE(SUM(stock),0)::int AS stock_units, COUNT(*) FILTER (WHERE is_new=TRUE)::int AS new_products, COUNT(*) FILTER (WHERE bestseller=TRUE)::int AS bestsellers, COUNT(*) FILTER (WHERE sale_percent>0)::int AS sale_products FROM products`)
    const a=summary.rows[0], b=products.rows[0]
    return json(res,200,{ok:true,stats:{orders:Number(a.orders),revenue:Number(a.revenue),monthRevenue:Number(a.month_revenue),monthOrders:Number(a.month_orders),customers:Number(a.customers),products:Number(b.products),activeProducts:Number(b.active_products),lowStock:Number(b.low_stock),stockUnits:Number(b.stock_units),newProducts:Number(b.new_products),bestsellers:Number(b.bestsellers),saleProducts:Number(b.sale_products),statuses:Object.fromEntries(statuses.rows.map(r=>[r.status,Number(r.count)]))},recentOrders:recent.rows.map(r=>({id:r.id,status:r.status,customer:`${r.customer_first_name} ${r.customer_last_name}`.trim(),total:Number(r.total),createdAt:new Date(r.created_at).toISOString()}))})
  }catch(error){console.error(error);return json(res,500,{ok:false,error:'Не вдалося завантажити Dashboard.'})}
}
async function adminCustomers(req,res){
  if(!requireAdmin(req,res))return
  try{
    const result=await query(`SELECT customer_phone AS phone, MAX(customer_first_name) AS first_name, MAX(customer_last_name) AS last_name, MAX(customer_email) AS email, COUNT(*)::int AS orders_count, COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'),0)::bigint AS spent, MAX(created_at) AS last_order FROM orders GROUP BY customer_phone ORDER BY last_order DESC`)
    return json(res,200,{ok:true,customers:result.rows.map(r=>({phone:r.phone,firstName:r.first_name,lastName:r.last_name,email:r.email||'',ordersCount:Number(r.orders_count),spent:Number(r.spent),lastOrder:new Date(r.last_order).toISOString()}))})
  }catch(error){console.error(error);return json(res,500,{ok:false,error:'Не вдалося завантажити клієнтів.'})}
}
async function adminUpdateStock(req,res,id){
  if(!requireAdmin(req,res))return
  try{const body=await readJsonBody(req);const stock=Math.max(0,Math.round(Number(body.stock)||0));const result=await query('UPDATE products SET stock=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[stock,id]);if(!result.rowCount)return json(res,404,{ok:false,error:'Товар не знайдено.'});return json(res,200,{ok:true,product:rowToProduct(result.rows[0])})}catch(error){return json(res,400,{ok:false,error:'Не вдалося змінити залишок.'})}
}
async function adminUpdateAvailability(req,res,id){
  if(!requireAdmin(req,res))return
  try{const body=await readJsonBody(req);const mode=clean(body.availabilityMode,20);if(!['auto','preorder','out'].includes(mode))return json(res,400,{ok:false,error:'Некоректний статус наявності.'});const requested=clean(body.availability,160);const text=mode==='preorder'?(requested.toLowerCase().includes('під замовлення')?requested:'Під замовлення'):(mode==='out'?'Немає в наявності':'В наявності');const result=await query('UPDATE products SET availability_mode=$1,availability=$2,updated_at=NOW() WHERE id=$3 RETURNING *',[mode,text,id]);if(!result.rowCount)return json(res,404,{ok:false,error:'Товар не знайдено.'});return json(res,200,{ok:true,product:rowToProduct(result.rows[0])})}catch(error){return json(res,400,{ok:false,error:'Не вдалося змінити наявність.'})}
}
function normalizeHexColor(value, fallback) {
  const v=clean(value,20)
  return /^#[0-9a-fA-F]{6}$/.test(v)?v:fallback
}
function normalizeStoreSettings(body={}){
  return {
    storeName:clean(body.storeName,120)||'NordHome',
    phone:clean(body.phone,60),email:clean(body.email,160),city:clean(body.city,120),instagram:clean(body.instagram,200),
    lowStockThreshold:Math.max(0,Math.min(999,Math.round(Number(body.lowStockThreshold)||3))),
    logoUrl:clean(body.logoUrl,500),heroEyebrow:clean(body.heroEyebrow,160),heroTitle:clean(body.heroTitle,220),heroText:clean(body.heroText,700),footerText:clean(body.footerText,300),aboutText:clean(body.aboutText,12000),
    deliveryText:clean(body.deliveryText,12000),returnsText:clean(body.returnsText,12000),offerText:clean(body.offerText,20000),privacyText:clean(body.privacyText,20000),
    seoHomeTitle:clean(body.seoHomeTitle,180),seoHomeDescription:clean(body.seoHomeDescription,320),publicUrl:clean(body.publicUrl,500),googleAnalyticsId:clean(body.googleAnalyticsId,40),metaPixelId:clean(body.metaPixelId,40),
    primaryColor:normalizeHexColor(body.primaryColor,'#1d1f1c'),accentColor:normalizeHexColor(body.accentColor,'#2f7d55'),surfaceColor:normalizeHexColor(body.surfaceColor,'#f8f7f3'),
    demoMode:Boolean(body.demoMode),demoBadge:clean(body.demoBadge,80)||'Демо-магазин',templateStarterPrice:clean(body.templateStarterPrice,80)||'від 12 000 ₴',templateBusinessPrice:clean(body.templateBusinessPrice,80)||'від 20 000 ₴',templateProPrice:clean(body.templateProPrice,80)||'від 30 000 ₴'
  }
}
async function saveStoreSettingsData(data){
  await query(`INSERT INTO store_settings (id,data,updated_at) VALUES (1,$1::jsonb,NOW()) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data,updated_at=NOW()`,[JSON.stringify(data)])
  return data
}

async function publicSettings(req,res){
  try{
    const result=await query(`SELECT data FROM store_settings WHERE id=1`)
    const data=result.rows[0]?.data||{}
    return json(res,200,{ok:true,settings:{storeName:data.storeName||'NordHome',phone:data.phone||'',email:data.email||'',city:data.city||'Львів',instagram:data.instagram||'',lowStockThreshold:Number(data.lowStockThreshold)||3,logoUrl:data.logoUrl||'',heroEyebrow:data.heroEyebrow||'Меблі, створені для життя',heroTitle:data.heroTitle||'Сучасний комфорт у кожній деталі',heroText:data.heroText||'Колекція функціональних меблів у спокійному скандинавському стилі.',footerText:data.footerText||'Сучасні меблі для дому та офісу.',aboutText:data.aboutText||'',deliveryText:data.deliveryText||'',returnsText:data.returnsText||'',offerText:data.offerText||'',privacyText:data.privacyText||'',seoHomeTitle:data.seoHomeTitle||'',seoHomeDescription:data.seoHomeDescription||'',publicUrl:data.publicUrl||'',googleAnalyticsId:data.googleAnalyticsId||'',metaPixelId:data.metaPixelId||'',primaryColor:data.primaryColor||'#1d1f1c',accentColor:data.accentColor||'#2f7d55',surfaceColor:data.surfaceColor||'#f8f7f3',demoMode:Boolean(data.demoMode),demoBadge:data.demoBadge||'Демо-магазин',templateStarterPrice:data.templateStarterPrice||'від 12 000 ₴',templateBusinessPrice:data.templateBusinessPrice||'від 20 000 ₴',templateProPrice:data.templateProPrice||'від 30 000 ₴'}})
  }catch(error){return json(res,200,{ok:true,settings:{storeName:'NordHome',phone:'',email:'',city:'Львів',instagram:''}})}
}

async function adminSettings(req,res){
  if(!requireAdmin(req,res))return
  const result=await query(`SELECT data FROM store_settings WHERE id=1`);return json(res,200,{ok:true,settings:result.rows[0]?.data||{}})
}
async function adminSaveSettings(req,res){
  if(!requireAdmin(req,res))return
  try{const body=await readJsonBody(req);const data=normalizeStoreSettings(body);await saveStoreSettingsData(data);return json(res,200,{ok:true,settings:data})}catch(error){return json(res,400,{ok:false,error:'Не вдалося зберегти налаштування.'})}
}


async function templateLead(req,res){
  try{
    const b=await readJsonBody(req,50_000),name=clean(b.name,120),contact=clean(b.contact,180),plan=clean(b.plan,40),message=clean(b.message,1200)
    if(name.length<2||contact.length<3)return json(res,400,{ok:false,error:'Заповніть ім’я та контакт.'})
    const token=process.env.TELEGRAM_BOT_TOKEN,chatId=process.env.TELEGRAM_CHAT_ID
    if(!token||!chatId)return json(res,503,{ok:false,error:'Канал заявок ще не налаштований.'})
    const text=['💼 <b>Нова заявка на сайт NordHome</b>','',`<b>Ім’я:</b> ${escapeHtml(name)}`,`<b>Контакт:</b> ${escapeHtml(contact)}`,`<b>Пакет:</b> ${escapeHtml(plan||'—')}`,message?`<b>Коментар:</b> ${escapeHtml(message)}`:''].filter(Boolean).join('\n')
    const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,parse_mode:'HTML'})})
    if(!response.ok)throw new Error('Telegram delivery failed')
    return json(res,200,{ok:true})
  }catch(e){console.error('Template lead failed:',e.message);return json(res,400,{ok:false,error:'Не вдалося надіслати заявку. Спробуйте ще раз.'})}
}

async function publicProductReviews(req,res,productId){
  const r=await query(`SELECT id,customer_name,rating,review_text,created_at FROM product_reviews WHERE product_id=$1 AND status='approved' ORDER BY created_at DESC`,[productId]);
  return json(res,200,{ok:true,reviews:r.rows.map(x=>({id:Number(x.id),customerName:x.customer_name,rating:Number(x.rating),text:x.review_text,createdAt:new Date(x.created_at).toISOString()}))})
}
async function createProductReview(req,res,productId){
  try{const b=await readJsonBody(req),name=clean(b.customerName,120),text=clean(b.text,2000),rating=Math.round(Number(b.rating));if(!name||text.length<3||rating<1||rating>5)return json(res,400,{ok:false,error:'Заповніть ім’я, оцінку 1–5 і текст відгуку.'});const exists=await query('SELECT 1 FROM products WHERE id=$1 AND active=TRUE',[productId]);if(!exists.rowCount)return json(res,404,{ok:false,error:'Товар не знайдено.'});await query(`INSERT INTO product_reviews(product_id,customer_name,rating,review_text,status) VALUES($1,$2,$3,$4,'pending')`,[productId,name,rating,text]);return json(res,201,{ok:true,message:'Дякуємо! Відгук надіслано на модерацію.'})}catch(e){return json(res,400,{ok:false,error:'Не вдалося додати відгук.'})}
}
async function adminReviews(req,res){if(!requireAdmin(req,res))return;const r=await query(`SELECT r.*,p.name AS product_name FROM product_reviews r JOIN products p ON p.id=r.product_id ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,r.created_at DESC`);return json(res,200,{ok:true,reviews:r.rows.map(x=>({id:Number(x.id),productId:Number(x.product_id),productName:x.product_name,customerName:x.customer_name,rating:Number(x.rating),text:x.review_text,status:x.status,createdAt:new Date(x.created_at).toISOString()}))})}
async function adminReviewStatus(req,res,id){if(!requireAdmin(req,res))return;try{const b=await readJsonBody(req),status=clean(b.status,20);if(!['pending','approved','hidden'].includes(status))return json(res,400,{ok:false,error:'Некоректний статус.'});const r=await query('UPDATE product_reviews SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING id',[status,id]);if(!r.rowCount)return json(res,404,{ok:false,error:'Відгук не знайдено.'});return json(res,200,{ok:true})}catch{return json(res,400,{ok:false,error:'Не вдалося змінити статус.'})}}
async function adminDeleteReview(req,res,id){if(!requireAdmin(req,res))return;await query('DELETE FROM product_reviews WHERE id=$1',[id]);return json(res,200,{ok:true})}

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'}
async function serveFileFrom(root,requestPath,res){
  const safe=requestPath.replace(/^\/+/,''),target=path.resolve(root,safe);if(!target.startsWith(path.resolve(root)))return false
  try{const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'public, max-age=3600'});res.end(data);return true}catch{return false}
}
async function serveStatic(req,res){
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
  if(pathname.startsWith('/uploads/'))return serveFileFrom(path.join(__dirname,'public'),pathname,res)
  if(pathname==='/')pathname='/index.html';let target=path.join(distDir,pathname);if(!target.startsWith(distDir))return false
  try{const stat=await fs.stat(target);if(stat.isDirectory())target=path.join(target,'index.html');const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});res.end(data);return true}catch{try{const data=await fs.readFile(path.join(distDir,'index.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(data);return true}catch{return false}}
}

async function seoBaseUrl(){
  try{const r=await query('SELECT data FROM store_settings WHERE id=1');const d=r.rows[0]?.data||{};return clean(d.publicUrl,500).replace(/\/$/,'')||clean(process.env.PUBLIC_URL,500).replace(/\/$/,'')||`http://localhost:${PORT}`}catch{return clean(process.env.PUBLIC_URL,500).replace(/\/$/,'')||`http://localhost:${PORT}`}
}
async function serveRobots(res){const base=await seoBaseUrl();res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nSitemap: ${base}/sitemap.xml\n`)}
async function serveSitemap(res){
  const base=await seoBaseUrl();const products=await readProducts(false);
  const fixed=['/','/catalog','/about','/delivery','/returns','/offer','/privacy','/contacts'];
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))].map(c=>`/category/${encodeURIComponent(c)}`);
  const items=[...fixed,...cats,...products.map(p=>`/product/${encodeURIComponent(p.slug||p.id)}`)];
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.map(x=>`\n  <url><loc>${escapeHtml(base+x)}</loc></url>`).join('')}\n</urlset>`;
  res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'});res.end(xml)
}


async function adminLaunchReadiness(req,res){
  if(!requireAdmin(req,res))return
  try{
    const [settingsR,productsR]=await Promise.all([query('SELECT data FROM store_settings WHERE id=1'),query('SELECT * FROM products ORDER BY id')])
    const st=settingsR.rows[0]?.data||{}, products=productsR.rows||[]
    const text=v=>String(v||'').trim()
    const publicUrl=text(st.publicUrl), validUrl=/^https:\/\//i.test(publicUrl)&&!publicUrl.includes('example.com')
    const checks=[
      {id:'database',label:'База даних',ok:true,required:true,detail:'PostgreSQL підключено'},
      {id:'storage',label:'Supabase Storage',ok:storageConfigured(),required:true,detail:storageConfigured()?'Постійне сховище фото налаштовано':'Додайте SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY'},
      {id:'telegram',label:'Telegram сповіщення',ok:Boolean(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID),required:false,detail:'Сповіщення про замовлення'},
      {id:'publicUrl',label:'Публічна HTTPS адреса',ok:validUrl,required:true,detail:validUrl?publicUrl:'Замініть example.com на адресу магазину'},
      {id:'contacts',label:'Контакти магазину',ok:Boolean(text(st.phone)&&text(st.email)),required:true,detail:'Телефон + email'},
      {id:'seo',label:'SEO головної',ok:Boolean(text(st.seoHomeTitle)&&text(st.seoHomeDescription)),required:false,detail:'Title + description'},
      {id:'legal',label:'Юридичні тексти',ok:Boolean(text(st.deliveryText)&&text(st.returnsText)&&text(st.offerText)&&text(st.privacyText)),required:false,detail:'Доставка, повернення, оферта, приватність'},
      {id:'products',label:'Каталог',ok:products.length>0,required:true,detail:`${products.length} товарів`},
      {id:'images',label:'Фото товарів',ok:products.length>0&&products.every(x=>text(x.image)),required:true,detail:`Без фото: ${products.filter(x=>!text(x.image)).length}`},
      {id:'sku',label:'SKU товарів',ok:products.length>0&&products.every(x=>text(x.sku)),required:false,detail:`Без SKU: ${products.filter(x=>!text(x.sku)).length}`},
      {id:'productSeo',label:'SEO товарів',ok:products.length>0&&products.every(x=>text(x.seo_title)&&text(x.seo_description)),required:false,detail:`Без повного SEO: ${products.filter(x=>!text(x.seo_title)||!text(x.seo_description)).length}`},
      {id:'demo',label:'Demo Mode вимкнено',ok:!st.demoMode,required:true,detail:st.demoMode?'Перед передачею вимкніть Demo Mode':'Демо-режим вимкнено'}
    ]
    const required=checks.filter(x=>x.required), passed=checks.filter(x=>x.ok).length
    return json(res,200,{ok:true,version:APP_VERSION,ready:required.every(x=>x.ok),score:Math.round(passed/checks.length*100),checks})
  }catch(e){return json(res,500,{ok:false,error:'Не вдалося виконати перевірку готовності.'})}
}
async function adminExportSettings(req,res){
  if(!requireAdmin(req,res))return
  try{const r=await query('SELECT data FROM store_settings WHERE id=1');return json(res,200,{ok:true,version:APP_VERSION,exportedAt:new Date().toISOString(),settings:r.rows[0]?.data||{}})}catch(e){return json(res,500,{ok:false,error:'Не вдалося експортувати налаштування.'})}
}
async function adminImportSettings(req,res){
  if(!requireAdmin(req,res))return
  try{const body=await readJsonBody(req,500_000);const source=body?.settings&&typeof body.settings==='object'&&!Array.isArray(body.settings)?body.settings:body;if(!source||typeof source!=='object'||Array.isArray(source))return json(res,400,{ok:false,error:'Некоректний файл налаштувань.'});const current=(await query('SELECT data FROM store_settings WHERE id=1')).rows[0]?.data||{};const data=normalizeStoreSettings({...current,...source});await saveStoreSettingsData(data);return json(res,200,{ok:true,settings:data})}catch(e){return json(res,400,{ok:false,error:'Не вдалося імпортувати налаштування.'})}
}
async function adminExportBackup(req,res){
  if(!requireAdmin(req,res))return
  try{
    const [products,settings,promos,reviews]=await Promise.all([
      query('SELECT * FROM products ORDER BY id'),
      query('SELECT data FROM store_settings WHERE id=1'),
      query('SELECT * FROM promo_codes ORDER BY id'),
      query('SELECT * FROM product_reviews ORDER BY id')
    ])
    return json(res,200,{ok:true,format:'nordhome-backup',version:APP_VERSION,exportedAt:new Date().toISOString(),data:{products:products.rows,settings:settings.rows[0]?.data||{},promoCodes:promos.rows,reviews:reviews.rows}})
  }catch(e){console.error('Backup export failed:',e);return json(res,500,{ok:false,error:'Не вдалося створити резервну копію.'})}
}
async function adminImportBackup(req,res){
  if(!requireAdmin(req,res))return
  try{
    const body=await readJsonBody(req,8_000_000)
    if(body?.format!=='nordhome-backup'||!body.data||!Array.isArray(body.data.products)||!Array.isArray(body.data.promoCodes)||!Array.isArray(body.data.reviews))return json(res,400,{ok:false,error:'Це не файл резервної копії NordHome.'})
    if(clean(body.confirmation,80)!=='RESTORE_NORDHOME')return json(res,400,{ok:false,error:'Для відновлення введіть RESTORE_NORDHOME.'})
    const result=await withTransaction(async client=>{
      await client.query('DELETE FROM product_reviews');await client.query('DELETE FROM promo_codes');await client.query('DELETE FROM products')
      for(const x of body.data.products){
        await client.query(`INSERT INTO products(id,name,price,category,image,short_description,description,dimensions,material,colors,availability,specs,gallery,active,created_at,updated_at,sku,stock,is_new,bestseller,sale_percent,old_price,availability_mode,slug,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12::jsonb,$13::jsonb,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,[x.id,x.name,x.price,x.category,x.image,x.short_description||'',x.description||'',x.dimensions||'',x.material||'',JSON.stringify(x.colors||[]),x.availability||'В наявності',JSON.stringify(x.specs||[]),JSON.stringify(x.gallery||[]),x.active!==false,x.created_at||new Date(),x.updated_at||new Date(),x.sku||'',Math.max(0,Number(x.stock)||0),Boolean(x.is_new),Boolean(x.bestseller),Math.max(0,Number(x.sale_percent)||0),Math.max(0,Number(x.old_price)||0),x.availability_mode||'auto',x.slug||`product-${x.id}`,x.seo_title||'',x.seo_description||''])
      }
      for(const x of body.data.promoCodes){await client.query(`INSERT INTO promo_codes(id,code,discount_type,discount_value,min_order,max_uses,active,starts_at,ends_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[x.id,x.code,x.discount_type,x.discount_value,x.min_order||0,x.max_uses||0,x.active!==false,x.starts_at||null,x.ends_at||null,x.created_at||new Date(),x.updated_at||new Date()])}
      for(const x of body.data.reviews){if(body.data.products.some(p=>Number(p.id)===Number(x.product_id)))await client.query(`INSERT INTO product_reviews(id,product_id,customer_name,rating,review_text,status,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[x.id,x.product_id,x.customer_name,x.rating,x.review_text,x.status||'pending',x.created_at||new Date(),x.updated_at||new Date()])}
      const settings=normalizeStoreSettings(body.data.settings||{});await client.query(`INSERT INTO store_settings(id,data,updated_at) VALUES(1,$1::jsonb,NOW()) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,updated_at=NOW()`,[JSON.stringify(settings)])
      await client.query(`SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products),1), true)`);await client.query(`SELECT setval(pg_get_serial_sequence('promo_codes','id'), COALESCE((SELECT MAX(id) FROM promo_codes),1), true)`);await client.query(`SELECT setval(pg_get_serial_sequence('product_reviews','id'), COALESCE((SELECT MAX(id) FROM product_reviews),1), true)`)
      return {products:body.data.products.length,promoCodes:body.data.promoCodes.length,reviews:body.data.reviews.length,settings}
    })
    return json(res,200,{ok:true,restored:result})
  }catch(e){console.error('Backup restore failed:',e);return json(res,400,{ok:false,error:'Не вдалося відновити резервну копію. Дані не змінено.'})}
}

async function adminSeedDemoData(req,res){
  if(!requireAdmin(req,res))return
  try{
    const result=await withTransaction(async client=>{
      const products=(await client.query(`SELECT id,name,price FROM products WHERE active=TRUE ORDER BY id LIMIT 3`)).rows
      if(!products.length)throw new Error('Спочатку додайте хоча б один товар.')
      const demos=[
        {id:'DEMO-1001',first:'Олена',last:'Коваль',phone:'+380 67 111 22 33',pn:'380671112233',email:'demo1@nordhome.local',status:'new',carrier:'Нова пошта',deliveryStatus:'pending'},
        {id:'DEMO-1002',first:'Андрій',last:'Мельник',phone:'+380 93 444 55 66',pn:'380934445566',email:'demo2@nordhome.local',status:'confirmed',carrier:'Нова пошта',deliveryStatus:'preparing'},
        {id:'DEMO-1003',first:'Ірина',last:'Бондар',phone:'+380 50 777 88 99',pn:'380507778899',email:'demo3@nordhome.local',status:'shipped',carrier:'Укрпошта',deliveryStatus:'in_transit'}
      ]
      let createdOrders=0,createdCustomers=0
      for(let i=0;i<demos.length;i++){
        const d=demos[i], prod=products[i%products.length]
        const cr=await client.query(`INSERT INTO customers(first_name,last_name,phone,phone_normalized,email,email_normalized,password_hash) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(phone_normalized) DO NOTHING RETURNING id`,[d.first,d.last,d.phone,d.pn,d.email,d.email,passwordHash(crypto.randomBytes(18).toString('hex'))]);if(cr.rowCount)createdCustomers++
        const delivery={carrier:d.carrier,deliveryType:'Відділення',city:'Львів',point:'Демо-відділення №1'}
        const total=Number(prod.price)||1000
        const or=await client.query(`INSERT INTO orders(id,status,customer_first_name,customer_last_name,customer_phone,customer_email,delivery,payment,comment,total,subtotal,discount,promo_code,tracking_number,shipment_carrier,delivery_status,shipment_updated_at) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$10,0,'',$11,$12,$13,NOW()) ON CONFLICT(id) DO NOTHING RETURNING id`,[d.id,d.status,d.first,d.last,d.phone,d.email,JSON.stringify(delivery),'Післяплата','Демонстраційне замовлення',total,d.status==='shipped'?`204500000000${i+1}`:'',d.carrier,d.deliveryStatus])
        if(or.rowCount){createdOrders++;await client.query(`INSERT INTO order_items(order_id,product_id,name,selected_color,price,quantity,stock_reserved,stock_applied) VALUES($1,$2,$3,'', $4,1,0,FALSE)`,[d.id,prod.id,prod.name,total])}
      }
      const r=await client.query('SELECT data FROM store_settings WHERE id=1');const current=r.rows[0]?.data||{};const next=normalizeStoreSettings({...current,demoMode:true});await client.query(`INSERT INTO store_settings(id,data,updated_at) VALUES(1,$1::jsonb,NOW()) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,updated_at=NOW()`,[JSON.stringify(next)])
      return {createdOrders,createdCustomers,settings:next}
    })
    return json(res,200,{ok:true,...result})
  }catch(e){return json(res,400,{ok:false,error:clean(e.message,220)||'Не вдалося створити демо-дані.'})}
}
async function adminClearDemoData(req,res){
  if(!requireAdmin(req,res))return
  try{const body=await readJsonBody(req);if(clean(body.confirmation,80)!=='CLEAR_DEMO_DATA')return json(res,400,{ok:false,error:'Для очищення введіть CLEAR_DEMO_DATA.'});const counts=await withTransaction(async client=>{const orders=await client.query('DELETE FROM orders RETURNING id');const customers=await client.query('DELETE FROM customers RETURNING id');const r=await client.query('SELECT data FROM store_settings WHERE id=1');const current=r.rows[0]?.data||{};const next=normalizeStoreSettings({...current,demoMode:false});await client.query(`INSERT INTO store_settings(id,data,updated_at) VALUES(1,$1::jsonb,NOW()) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,updated_at=NOW()`,[JSON.stringify(next)]);return {orders:orders.rowCount,customers:customers.rowCount,settings:next}});return json(res,200,{ok:true,cleared:counts})}catch(e){return json(res,400,{ok:false,error:'Не вдалося очистити дані.'})}
}

const server=http.createServer(async(req,res)=>{
 try {
  securityHeaders(res)
  if (apiRateLimited(req,res)) return
  const url=new URL(req.url,'http://localhost')
  if(req.method==='GET'&&url.pathname==='/robots.txt')return serveRobots(res)
  if(req.method==='GET'&&url.pathname==='/sitemap.xml')return serveSitemap(res)
  if(req.method==='GET'&&url.pathname==='/api/health'){try{await query('SELECT 1');return json(res,200,{ok:true,status:'healthy',database:'connected',version:APP_VERSION,environment:IS_PRODUCTION?'production':'development'})}catch(error){return json(res,503,{ok:false,status:'unhealthy',database:'disconnected'})}}
  if(req.method==='GET'&&url.pathname==='/api/products')return json(res,200,{ok:true,products:await readProducts(false)})
  const publicReviewsMatch=url.pathname.match(/^\/api\/products\/(\d+)\/reviews$/);if(publicReviewsMatch&&req.method==='GET')return publicProductReviews(req,res,publicReviewsMatch[1]);if(publicReviewsMatch&&req.method==='POST')return createProductReview(req,res,publicReviewsMatch[1])
  if(req.method==='GET'&&url.pathname==='/api/settings')return publicSettings(req,res)
  if(req.method==='POST'&&url.pathname==='/api/template-lead')return templateLead(req,res)
  if(req.method==='GET'&&url.pathname==='/api/nova-poshta/warehouses')return novaWarehouses(req,res,url)
  if(req.method==='POST'&&url.pathname==='/api/promo/validate')return validatePromo(req,res)
  if(req.method==='POST'&&url.pathname==='/api/customer/register')return customerRegister(req,res)
  if(req.method==='POST'&&url.pathname==='/api/customer/login')return customerLogin(req,res)
  if(req.method==='POST'&&url.pathname==='/api/customer/logout')return customerLogout(req,res)
  if(req.method==='GET'&&url.pathname==='/api/customer/me')return customerMe(req,res)
  if(req.method==='GET'&&url.pathname==='/api/customer/orders')return customerOrders(req,res)
  if(req.method==='PUT'&&url.pathname==='/api/customer/profile')return customerUpdateProfile(req,res)
  if(req.method==='POST'&&url.pathname==='/api/orders')return createOrder(req,res)
  if(req.method==='POST'&&url.pathname==='/api/order-track')return trackOrder(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/login')return adminLogin(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/logout'){if(!requireAdmin(req,res))return;return adminLogout(req,res)}
  if(req.method==='GET'&&url.pathname==='/api/admin/orders')return adminOrders(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/dashboard')return adminDashboard(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/customers')return adminCustomers(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/reviews')return adminReviews(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/settings')return adminSettings(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/launch-readiness')return adminLaunchReadiness(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/settings/export')return adminExportSettings(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/backup/export')return adminExportBackup(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/backup/import')return adminImportBackup(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/settings/import')return adminImportSettings(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/demo/seed')return adminSeedDemoData(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/demo/clear')return adminClearDemoData(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/promo-codes')return adminPromoCodes(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/promo-codes')return adminCreatePromo(req,res)
  if(req.method==='PUT'&&url.pathname==='/api/admin/settings')return adminSaveSettings(req,res)
  if(req.method==='GET'&&url.pathname==='/api/admin/products'){if(!requireAdmin(req,res))return;return json(res,200,{ok:true,products:await readProducts()})}
  if(req.method==='POST'&&url.pathname==='/api/admin/products')return adminCreateProduct(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/products/import')return adminBulkImportProducts(req,res)
  if(req.method==='POST'&&url.pathname==='/api/admin/upload-image')return adminUploadImage(req,res)
  const reviewMatch=url.pathname.match(/^\/api\/admin\/reviews\/(\d+)$/);if(reviewMatch&&req.method==='PATCH')return adminReviewStatus(req,res,reviewMatch[1]);if(reviewMatch&&req.method==='DELETE')return adminDeleteReview(req,res,reviewMatch[1])
  const promoMatch=url.pathname.match(/^\/api\/admin\/promo-codes\/(\d+)$/);if(promoMatch&&req.method==='PUT')return adminUpdatePromo(req,res,promoMatch[1]);if(promoMatch&&req.method==='DELETE')return adminDeletePromo(req,res,promoMatch[1])
  const shipmentMatch=url.pathname.match(/^\/api\/admin\/orders\/(.+)\/shipment$/);if(req.method==='PATCH'&&shipmentMatch)return adminOrderShipment(req,res,decodeURIComponent(shipmentMatch[1]))
  const orderMatch=url.pathname.match(/^\/api\/admin\/orders\/(.+)\/status$/);if(req.method==='PATCH'&&orderMatch)return adminOrderStatus(req,res,decodeURIComponent(orderMatch[1]))
  const stockMatch=url.pathname.match(/^\/api\/admin\/products\/(\d+)\/stock$/);if(stockMatch&&req.method==='PATCH')return adminUpdateStock(req,res,stockMatch[1])
  const availabilityMatch=url.pathname.match(/^\/api\/admin\/products\/(\d+)\/availability$/);if(availabilityMatch&&req.method==='PATCH')return adminUpdateAvailability(req,res,availabilityMatch[1])
  const productMatch=url.pathname.match(/^\/api\/admin\/products\/(\d+)$/);if(productMatch&&req.method==='PUT')return adminUpdateProduct(req,res,productMatch[1]);if(productMatch&&req.method==='DELETE')return adminDeleteProduct(req,res,productMatch[1])
  if(await serveStatic(req,res))return
  json(res,404,{ok:false,error:'Not found'})
 } catch (error) {
  console.error('Unhandled request error:', error)
  if (!res.headersSent) return json(res,500,{ok:false,error:'Внутрішня помилка сервера.'})
  try { res.end() } catch {}
 }
})
server.listen(PORT,HOST,()=>console.log(`NordHome v${APP_VERSION} ${IS_PRODUCTION?'production':'development'} server listening on ${HOST}:${PORT}`))

function gracefulShutdown(signal) {
  console.log(`${signal}: shutting down NordHome...`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10000).unref()
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
