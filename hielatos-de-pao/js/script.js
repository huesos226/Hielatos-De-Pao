/* =============================================
   HIELATOS DE PAO — script.js
   Lógica: Catálogo · Carrito · WhatsApp
   ============================================= */

'use strict';

// ─── DATOS DEL CATÁLOGO ───────────────────────
const PRODUCTOS = [
  {
    id: 'guanabana',
    nombre: 'Hielato de Guanábana Natural',
    sabor: 'Tropical',
    desc: 'Fruta tropical cremosa, suave y refrescante.',
    imagen: 'assets/images/image_1.png',
    emoji: '🌿',
  },
  {
    id: 'fresa',
    nombre: 'Hielato de Fresa Artesanal',
    sabor: 'Clásico',
    desc: 'Fresas frescas, naturales y sin artificiales.',
    imagen: 'assets/images/image_2.png',
    emoji: '🍓',
  },
  {
    id: 'maracuya',
    nombre: 'Hielato de Maracuyá',
    sabor: 'Exótico',
    desc: 'Intenso sabor agridulce de maracuyá real.',
    imagen: 'assets/images/image_3.png',
    emoji: '🟡',
  },
  {
    id: 'coco',
    nombre: 'Hielato de Coco Tostado',
    sabor: 'Especial',
    desc: 'Coco tostado artesanalmente, cremoso y único.',
    imagen: 'assets/images/image_4.png',
    emoji: '🥥',
  },
  {
    id: 'mango',
    nombre: 'Hielato de Mango Biche',
    sabor: 'Regional',
    desc: 'Mango verde colombiano con toque especiado.',
    imagen: 'assets/images/image_5.png',
    emoji: '🥭',
  },
  {
    id: 'mora',
    nombre: 'Hielato de Mora',
    sabor: 'Artesanal',
    desc: 'Moras negras silvestres, intensas y naturales.',
    imagen: 'assets/images/image_6.png',
    emoji: '🫐',
  },
  {
    id: 'vainilla',
    nombre: 'Hielato de Vainilla Bourbon',
    sabor: 'Clásico',
    desc: 'Vainilla bourbon premium, suave y aromática.',
    imagen: 'assets/images/image_7.png',
    emoji: '🤍',
  },
  {
    id: 'chocolate',
    nombre: 'Hielato de Chocolate',
    sabor: 'Indulgente',
    desc: 'Chocolate oscuro con escamas de sal marina.',
    imagen: 'assets/images/image_8.png',
    emoji: '🍫',
  },
];

const PRECIOS = { P: 10000, M: 14000, G: 18000 };
const LABELS  = { P: 'Pequeño', M: 'Mediano', G: 'Grande' };
const WA_NUM  = '3012899618';

// ─── ESTADO DEL CARRITO ───────────────────────
const cart = {}; // key: `${id}-${size}` → { producto, size, qty, precio }

// ─── UTILIDADES ──────────────────────────────
function formatCOP(amount) {
  return '$' + amount.toLocaleString('es-CO');
}

function showToast(msg, duration = 2200) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden', 'true');
  }, duration);
}

// ─── RENDERIZADO DE TARJETAS ──────────────────
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = '';

  PRODUCTOS.forEach((prod, index) => {
    const card = document.createElement('article');
    card.className = 'product-card reveal';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = `${index * 0.08}s`;
    card.dataset.id = prod.id;

    card.innerHTML = `
      <div class="product-card__img-wrap">
        <img
          src="${prod.imagen}"
          alt="Hielato de ${prod.nombre}"
          loading="lazy"
          onerror="this.src='assets/images/placeholder.png'; this.onerror=null;"
        />
        <span class="product-card__flavor-badge">${prod.emoji} ${prod.sabor}</span>
      </div>
      <div class="product-card__body">
        <div>
          <h3 class="product-card__name">${prod.nombre}</h3>
          <p class="product-card__desc">${prod.desc}</p>
        </div>

        <!-- Selector de tamaño -->
        <div class="size-selector" role="group" aria-label="Seleccionar tamaño">
          ${['P', 'M', 'G'].map((size, i) => `
            <button
              class="size-btn${i === 0 ? ' active' : ''}"
              data-size="${size}"
              data-price="${PRECIOS[size]}"
              aria-pressed="${i === 0 ? 'true' : 'false'}"
              aria-label="${LABELS[size]}: ${formatCOP(PRECIOS[size])}"
            >
              <span class="size-label">${LABELS[size].charAt(0)}</span>
              <span>${LABELS[size]}</span>
              <span class="size-price">${formatCOP(PRECIOS[size])}</span>
            </button>
          `).join('')}
        </div>

        <!-- Selector de cantidad -->
        <div class="quantity-row">
          <span class="qty-label">Cantidad:</span>
          <div class="qty-controls">
            <button class="qty-btn qty-minus" aria-label="Disminuir cantidad">−</button>
            <span class="qty-value" aria-live="polite">1</span>
            <button class="qty-btn qty-plus" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>

        <!-- Botón agregar -->
        <button class="add-to-cart-btn" aria-label="Añadir ${prod.nombre} al carrito">
          🛒 Añadir al Carrito
        </button>
      </div>
    `;

    grid.appendChild(card);

    // Eventos de la tarjeta
    attachCardEvents(card, prod);
  });

  // Trigger reveal observer
  observeReveal();
}

