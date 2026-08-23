/* ---------------- CONFIG (ajustar com dados reais da cliente) ---------------- */
const WHATSAPP_NUMBER = "5567996426620"; // Andreia Pateis
const STORE_ADDRESS_QUERY = "Rua Nicolau Ritter, 968, Jardim Novo, Eldorado, MS, 79970-000"; // Andreia Pateis
const CATALOG_URL = "https://catalogo-andreia.netlify.app";
const INSTAGRAM_URL = "https://www.instagram.com/pateisandreia?utm_source=qr&igsh=MWZlNTV6anFvYjkwZA=="; // Andreia Pateis
const FACEBOOK_URL = "https://www.facebook.com/share/1JJHaU8unN/"; // Andreia Pateis
const ELIDAVY_INSTAGRAM_URL = "https://www.instagram.com/elidavy.tech?igsh=MXVsczc4bDJkdGl3Yw==";

/* ---------------- DADOS DE EXEMPLO (substituir por Firestore) ---------------- */
/* ---------------- USPs (selos de confiança) ---------------- */
const USPS = [
  { icon: "box", text: "Envio para todo o Brasil" },
  { icon: "exchange", text: "Troca em até 15 dias" },
  { icon: "card", text: "Cartão de crédito, débito, Pix e dinheiro" },
  { icon: "chat", text: "Atendimento personalizado via WhatsApp" },
  { icon: "thread", text: "Peças selecionadas com cuidado e qualidade" },
];
const USP_ICONS = {
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><path d="M2 8h11v9H2z"/><path d="M13 11h4l3 3v3h-7v-6z"/><circle cx="6" cy="18.5" r="1.6"/><circle cx="16.5" cy="18.5" r="1.6"/></svg>',
  exchange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><path d="M4 12a8 8 0 0113.5-5.8L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 01-13.5 5.8L4 16"/><path d="M4 20v-4h4"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><path d="M21 11.5a8.4 8.4 0 01-8.4 8.4 8.4 8.4 0 01-3.9-.9L3 20l1-4.9a8.4 8.4 0 01-.9-3.8A8.4 8.4 0 0111.5 3H12a8.4 8.4 0 019 8.2z"/><circle cx="8" cy="12" r="0.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="0.8" fill="currentColor" stroke="none"/></svg>',
  thread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><circle cx="12" cy="8" r="5"/><path d="M9 12.5L7 21l5-2.5L17 21l-2-8.5"/></svg>',
};

/* ---------------- VITRINE DE DESTAQUES ---------------- */
// Camada de dados: só produtos marcados manualmente como destaque E com foto real
function getFeaturedProducts(){
  return products.filter(p => p.featured && p.img);
}

