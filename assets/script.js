(() => {
  'use strict';
  const FALLBACK = 'assets/images/vehicle-placeholder.svg';
  const money = value => value ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value) : 'Contact for price';
  const number = value => value ? new Intl.NumberFormat('en-US').format(value) : 'Contact for mileage';
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fetchJSON = async path => { const r=await fetch(path,{cache:'no-store'}); if(!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); };
  const normalize = item => item.publicListing || item;

  async function init(){
    const [site, servicesData, inventoryData] = await Promise.all([
      fetchJSON('content/site.json'), fetchJSON('content/services.json'), fetchJSON('content/inventory.json')
    ]);
    const vehicles=(inventoryData.vehicles||[]).map(normalize);
    bindSite(site);
    nav();
    renderFeatured(vehicles);
    renderInventory(vehicles);
    renderVehicle(vehicles);
    renderServices(servicesData,site);
    calculator();
    prefill();
  }

  function bindSite(s){
    document.querySelectorAll('[data-business-name]').forEach(e=>e.textContent=s.name);
    document.querySelectorAll('[data-phone-display]').forEach(e=>e.textContent=s.phoneDisplay);
    document.querySelectorAll('[data-phone-link]').forEach(e=>e.href=`tel:${s.phoneLink}`);
    document.querySelectorAll('[data-email]').forEach(e=>e.textContent=s.email || 'Call or text us');
    document.querySelectorAll('[data-email-link]').forEach(e=>{e.href=s.email?`mailto:${s.email}`:`tel:${s.phoneLink}`});
    document.querySelectorAll('[data-city]').forEach(e=>e.textContent=s.city);
    document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
    const heroTitle=document.querySelector('[data-hero-title]'); if(heroTitle) heroTitle.textContent=s.heroTitle;
    const heroText=document.querySelector('[data-hero-text]'); if(heroText) heroText.textContent=s.heroText;
  }

  function nav(){
    const btn=document.querySelector('.menu-button'), links=document.querySelector('.nav-links');
    if(btn&&links) btn.addEventListener('click',()=>{const open=links.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
  }

  function card(v){
    if(v.status==='Not Listed') return '';
    return `<article class="vehicle-card"><a class="vehicle-image" href="vehicle.html?id=${encodeURIComponent(v.id)}"><img src="${esc(v.image||FALLBACK)}" alt="${esc(`${v.year} ${v.make} ${v.model}`)}" onerror="this.src='${FALLBACK}'"><span class="status-badge">${esc(v.status)}</span></a><div class="vehicle-card-body"><p class="eyebrow">${esc(v.stock||'Available')}</p><h3><a href="vehicle.html?id=${encodeURIComponent(v.id)}">${esc(`${v.year} ${v.make} ${v.model}`)}</a></h3><p>${esc(v.trim||v.title||'')}</p><div class="vehicle-card-meta"><strong>${money(v.price)}</strong><span>${number(v.mileage)}${v.mileage?' miles':''}</span></div><a class="text-link" href="vehicle.html?id=${encodeURIComponent(v.id)}">View vehicle →</a></div></article>`;
  }
  function renderFeatured(vs){const el=document.querySelector('#featured-inventory');if(el) el.innerHTML=vs.filter(v=>v.featured&&v.status!=='Sold'&&v.status!=='Not Listed').slice(0,3).map(card).join('')||'<p>No featured vehicles yet.</p>';}
  function renderInventory(vs){
    const el=document.querySelector('#inventory-grid'); if(!el)return;
    const visible=vs.filter(v=>v.status!=='Not Listed');
    el.innerHTML=visible.map(card).join('');
    const search=document.querySelector('#inventory-search');
    const status=document.querySelector('#status-filter');
    const apply=()=>{const q=(search?.value||'').toLowerCase(), st=status?.value||'';el.innerHTML=visible.filter(v=>(!q||`${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(q))&&(!st||v.status===st)).map(card).join('')||'<p>No matching vehicles.</p>';};
    search?.addEventListener('input',apply);status?.addEventListener('change',apply);
  }
  function renderVehicle(vs){
    const el=document.querySelector('#vehicle-detail');if(!el)return;
    const id=new URLSearchParams(location.search).get('id'),v=vs.find(x=>x.id===id);
    if(!v){el.innerHTML='<section class="page-hero"><h1>Vehicle not found</h1><p>This listing may have been removed or sold.</p></section>';return;}
    const gallery=(v.gallery?.length?v.gallery:[v.image]).filter(Boolean);
    document.title=`${v.year} ${v.make} ${v.model} | Pro-Code Solutions`;
    el.innerHTML=`<section class="vehicle-gallery"><div class="vehicle-main-image"><img id="main-vehicle-image" src="${esc(gallery[0]||FALLBACK)}" alt="${esc(`${v.year} ${v.make} ${v.model}`)}" onerror="this.src='${FALLBACK}'"></div><div class="thumbnail-row">${gallery.map((x,i)=>`<button class="thumbnail ${i===0?'active':''}" data-src="${esc(x)}"><img src="${esc(x)}" alt="Vehicle photo ${i+1}" onerror="this.src='${FALLBACK}'"></button>`).join('')}</div></section><section class="vehicle-summary"><div><p class="eyebrow">${esc(v.status)} · Stock ${esc(v.stock)}</p><h1>${esc(`${v.year} ${v.make} ${v.model}`)}</h1><p class="lead">${esc(v.trim||'')}</p></div><div class="vehicle-price">${money(v.price)}</div></section><section class="vehicle-content-grid"><div><h2>Vehicle overview</h2><p>${esc(v.description)}</p>${v.disclosure?`<div class="notice"><strong>Disclosure</strong><br>${esc(v.disclosure)}</div>`:''}<h2>Features</h2><ul class="feature-grid">${(v.features||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div><aside class="info-card"><h2>Details</h2><dl class="spec-list"><div><dt>Mileage</dt><dd>${number(v.mileage)}${v.mileage?' miles':''}</dd></div><div><dt>Title</dt><dd>${esc(v.title)}</dd></div><div><dt>Drivetrain</dt><dd>${esc(v.drivetrain||'Contact us')}</dd></div><div><dt>Transmission</dt><dd>${esc(v.transmission||'Contact us')}</dd></div><div><dt>Exterior</dt><dd>${esc(v.exterior||'Contact us')}</dd></div><div><dt>Interior</dt><dd>${esc(v.interior||'Contact us')}</dd></div><div><dt>VIN</dt><dd>${esc(v.vin)}</dd></div></dl><a class="button primary" href="contact.html?vehicle=${encodeURIComponent(`${v.year} ${v.make} ${v.model}`)}">Ask about this vehicle</a></aside></section>`;
    el.querySelectorAll('.thumbnail').forEach(b=>b.addEventListener('click',()=>{el.querySelector('#main-vehicle-image').src=b.dataset.src;el.querySelectorAll('.thumbnail').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));
  }
  function renderServices(data,site){
    const el=document.querySelector('#services-grid');if(!el)return;
    el.innerHTML=(data.services||[]).filter(s=>s.featured!==false).map(s=>`<article class="service-card"><span class="service-icon">${esc(s.icon)}</span><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p>${s.startingPrice?`<strong>Starting at ${money(s.startingPrice)}</strong>`:''}</article>`).join('');
    document.querySelectorAll('[data-diagnostic-price]').forEach(e=>e.textContent=money(site.diagnosticPrice));
  }
  function calculator(){
    const form=document.querySelector('#payment-calculator');if(!form)return;
    form.addEventListener('submit',e=>{e.preventDefault();const price=+form.price.value||0,down=+form.down.value||0,trade=+form.trade.value||0,apr=(+form.apr.value||0)/1200,n=+form.months.value||60,p=Math.max(0,price-down-trade);const payment=apr?p*apr*Math.pow(1+apr,n)/(Math.pow(1+apr,n)-1):p/n;document.querySelector('#payment-result').innerHTML=`Estimated payment: <strong>${money(payment)}/month</strong>`;});
  }
  function prefill(){const value=new URLSearchParams(location.search).get('vehicle');const input=document.querySelector('#vehicle-interest');if(value&&input)input.value=value;}
  init().catch(err=>{console.error(err);document.querySelectorAll('#featured-inventory,#inventory-grid,#services-grid,#vehicle-detail').forEach(el=>{if(el)el.innerHTML='<div class="notice">Website content could not load. Confirm the content folder was uploaded and refresh the page.</div>';});});
})();