function attachCardEvents(card, prod) {
  // Botones de tamaño
  const sizeBtns = card.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  // Cantidad
  const qtyValue = card.querySelector('.qty-value');
  const minusBtn = card.querySelector('.qty-minus');
  const plusBtn  = card.querySelector('.qty-plus');
  let qty = 1;

  minusBtn.addEventListener('click', () => {
    if (qty > 1) { qty--; qtyValue.textContent = qty; }
  });
  plusBtn.addEventListener('click', () => {
    if (qty < 20) { qty++; qtyValue.textContent = qty; }
  });

  // Añadir al carrito
  const addBtn = card.querySelector('.add-to-cart-btn');
  addBtn.addEventListener('click', () => {
    const activeSize = card.querySelector('.size-btn.active');
    const size  = activeSize.dataset.size;
    const precio = PRECIOS[size];
    const key   = `${prod.id}-${size}`;

    if (cart[key]) {
      cart[key].qty += qty;
    } else {
      cart[key] = { prod, size, qty, precio };
    }

    // Visual feedback
    const original = addBtn.textContent;
    addBtn.textContent = '✓ ¡Añadido!';
    addBtn.classList.add('added');
    setTimeout(() => {
      addBtn.textContent = original;
      addBtn.classList.remove('added');
    }, 1200);

    showToast(`${prod.emoji} ${qty}x ${prod.nombre.split(' ').slice(0,3).join(' ')} añadido`);
    updateCart();

    // Reset qty to 1
    qty = 1;
    qtyValue.textContent = '1';
  });
}

// ─── CARRITO ──────────────────────────────────
function updateCart() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  const badge  = document.getElementById('cartBadge');
  const total  = document.getElementById('cartTotal');

  const keys = Object.keys(cart);

  // Badge
  const totalItems = keys.reduce((sum, k) => sum + cart[k].qty, 0);
  badge.textContent = totalItems;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);

  if (keys.length === 0) {
    body.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>¡Elige un hielato! 🍓</p>';
    footer.hidden = true;
    return;
  }

  // Render items
  body.innerHTML = '';
  let totalAmt = 0;

  keys.forEach(key => {
    const { prod, size, qty, precio } = cart[key];
    const subtotal = precio * qty;
    totalAmt += subtotal;

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img class="cart-item__img" src="${prod.imagen}" alt="${prod.nombre}" loading="lazy" />
      <div class="cart-item__info">
        <p class="cart-item__name">${prod.emoji} ${prod.nombre}</p>
        <p class="cart-item__meta">Tamaño: ${LABELS[size]} · Cant: ${qty}</p>
        <p class="cart-item__price">${formatCOP(subtotal)}</p>
      </div>
      <button class="cart-item__remove" data-key="${key}" aria-label="Eliminar ${prod.nombre} del carrito">✕</button>
    `;

    item.querySelector('.cart-item__remove').addEventListener('click', () => {
      delete cart[key];
      updateCart();
      showToast('Producto eliminado del carrito');
    });

    body.appendChild(item);
  });

  total.textContent = formatCOP(totalAmt);
  footer.hidden = false;
}

// ─── PANEL DEL CARRITO ───────────────────────
function openCart() {
  const panel = document.getElementById('cartPanel');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel = document.getElementById('cartPanel');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ─── GENERADOR DE MENSAJE WHATSAPP ───────────
function buildWhatsAppMessage() {
  const keys = Object.keys(cart);
  if (keys.length === 0) return null;

  let lines = [];
  let total = 0;

  keys.forEach(key => {
    const { prod, size, qty, precio } = cart[key];
    const subtotal = precio * qty;
    total += subtotal;
    lines.push(`- ${qty} Hielato${qty > 1 ? 's' : ''} de ${prod.nombre.replace('Hielato de ', '')} (Tamaño: ${LABELS[size]}) - ${formatCOP(subtotal)}`);
  });

  const message = [
    '¡Hola Hielatos de Pao! 🍦 Me gustaría hacer un pedido:',
    '',
    ...lines,
    '',
    `Total: ${formatCOP(total)}`,
    '',
    '📍 Por favor confirmar disponibilidad. ¡Gracias!',
  ].join('\n');

  return encodeURIComponent(message);
}

// ─── MODAL DEL MAPA ──────────────────────────
function openMap() {
  const modal = document.getElementById('mapModal');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal__close').focus();
}

function closeMap() {
  const modal = document.getElementById('mapModal');
  modal.hidden = true;
  document.body.style.overflow = '';
}

// ─── SCROLL REVEAL ───────────────────────────
function observeReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ─── NAVBAR SCROLL ────────────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 20px rgba(219,39,119,0.14)';
    } else {
      navbar.style.boxShadow = '0 2px 16px rgba(219,39,119,0.07)';
    }
  }, { passive: true });
}

// ─── INICIALIZACIÓN ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render products
  renderProducts();
  initNavbarScroll();

  // Add reveal to info cards
  document.querySelectorAll('.info-card, .contacto__text').forEach(el => el.classList.add('reveal'));
  observeReveal();

  // Cart toggle
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);

  // Clear cart
  document.getElementById('clearCart').addEventListener('click', () => {
    Object.keys(cart).forEach(k => delete cart[k]);
    updateCart();
    showToast('Carrito vaciado 🗑️');
  });

  // Checkout → WhatsApp
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    const msg = buildWhatsAppMessage();
    if (!msg) { showToast('Tu carrito está vacío'); return; }
    window.open(`https://wa.me/${WA_NUM}?text=${msg}`, '_blank', 'noopener');
  });

  // Map modal
  document.getElementById('openMap').addEventListener('click', openMap);
  document.getElementById('closeMap').addEventListener('click', closeMap);
  document.getElementById('modalBackdrop').addEventListener('click', closeMap);

  // Keyboard: Escape closes cart and modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeMap();
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