let fcIndex = 0;
let fcTimer = null;
const fcReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderFeaturedCarousel(){
  const el = document.getElementById('featuredCarousel');
  const list = getFeaturedProducts();
  if(list.length === 0){ el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = 'block';

  el.innerHTML = `
    <div class="fc-slides" id="fcSlides">
      ${list.map((p,i) => `
        <div class="fc-slide ${i===0?'active':''}" data-id="${p.id}">
          <img src="${p.img}" alt="${p.name}">
          <div class="fc-slide-label">
            <div class="fc-slide-name">${p.name}</div>
            <div class="fc-slide-price">${fmt(p.price)}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="fc-dots" id="fcDots">
      ${list.map((_,i) => `<button class="fc-dot ${i===0?'active':''}" onclick="fcGoTo(${i})" aria-label="Ver peça ${i+1}"></button>`).join('')}
    </div>
  `;

  document.getElementById('fcSlides').addEventListener('click', () => {
    const p = list[fcIndex];
    if(p) openProduct(p.id);
  });

  fcIndex = 0;
  clearInterval(fcTimer);
  // Respeita "reduzir movimento": não alterna sozinho se a pessoa configurou isso no aparelho
  if(!fcReduceMotion && list.length > 1){
    fcTimer = setInterval(() => fcGoTo((fcIndex + 1) % list.length), 4000);
  }
}
function fcGoTo(i){
  const slides = document.querySelectorAll('#fcSlides .fc-slide');
  const dots = document.querySelectorAll('#fcDots .fc-dot');
  if(!slides.length) return;
  slides[fcIndex]?.classList.remove('active');
  dots[fcIndex]?.classList.remove('active');
  fcIndex = i;
  slides[fcIndex]?.classList.add('active');
  dots[fcIndex]?.classList.add('active');
}

function renderUSPSection(){
  const el = document.getElementById('uspSection');
  el.innerHTML = `<div class="usp-grid">${USPS.map(u => `
    <div class="usp-item">
      <div class="usp-icon">${USP_ICONS[u.icon] || ''}</div>
      <div class="usp-text">${u.text}</div>
    </div>
  `).join('')}</div>`;
}

/* ---------------- DADOS (JSON local) ---------------- */
// A paleta de cores é fixa (não muda com frequência, então fica direto no código).
// products e categories começam vazios e são populados por carregarDados(),
// que busca o arquivo estático produtos.json publicado junto com o site.
const COLORS = {
  // Rosas
  "rosa-bebe": "#FFB6C1",
  "rosa-claro": "#FFB6C1",
  "rosa-pastel": "#FFB6C1",
  "rose": "#FFB6C1",
  "rosa-chiclete": "#FF1493",
  "rosa-pink": "#FF1493",
  "rosa-choque": "#FF1493",
  "fucsia": "#FF1493",
  "magenta": "#FF1493",
  "rosa-queimado": "#8B4E5C",
  "rosewood": "#8B4E5C",
  // Vermelhos
  "vermelho": "#D0002A",
  "cereja": "#D0002A",
  "rubi": "#D0002A",
  "carmim": "#D0002A",
  "marsala": "#800020",
  "bordo": "#800020",
  "vinho": "#800020",
  // Laranjas
  "pessego": "#FF7F50",
  "coral": "#FF7F50",
  "salmao": "#FF7F50",
  "laranja": "#FF8C00",
  "terracota-alaranjado": "#FF8C00",
  "laranja-queimado": "#FF8C00",
  // Amarelos
  "amarelo-bebe": "#FFF1A8",
  "amarelo-pastel": "#FFF1A8",
  "limao": "#FFF1A8",
  "mostarda": "#D4A017",
  "dourado": "#D4A017",
  // Verdes
  "verde-bebe": "#98E6C1",
  "menta": "#98E6C1",
  "verde-agua": "#98E6C1",
  "esmeralda": "#009B77",
  "oliva": "#556B2F",
  "musgo": "#556B2F",
  "verde-militar": "#556B2F",
  // Azuis
  "azul-bebe": "#87CEEB",
  "azul-ceu": "#87CEEB",
  "azul-serenity": "#87CEEB",
  "azul-tiffany": "#87CEEB",
  "azul-royal": "#4169E1",
  "azul-petroleo": "#001F3F",
  "azul-marinho": "#001F3F",
  // Roxos
  "lilas": "#D8B4FE",
  "lavanda": "#D8B4FE",
  "roxo-claro": "#D8B4FE",
  "violeta": "#6A0DAD",
  "roxo": "#6A0DAD",
  "ameixa": "#6A0DAD",
  // Nudes e terrosos
  "nude": "#EBCAB6",
  "nude-rosado": "#EBCAB6",
  "nude-pessego": "#EBCAB6",
  "bege": "#EBCAB6",
  "areia": "#C68642",
  "caramelo": "#C68642",
  "camel": "#C68642",
  "canela": "#C68642",
  "terracota": "#C68642",
  "marrom": "#5D4037",
  "chocolate": "#5D4037",
  "cafe": "#5D4037",
  // Neutros
  "branco": "#FFFFFF",
  "off-white": "#FFFFFF",
  "creme": "#FFFFFF",
  "marfim": "#FFFFFF",
  "cinza-claro": "#BDBDBD",
  "cinza": "#BDBDBD",
  "grafite": "#424222",
  // Pretos
  "preto": "#000000",
  "preto-intenso": "#000000",
  "preto-fosco": "#000000",
  "preto-grafite": "#000000",
};
let products = [];
let categories = ["Todos"];

async function carregarDados(){
  try {
    const resposta = await fetch("/data/produtos/produtos.json");
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const dados = await resposta.json();

    // O produtos.json agora é editado pelo painel Decap CMS, que salva no formato
    // { "produtos": [...] } (uma lista dentro de um objeto, não mais um array solto).
    // O "id" de cada produto é gerado aqui, pela posição na lista — a Andreia nunca
    // precisa pensar em número nenhum ao cadastrar um produto novo pelo painel.
    // Os nomes de campo em português (nome, preco, categoria...) são convertidos
    // pro formato interno que o resto do script já espera (cat, name, price...).
    products = (dados.produtos || []).map((p, index) => ({
      id: index,
      cat: p.categoria,
      name: p.nome,
      price: p.preco,
      featured: p.destaque,
      colors: p.cores || [],
      sizes: p.tamanhos || [],
      desc: p.descricao,
      img: p.imagem,
      // Foto com modelo? Controla o agrupamento na grade abaixo — não depende
      // da posição do produto dentro do produtos.json.
      comModelo: !!p.com_modelo,
      // Fotos por cor (opcional): lista [{cor, imagem}] vira um mapa { cor: imagem }.
      // Cores que nunca aparecem em "cores" simplesmente nunca sao consultadas aqui,
      // entao uma foto cadastrada por engano para uma cor nao disponivel nao tem efeito.
      imagensPorCor: (p.imagens_por_cor || []).reduce((acc, item) => {
        if (item && item.cor && item.imagem) acc[item.cor] = item.imagem;
        return acc;
      }, {})
    }));

    // Mantém as peças "sem modelo" agrupadas antes das peças "com modelo" na
    // grade, não importa em que ordem a Andreia cadastrou cada uma no painel.
    // Array.prototype.sort é estável (mantém a ordem relativa dentro de cada
    // grupo), então isso só reordena os dois blocos, sem embaralhar nada dentro deles.
    products.sort((a, b) => (a.comModelo === b.comModelo) ? 0 : (a.comModelo ? 1 : -1));

    categories = ["Todos", ...new Set(products.map(p => p.cat))];
  } catch (err) {
    console.error("Erro ao carregar produtos.json:", err);
    const grid = document.getElementById('grid');
    if (grid) grid.innerHTML = '<p style="padding:24px;text-align:center;opacity:.8">Não foi possível carregar o catálogo. Verifique sua conexão e recarregue a página.</p>';
  }
}

// Inicia o carregamento assim que o script roda, em paralelo com a tela de capa.
const dadosProntos = carregarDados();




/* ---------------- ESTADO ---------------- */
let cart = [];
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentFilter = "Todos";

/* ---------------- HELPERS ---------------- */
const fmt = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}
function garmentIcon(bg){
  return `<svg viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L50 30 L70 20 L82 34 L70 44 L70 82 L30 82 L30 44 L18 34 Z" stroke="#d8a55c" stroke-width="1.6" fill="none" opacity="0.9"/>
    <path d="M40 30 Q50 42 60 30" stroke="#d8a55c" stroke-width="1.4" fill="none" opacity="0.7"/>
  </svg>`;
}

/* ---------------- COVER -> APP ---------------- */
async function enterApp(){
  document.getElementById('cover').style.display = 'none';
  document.getElementById('app').classList.add('active');
  window.scrollTo(0,0);

  // Enquanto o catálogo carrega do Firestore, mostra um aviso no lugar da grade.
  const grid = document.getElementById('grid');
  if (grid && products.length === 0) {
    grid.innerHTML = '<p style="padding:24px;text-align:center;opacity:.7">Carregando catálogo...</p>';
  }

  await dadosProntos;

  renderFilters();
  renderGrid();
  renderFeaturedCarousel();
  renderUSPSection();
}
function backToCover(){
  document.getElementById('app').classList.remove('active');
  document.getElementById('cover').style.display = 'flex';
  window.scrollTo(0,0);
}

/* ---------------- RENDER ---------------- */
// Configuração de facetas por categoria: cada categoria pode ter um atributo
// secundário de filtro (campo do produto + opções exibidas como sub-filtro).
// Adicionar uma faceta nova = uma linha aqui, sem tocar na lógica de renderização.
const FACETS = {
  "Pijama": { field: "season", options: ["Verão","Inverno"] }
};
let currentFacetValue = "Todos";

function renderFilters(){
  const el = document.getElementById('filters');
  el.innerHTML = categories.map(c =>
    `<button class="chip ${c===currentFilter?'active':''}" onclick="setFilter('${c}')">${c}</button>`
  ).join('');
  renderFacetFilter();
}
function renderFacetFilter(){
  const facetEl = document.getElementById('seasonFilters');
  const facet = FACETS[currentFilter];
  if(!facet){ facetEl.innerHTML = ''; facetEl.style.display='none'; return; }
  facetEl.style.display='flex';
  const options = ["Todos", ...facet.options];
  facetEl.innerHTML = options.map(o =>
    `<button class="chip ${o===currentFacetValue?'active':''}" onclick="setFacetValue('${o}')">${o}</button>`
  ).join('');
}
function setFilter(c){ currentFilter = c; currentFacetValue = "Todos"; renderFilters(); renderGrid(); }
function setFacetValue(v){ currentFacetValue = v; renderFacetFilter(); renderGrid(); }

function renderGrid(){
  const el = document.getElementById('grid');
  let list = currentFilter==="Todos" ? products : products.filter(p=>p.cat===currentFilter);
  const facet = FACETS[currentFilter];
  if(facet && currentFacetValue!=="Todos"){
    list = list.filter(p=>p[facet.field]===currentFacetValue);
  }
  el.innerHTML = list.map(p => `
    <div class="card" onclick="openProduct(${p.id})">
      <div class="card-media" style="background:#000000">
        <span class="card-tag">${p.season ? p.cat+' · '+p.season : p.cat}</span>
        ${p.img ? `<img src="${p.img}" alt="${p.name}">` : garmentIcon()}
      </div>
      <div class="card-body">
        <div class="card-name serif">${p.name}</div>
        <div class="card-price">${fmt(p.price)}</div>
        <div class="card-dots">${p.colors.map(c=>`<span class="dot" style="background:${COLORS[c]}"></span>`).join('')}</div>
      </div>
    </div>
  `).join('');
}

/* ---------------- PRODUCT SHEET ---------------- */
function openProduct(id){
  currentProduct = products.find(p=>p.id===id);
  selectedSize = null;
  selectedColor = currentProduct.colors[0];
  renderSheet();
  document.getElementById('overlay').classList.add('active');
}
function renderSheet(){
  const p = currentProduct;
  // Se a cor selecionada tiver uma foto propria cadastrada, mostra ela; senao, foto padrao da peca.
  const imgAtual = (p.imagensPorCor && p.imagensPorCor[selectedColor]) || p.img;
  document.getElementById('sheet').innerHTML = `
    <div class="sheet-media" style="background:#000000" ${imgAtual ? `onclick="event.stopPropagation(); openLightbox('${imgAtual}','${p.name.replace(/'/g,"\\'")}')"` : ''}>
      <button class="sheet-close" onclick="event.stopPropagation(); closeSheet()">
        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
      </button>
      ${imgAtual ? `<img src="${imgAtual}" alt="${p.name}">` : garmentIcon()}
    </div>
    <div class="sheet-content">
      <div class="sheet-name serif">${p.name}</div>
      <div class="sheet-price">${fmt(p.price)}</div>
      <div class="sheet-desc">${p.desc}</div>

      <div class="field-label">Tamanho</div>
      <div class="sizes">${p.sizes.map(s=>`<div class="size-opt ${s===selectedSize?'selected':''}" onclick="pickSize('${s}')">${s}</div>`).join('')}</div>

      <div class="field-label">Cor</div>
      <div class="colors">${p.colors.map(c=>`<div class="color-opt ${c===selectedColor?'selected':''}" data-name="${c}" style="background:${COLORS[c]}" onclick="pickColor('${c}')"></div>`).join('')}</div>

      <div class="field-label">Quantidade</div>
      <div class="qty-row">
        <button class="qty-btn" onclick="changeQty(-1)">−</button>
        <span class="qty-val" id="qtyVal">1</span>
        <button class="qty-btn" onclick="changeQty(1)">+</button>
      </div>

      <button class="btn-gold" onclick="addToCart()">Adicionar à sacola</button>
    </div>
  `;
}
let qty = 1;
function pickSize(s){ selectedSize = s; renderSheet(); }
function pickColor(c){ selectedColor = c; renderSheet(); }
function changeQty(d){ qty = Math.max(1, qty+d); document.getElementById('qtyVal').textContent = qty; }
function closeSheet(){ document.getElementById('overlay').classList.remove('active'); qty = 1; }

function openLightbox(src, alt){
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxImg').alt = alt;
  lb.classList.add('active');
}
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('active');
}
function closeOnOverlay(e){ if(e.target.id==='overlay') closeSheet(); }

function addToCart(){
  if(!selectedSize){ showToast('Escolha um tamanho'); return; }
  cart.push({...currentProduct, size:selectedSize, color:selectedColor, qty});
  closeSheet();
  updateCartUI();
  showToast('Adicionado à sacola');
}

/* ---------------- CART ---------------- */
function openCart(){ document.getElementById('drawer').classList.add('active'); document.getElementById('scrim').classList.add('active'); }
function closeCart(){ document.getElementById('drawer').classList.remove('active'); document.getElementById('scrim').classList.remove('active'); }

function removeFromCart(i){ cart.splice(i,1); updateCartUI(); }

function updateCartUI(){
  document.getElementById('cartBadge').textContent = cart.length;
  const itemsEl = document.getElementById('drawerItems');
  const footEl = document.getElementById('drawerFoot');
  if(cart.length===0){
    itemsEl.innerHTML = `<div class="drawer-empty">Sua sacola está vazia.<br>Explore o catálogo e adicione suas peças favoritas.</div>`;
    footEl.style.display='none';
    return;
  }
  footEl.style.display='block';
  itemsEl.innerHTML = cart.map((it,i)=>`
    <div class="cart-row">
      <div class="cart-thumb" style="background:#000000">${it.img ? `<img src="${it.img}" alt="${it.name}">` : garmentIcon()}</div>
      <div class="cart-info">
        <div class="name serif">${it.name}</div>
        <div class="meta">Tam ${it.size} · ${it.color} · Qtd ${it.qty}</div>
        <div class="price">${fmt(it.price*it.qty)}</div>
        <div class="cart-remove" onclick="removeFromCart(${i})">Remover</div>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((s,it)=>s+it.price*it.qty,0);
  document.getElementById('cartTotal').textContent = fmt(total);
}

/* ---------------- WHATSAPP / LOCATION / SHARE ---------------- */
function checkoutWhatsApp(){
  if(cart.length===0) return;
  const nameInput = document.getElementById('customerName');
  const customerName = nameInput ? nameInput.value.trim() : '';
  if(!customerName){
    showToast('Digite seu nome antes de finalizar');
    if(nameInput) nameInput.focus();
    return;
  }
  const agora = new Date();
  const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;

  let msg = `🛍️ *NOVO PEDIDO* — Andreia Pateis\n👤 Cliente: ${customerName}\n📅 ${dataHora}\n\n`;

  cart.forEach((it,i)=>{
    msg += `*${i+1}. ${it.name}*\n`;
    msg += `   Tamanho: ${it.size} | Cor: ${it.color} | Qtd: ${it.qty}\n`;
    msg += `   Subtotal: ${fmt(it.price*it.qty)}\n\n`;
  });

  const total = cart.reduce((s,it)=>s+it.price*it.qty,0);
  msg += `━━━━━━━━━━━━━━━\n`;
  msg += `*Total: ${fmt(total)}*`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}
function talkWhatsApp(){
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Vim pelo catálogo online e gostaria de tirar uma dúvida.`, '_blank');
}
function locateStore(){
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS_QUERY)}`, '_blank');
}
function shareCatalog(){
  if(navigator.share){
    navigator.share({ title:'Andreia Pateis — Moda Íntima', text:'Confira a coleção de moda íntima da Andreia Pateis!', url: CATALOG_URL });
  } else {
    navigator.clipboard.writeText(CATALOG_URL);
    showToast('Link copiado');
  }
}

updateCartUI();

/* ---------------- FOOTER SOCIAL LINKS ---------------- */
document.getElementById('footerInstagram').href = INSTAGRAM_URL;
document.getElementById('footerFacebook').href = FACEBOOK_URL;
document.getElementById('footerElidavy').href = ELIDAVY_INSTAGRAM_URL;
document.getElementById('footerLocation').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS_QUERY)}`;

/* ---------------- EXPOSIÇÃO GLOBAL ---------------- */
// O script agora é um módulo ES (necessário para os imports do Firebase),
// e funções de módulo não caem automaticamente em `window`. Como o HTML
// chama várias delas via onclick="..." inline, expomos aqui as que precisam
// ser vistas de fora do módulo.
Object.assign(window, {
  enterApp, backToCover, setFilter, setFacetValue, openProduct,
  pickSize, pickColor, changeQty, closeSheet, addToCart,
  openLightbox, closeLightbox, closeOnOverlay,
  openCart, closeCart, removeFromCart,
  checkoutWhatsApp, talkWhatsApp, locateStore, shareCatalog,
  fcGoTo
});
