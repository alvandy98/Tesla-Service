(() => {
  const FALLBACK_IMAGE = 'assets/images/vehicle-placeholder.svg';
  const state = { site: window.DEALERSHIP || {}, vehicles: window.VEHICLES || [], services: [] };

  const money = value => Number(value) > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : 'Contact for price';
  const miles = value => Number(value) > 0 ? `${Number(value).toLocaleString('en-US')} miles` : 'Contact for mileage';
  const safeImage = value => value || FALLBACK_IMAGE;
  const normalizeList = list => (list || []).map(item => typeof item === 'string' ? item : (item.photo || item.feature || '')).filter(Boolean);

  async function loadContent() {
    try {
      const [siteRes, inventoryRes, servicesRes] = await Promise.all([
        fetch('content/site.json', { cache: 'no-store' }),
        fetch('content/inventory.json', { cache: 'no-store' }),
        fetch('content/services.json', { cache: 'no-store' })
      ]);
      if (siteRes.ok) state.site = await siteRes.json();
      if (inventoryRes.ok) state.vehicles = (await inventoryRes.json()).vehicles || [];
      if (servicesRes.ok) state.services = (await servicesRes.json()).services || [];
    } catch (error) {
      console.warn('Using fallback website data.', error);
    }
  }

  function applyBusinessInfo() {
    const s = state.site;
    document.querySelectorAll('[data-business-name]').forEach(el => el.textContent = s.name || 'Alvarado Automotive');
    document.querySelectorAll('[data-short-name]').forEach(el => el.textContent = s.shortName || s.name || 'ALVARADO');
    document.querySelectorAll('[data-phone-display]').forEach(el => el.textContent = s.phoneDisplay || 'Call for details');
    document.querySelectorAll('[data-phone-link]').forEach(el => el.href = `tel:${s.phoneLink || ''}`);
    document.querySelectorAll('[data-email]').forEach(el => el.textContent = s.email || '');
    document.querySelectorAll('[data-email-link]').forEach(el => el.href = `mailto:${s.email || ''}`);
    document.querySelectorAll('[data-city]').forEach(el => el.textContent = s.city || 'Utah County, Utah');
    document.querySelectorAll('[data-hours]').forEach(el => el.textContent = s.hours || 'By appointment');
    document.querySelectorAll('[data-tagline]').forEach(el => el.textContent = s.tagline || 'Tesla diagnostics, repair, and vehicle sales.');
    document.querySelectorAll('[data-hero-title]').forEach(el => el.textContent = s.heroTitle || 'Tesla expertise. From diagnostics to your next drive.');
    document.querySelectorAll('[data-hero-text]').forEach(el => el.textContent = s.heroText || s.tagline || 'Independent Tesla specialists serving Utah.');
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  function vehicleCard(vehicle) {
    const statusClass = vehicle.status === 'Available' ? 'available' : vehicle.status === 'Sold' ? 'sold' : 'coming';
    return `<article class="vehicle-card">
      <a class="vehicle-image" href="vehicle.html?id=${encodeURIComponent(vehicle.id)}">
        <span class="badge ${statusClass}">${vehicle.status || 'Available'}</span>
        <img src="${safeImage(vehicle.image)}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}" onerror="this.src='${FALLBACK_IMAGE}'">
      </a>
      <div class="vehicle-card-body">
        <p class="eyebrow">${vehicle.year} · ${vehicle.stock || 'Inventory'}</p>
        <h3>${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}</h3>
        <p class="vehicle-meta">${miles(vehicle.mileage)} · ${vehicle.title || 'Title details available'}</p>
        <div class="vehicle-card-footer"><strong>${money(vehicle.price)}</strong><a class="text-link" href="vehicle.html?id=${encodeURIComponent(vehicle.id)}">View vehicle →</a></div>
      </div>
    </article>`;
  }

  function renderInventory(target, vehicles) {
    if (!target) return;
    target.innerHTML = vehicles.length ? vehicles.map(vehicleCard).join('') : '<div class="empty-state"><h3>No matching vehicles</h3><p>Try another search or contact us about incoming inventory.</p></div>';
  }

  function setupInventory() {
    const grid = document.querySelector('#inventory-grid');
    if (!grid) return;
    const search = document.querySelector('#inventory-search');
    const status = document.querySelector('#inventory-status');
    const count = document.querySelector('#inventory-count');
    const update = () => {
      const q = (search?.value || '').toLowerCase().trim();
      const selected = status?.value || '';
      const filtered = state.vehicles.filter(v => {
        const haystack = `${v.year} ${v.make} ${v.model} ${v.trim || ''} ${v.stock || ''}`.toLowerCase();
        return (!q || haystack.includes(q)) && (!selected || v.status === selected);
      });
      renderInventory(grid, filtered);
      if (count) count.textContent = `${filtered.length} vehicle${filtered.length === 1 ? '' : 's'}`;
    };
    search?.addEventListener('input', update);
    status?.addEventListener('change', update);
    update();
  }

  function setupFeatured() {
    const target = document.querySelector('#featured-inventory');
    if (!target) return;
    renderInventory(target, state.vehicles.filter(v => v.featured && v.status !== 'Sold').slice(0, 3));
  }

  function setupServices() {
    const target = document.querySelector('#services-grid');
    if (!target) return;
    target.innerHTML = state.services.map((service, index) => `<article class="service-card"><span>${service.icon || String(index + 1).padStart(2, '0')}</span><h3>${service.name}</h3><p>${service.description}</p></article>`).join('');
  }

  function setupVehiclePage() {
    const target = document.querySelector('#vehicle-detail');
    if (!target) return;
    const id = new URLSearchParams(location.search).get('id');
    const v = state.vehicles.find(item => item.id === id) || state.vehicles[0];
    if (!v) { target.innerHTML = '<div class="empty-state"><h1>Vehicle not found</h1><a class="button primary" href="inventory.html">Return to inventory</a></div>'; return; }
    const gallery = normalizeList(v.gallery).length ? normalizeList(v.gallery) : [v.image];
    const features = normalizeList(v.features);
    target.innerHTML = `<div class="vehicle-detail-grid">
      <div><div class="main-photo"><img id="main-vehicle-photo" src="${safeImage(gallery[0])}" alt="${v.year} ${v.make} ${v.model}" onerror="this.src='${FALLBACK_IMAGE}'"></div>
      <div class="thumbnail-row">${gallery.map((img, i) => `<button class="thumbnail ${i === 0 ? 'active' : ''}" data-photo="${img}"><img src="${safeImage(img)}" alt="Vehicle photo ${i + 1}" onerror="this.src='${FALLBACK_IMAGE}'"></button>`).join('')}</div></div>
      <aside class="vehicle-summary"><span class="badge ${v.status === 'Available' ? 'available' : 'coming'}">${v.status}</span><p class="eyebrow">Stock ${v.stock || '—'}</p><h1>${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}</h1><p class="detail-price">${money(v.price)}</p><p class="detail-mileage">${miles(v.mileage)}</p><p>${v.description || ''}</p><div class="button-row"><a class="button primary" href="contact.html?interest=${encodeURIComponent(v.id)}">Ask about this vehicle</a><a class="button secondary" data-phone-link href="#"><span data-phone-display></span></a></div></aside>
    </div>
    <section class="detail-section"><p class="eyebrow">Specifications</p><h2>Vehicle details</h2><div class="spec-grid">
      ${[['Title',v.title],['VIN',v.vin],['Drivetrain',v.drivetrain],['Transmission',v.transmission],['Exterior',v.exterior],['Interior',v.interior]].map(([k,val]) => `<div><span>${k}</span><strong>${val || 'Contact for details'}</strong></div>`).join('')}
    </div></section>
    <section class="detail-section two-column"><div><p class="eyebrow">Highlights</p><h2>Features</h2><ul class="check-list">${features.map(f => `<li>${f}</li>`).join('')}</ul></div><div class="disclosure-box"><p class="eyebrow">Transparency</p><h2>History disclosure</h2><p>Title and known repair information should be reviewed directly before purchase. Ask for the current title status, available documentation, and an opportunity to inspect the vehicle independently.</p></div></section>`;
    applyBusinessInfo();
    document.querySelectorAll('.thumbnail').forEach(button => button.addEventListener('click', () => {
      document.querySelector('#main-vehicle-photo').src = button.dataset.photo;
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      button.classList.add('active');
    }));
  }

  function setupCalculator() {
    const form = document.querySelector('#payment-calculator');
    const result = document.querySelector('#payment-result');
    if (!form || !result) return;
    const calculate = event => {
      event?.preventDefault();
      const price = Number(form.price.value || 0), down = Number(form.down.value || 0), trade = Number(form.trade.value || 0), apr = Number(form.apr.value || 0), months = Number(form.months.value || 60);
      const principal = Math.max(0, price - down - trade), monthlyRate = apr / 100 / 12;
      const payment = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
      result.innerHTML = `<span>Estimated monthly payment</span><strong>${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(payment || 0)}</strong><small>Estimate only. Taxes, registration, fees, insurance, and lender terms are not included.</small>`;
    };
    form.addEventListener('submit', calculate); calculate();
  }

  function setupMenu() {
    const button = document.querySelector('.menu-button');
    const nav = document.querySelector('.nav-links');
    button?.addEventListener('click', () => { const open = nav.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    applyBusinessInfo(); setupMenu(); setupFeatured(); setupInventory(); setupServices(); setupVehiclePage(); setupCalculator();
  });
})();
