const state = {
  site: null,
  services: [],
  inventory: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const money = value =>
  Number(value || 0) > 0
    ? Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      })
    : "Contact for price";

const mileage = value =>
  Number(value || 0) > 0
    ? `${Number(value).toLocaleString("en-US")} miles`
    : "Mileage available on request";

const fallback = "assets/images/vehicle-placeholder.svg";

async function loadJSON(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }

  return response.json();
}

function applySite() {
  const site = state.site || {};

  $$("[data-business-name]").forEach(element => {
    element.textContent =
      site.businessName || site.name || "ProCode Solutions";
  });

  $$("[data-short-name]").forEach(element => {
    element.textContent = site.shortName || "PROCODE";
  });

  $$("[data-tagline]").forEach(element => {
    element.textContent = site.tagline || "";
  });

  $$("[data-hours]").forEach(element => {
    element.textContent = site.hours || "By appointment";
  });

  $$("[data-phone-display]").forEach(element => {
    element.textContent = site.phoneDisplay || "801-900-3492";
  });

  $$("[data-phone-link]").forEach(element => {
    element.href = `tel:${
      site.phone || site.phoneLink || "8019003492"
    }`;
  });

  $$("[data-email]").forEach(element => {
    element.textContent = site.email || "Email coming soon";
  });

  $$("[data-email-link]").forEach(element => {
    element.href = site.email ? `mailto:${site.email}` : "#";
  });

  $$("[data-city]").forEach(element => {
    element.textContent = site.city || "Utah County, Utah";
  });

  $$("[data-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });
}

function setActiveNav() {
  const file = location.pathname.split("/").pop() || "index.html";

  $$(".nav-links a").forEach(anchor => {
    const target = (anchor.getAttribute("href") || "").split("?")[0];

    if (target === file) {
      anchor.setAttribute("aria-current", "page");
    }
  });
}

function safeImage(source) {
  return source || fallback;
}

function badge(vehicle) {
  const status = vehicle.status || "Available";
  const className = String(status)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `<span class="badge ${className}">${status}</span>`;
}

function card(vehicle) {
  return `
    <article class="vehicle-card app-card reveal">
      <a
        class="vehicle-image"
        href="vehicle.html?id=${encodeURIComponent(vehicle.id)}"
      >
        ${badge(vehicle)}

        <img
          loading="lazy"
          src="${safeImage(vehicle.primaryImage)}"
          alt="${vehicle.year} ${vehicle.make} ${vehicle.model}"
          onerror="this.onerror=null;this.src='${fallback}'"
        >
      </a>

      <div class="vehicle-card-body">
        <div class="card-topline">
          <span>${vehicle.drivetrain || "Details available"}</span>
          <span>${vehicle.titleStatus || "Title information available"}</span>
        </div>

        <h3>
          ${vehicle.year} ${vehicle.make} ${vehicle.model}
        </h3>

        <p class="vehicle-meta">
          ${vehicle.trim || "Vehicle"} · ${mileage(vehicle.mileage)}
        </p>

        <div class="vehicle-card-footer">
          <strong>${money(vehicle.price)}</strong>

          <a
            class="text-link"
            href="vehicle.html?id=${encodeURIComponent(vehicle.id)}"
          >
            View details →
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderInventory(list, target) {
  const element = $(target);

  if (!element) return;

  element.innerHTML = list.length
    ? list.map(card).join("")
    : `<div class="empty-state">No vehicles match your search.</div>`;

  revealElements(element);
}

function renderFeatured() {
  const vehicles = state.inventory
    .filter(vehicle => {
      return (
        vehicle.featured !== false &&
        String(vehicle.status).toLowerCase() !== "sold"
      );
    })
    .slice(0, 3);

  renderInventory(vehicles, "#featured-inventory");
}

function renderAll() {
  if (!$("#inventory-grid")) return;

  const search = $("#inventory-search");
  const status = $("#inventory-status");
  const count = $("#inventory-count");

  const update = () => {
    const query = (search?.value || "").toLowerCase();
    const selectedStatus = (status?.value || "").toLowerCase();

    const vehicles = state.inventory.filter(vehicle => {
      const searchableText = `
        ${vehicle.year}
        ${vehicle.make}
        ${vehicle.model}
        ${vehicle.trim}
        ${vehicle.drivetrain}
        ${vehicle.stockNumber}
      `.toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (!selectedStatus ||
          String(vehicle.status).toLowerCase() === selectedStatus)
      );
    });

    renderInventory(vehicles, "#inventory-grid");

    if (count) {
      count.textContent =
        `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"}`;
    }
  };

  search?.addEventListener("input", update);
  status?.addEventListener("change", update);

  update();
}

function renderServices() {
  const targets = ["#service-grid", "#services-grid"];

  targets.forEach(selector => {
    const element = $(selector);

    if (!element) return;

    element.innerHTML = state.services
      .map((service, index) => {
        return `
          <article class="service-tile app-card reveal">
            <span class="service-index">
              ${String(index + 1).padStart(2, "0")}
            </span>

            <div>
              <h3>${service.name}</h3>
              <p>${service.description}</p>
            </div>

            <span class="service-arrow">↗</span>
          </article>
        `;
      })
      .join("");

    revealElements(element);
  });
}

function renderVehicle() {
  const root =
    $("#vehicle-detail-root") ||
    $("#vehicle-detail");

  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");

  const vehicle =
    state.inventory.find(item => String(item.id) === String(id)) ||
    state.inventory[0];

  if (!vehicle) {
    root.innerHTML = `
      <div class="container vehicle-loading">
        <div class="empty-state">
          Vehicle not found.
          <br>
          <a class="text-link" href="inventory.html">
            Return to inventory →
          </a>
        </div>
      </div>
    `;

    return;
  }

  document.title =
    `${vehicle.year} ${vehicle.make} ${vehicle.model} | ProCode Solutions`;

  const gallery = [
    vehicle.primaryImage,
    ...(vehicle.gallery || [])
  ].filter(Boolean);

  const features =
    vehicle.features?.length
      ? vehicle.features
      : [
          vehicle.drivetrain || "Vehicle details available",
          vehicle.trim || "Vehicle trim available",
          "Direct communication with ProCode Solutions"
        ];

  const inspection =
    vehicle.inspection?.length
      ? vehicle.inspection
      : [
          "Vehicle road tested",
          "Charging operation reviewed",
          "Low-voltage system reviewed",
          "Cooling-system operation reviewed",
          "HVAC operation reviewed",
          "Touchscreen operation reviewed",
          "Drive functions reviewed",
          "Active warning messages reviewed",
          "Interior condition reviewed",
          "Exterior condition reviewed"
        ];

  const overview =
    vehicle.overview ||
    vehicle.description ||
    "Contact ProCode Solutions for complete vehicle information.";

  const restoration =
    vehicle.restorationSummary ||
    vehicle.repairSummary ||
    `This vehicle has been inspected and prepared before being offered for sale. Contact ProCode Solutions for additional repair, title, and restoration information.`;

  const whyChosen =
    vehicle.whyWeChose ||
    vehicle.whyWeBought ||
    `We selected this vehicle because it offers a strong combination of performance, technology, condition, and everyday usability.`;

  const technicianNote =
    vehicle.technicianNote ||
    `The same team that diagnoses and repairs Tesla electrical and computer-system concerns also reviews the vehicles prepared for sale by ProCode Solutions.`;

  const specifications = [
    ["Year", vehicle.year || "—"],
    ["Make", vehicle.make || "—"],
    ["Model", vehicle.model || "—"],
    ["Trim", vehicle.trim || "—"],
    ["Mileage", mileage(vehicle.mileage)],
    ["Price", money(vehicle.price)],
    ["Drivetrain", vehicle.drivetrain || "—"],
    ["Transmission", vehicle.transmission || "Single-speed automatic"],
    ["Exterior", vehicle.exteriorColor || "—"],
    ["Interior", vehicle.interiorColor || "—"],
    ["Title status", vehicle.titleStatus || "Contact us"],
    ["VIN", vehicle.vin || "Available on request"],
    ["Stock number", vehicle.stockNumber || "Available on request"],
    ["Range", vehicle.range || "Factory specification available"],
    ["Wheels", vehicle.wheels || "Vehicle-specific information available"]
  ];

  root.innerHTML = `
    <section class="vehicle-product-hero">
      <div class="vehicle-product-media">
        <img
          src="${safeImage(gallery[0])}"
          alt="${vehicle.year} ${vehicle.make} ${vehicle.model}"
          onerror="this.onerror=null;this.src='${fallback}'"
        >
      </div>

      <div class="container vehicle-product-hero-content">
        <div class="vehicle-product-copy reveal">
          <div class="vehicle-product-badges">
            <span class="procode-badge">ProCode Inspected</span>
            ${badge(vehicle)}
          </div>

          <p class="eyebrow">
            ${vehicle.stockNumber || "Available inventory"}
          </p>

          <h1>
            ${vehicle.year}
            ${vehicle.make}
            ${vehicle.model}
          </h1>

          <p class="vehicle-product-subtitle">
            ${vehicle.trim || ""}
            ${vehicle.trim ? " · " : ""}
            ${vehicle.drivetrain || ""}
          </p>

          <p class="vehicle-product-price">
            ${money(vehicle.price)}
          </p>

          <div class="vehicle-product-actions">
            <a
              class="button primary"
              href="contact.html?interest=${encodeURIComponent(vehicle.id)}"
            >
              Schedule a test drive
            </a>

            <a
              class="button glass"
              href="tel:8019003492"
              data-phone-link
            >
              Call or text
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="container vehicle-quick-specs">
      <div class="vehicle-quick-spec-grid reveal">
        <div class="vehicle-quick-spec">
          <span>Mileage</span>
          <strong>${mileage(vehicle.mileage)}</strong>
        </div>

        <div class="vehicle-quick-spec">
          <span>Drivetrain</span>
          <strong>${vehicle.drivetrain || "Details available"}</strong>
        </div>

        <div class="vehicle-quick-spec">
          <span>Title</span>
          <strong>${vehicle.titleStatus || "Contact us"}</strong>
        </div>

        <div class="vehicle-quick-spec">
          <span>Exterior</span>
          <strong>${vehicle.exteriorColor || "Details available"}</strong>
        </div>
      </div>
    </div>

    <section class="vehicle-story-section">
      <div class="container vehicle-story-grid">
        <div class="vehicle-story-heading reveal">
          <p class="eyebrow">Vehicle overview</p>
          <h2>
            Performance, technology, and everyday usability.
          </h2>
        </div>

        <div class="vehicle-story-content reveal">
          <p>${overview}</p>

          <p>
            Contact ProCode Solutions to review title history, condition,
            repair information, availability, and test-drive options.
          </p>
        </div>
      </div>
    </section>

    <section class="vehicle-highlight-section">
      <div class="container">
        <div class="vehicle-section-heading reveal">
          <div>
            <p class="eyebrow">Vehicle highlights</p>
            <h2>What makes this vehicle stand out.</h2>
          </div>

          <p>
            Equipment and features are based on the information available for
            this specific vehicle.
          </p>
        </div>

        <div class="vehicle-highlight-grid">
          ${features
            .map((feature, index) => {
              return `
                <article class="vehicle-highlight-card reveal">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <h3>${feature}</h3>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>

    <section class="vehicle-inspection-section">
      <div class="container">
        <div class="vehicle-inspection-shell reveal">
          <div class="vehicle-inspection-header">
            <div>
              <p class="eyebrow">ProCode inspection</p>
              <h2>Reviewed before being offered for sale.</h2>
            </div>

            <span class="inspection-status">
              INSPECTION RECORDED
            </span>
          </div>

          <div class="vehicle-inspection-grid">
            ${inspection
              .map(item => {
                return `
                  <div class="inspection-item">
                    <span class="inspection-check">✓</span>
                    <span>${item}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="vehicle-restoration-section">
      <div class="container vehicle-restoration-grid">
        <article class="vehicle-content-panel reveal">
          <p class="eyebrow">Restoration summary</p>
          <h2>Transparent vehicle information.</h2>

          <p>${restoration}</p>

          ${
            vehicle.disclosure
              ? `
                <div class="vehicle-disclosure">
                  <strong>Vehicle disclosure</strong>
                  <p>${vehicle.disclosure}</p>
                </div>
              `
              : ""
          }
        </article>

        <article class="vehicle-content-panel reveal">
          <p class="eyebrow">Why we chose it</p>
          <h2>Selected for the ProCode inventory.</h2>

          <p>${whyChosen}</p>
        </article>
      </div>
    </section>

    <section class="vehicle-specification-section">
      <div class="container">
        <div class="vehicle-section-heading reveal">
          <div>
            <p class="eyebrow">Vehicle specifications</p>
            <h2>Important details at a glance.</h2>
          </div>

          <p>
            Specifications, mileage, equipment, pricing, and availability are
            subject to verification and change.
          </p>
        </div>

        <div class="vehicle-specification-grid reveal">
          ${specifications
            .map(([label, value]) => {
              return `
                <div class="vehicle-specification">
                  <span>${label}</span>
                  <strong>${value}</strong>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>

    <section class="vehicle-gallery-section">
      <div class="container">
        <div class="vehicle-section-heading reveal">
          <div>
            <p class="eyebrow">Photo gallery</p>
            <h2>Explore the vehicle.</h2>
          </div>

          <p>
            Select a photo to enlarge it.
          </p>
        </div>

        <div class="vehicle-gallery-main reveal">
          <img
            id="main-vehicle-photo"
            src="${safeImage(gallery[0])}"
            alt="${vehicle.year} ${vehicle.make} ${vehicle.model}"
            onerror="this.onerror=null;this.src='${fallback}'"
          >

          <button
            class="gallery-expand"
            type="button"
            id="open-vehicle-gallery"
          >
            View full screen
          </button>
        </div>

        ${
          gallery.length > 1
            ? `
              <div class="vehicle-gallery-thumbnails">
                ${gallery
                  .map((image, index) => {
                    return `
                      <button
                        class="vehicle-gallery-thumbnail ${
                          index === 0 ? "active" : ""
                        }"
                        type="button"
                        data-image="${image}"
                        data-index="${index}"
                        aria-label="View photo ${index + 1}"
                      >
                        <img
                          src="${image}"
                          alt="Vehicle photo ${index + 1}"
                          onerror="this.onerror=null;this.src='${fallback}'"
                        >
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
    </section>

    <section class="vehicle-team-section">
      <div class="container vehicle-team-grid">
        <div class="vehicle-team-visual reveal">
          <div class="vehicle-team-mark">
            <span>PROCODE SOLUTIONS</span>
            <strong>DIAGNOSE · RESTORE · DRIVE</strong>
          </div>
        </div>

        <div class="vehicle-team-copy reveal">
          <p class="eyebrow">The team behind the vehicle</p>
          <h2>Prepared by people who understand Tesla systems.</h2>

          <p>${technicianNote}</p>

          <p>
            ProCode Solutions is an independent business and is not affiliated
            with or certified by Tesla, Inc.
          </p>
        </div>
      </div>
    </section>

    <section class="vehicle-contact-section">
      <div class="container">
        <div class="vehicle-contact-card reveal">
          <div>
            <p class="eyebrow">Interested in this vehicle?</p>

            <h2>
              Ask a question or schedule a test drive.
            </h2>

            <p>
              Contact us to confirm availability, review vehicle history, or
              arrange an appointment.
            </p>
          </div>

          <div class="button-row">
            <a
              class="button primary"
              href="contact.html?interest=${encodeURIComponent(vehicle.id)}"
            >
              Contact about this vehicle
            </a>

            <a
              class="button glass"
              href="tel:8019003492"
              data-phone-link
            >
              801-900-3492
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  applySite();
  initializeVehicleGallery(gallery);
  revealElements(root);
}

function initializeVehicleGallery(gallery) {
  if (!gallery.length) return;

  const mainImage = $("#main-vehicle-photo");
  const thumbnails = $$(".vehicle-gallery-thumbnail");
  const lightbox = $("#vehicle-lightbox");
  const lightboxImage = $("#lightbox-image");
  const lightboxCount = $("#lightbox-count");

  let selectedIndex = 0;

  function selectImage(index) {
    selectedIndex = index;
    const image = gallery[index];

    if (mainImage) {
      mainImage.src = image;
    }

    thumbnails.forEach(thumbnail => {
      thumbnail.classList.toggle(
        "active",
        Number(thumbnail.dataset.index) === index
      );
    });
  }

  function showLightbox(index = selectedIndex) {
    selectedIndex = index;

    if (!lightbox || !lightboxImage) return;

    lightboxImage.src = gallery[selectedIndex];
    lightboxCount.textContent =
      `${selectedIndex + 1} / ${gallery.length}`;

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function moveLightbox(direction) {
    selectedIndex =
      (selectedIndex + direction + gallery.length) % gallery.length;

    lightboxImage.src = gallery[selectedIndex];
    lightboxCount.textContent =
      `${selectedIndex + 1} / ${gallery.length}`;

    selectImage(selectedIndex);
  }

  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener("click", () => {
      selectImage(Number(thumbnail.dataset.index));
    });

    thumbnail.addEventListener("dblclick", () => {
      showLightbox(Number(thumbnail.dataset.index));
    });
  });

  mainImage?.addEventListener("click", () => {
    showLightbox(selectedIndex);
  });

  $("#open-vehicle-gallery")?.addEventListener("click", () => {
    showLightbox(selectedIndex);
  });

  $(".lightbox-close")?.addEventListener("click", closeLightbox);

  $(".lightbox-previous")?.addEventListener("click", () => {
    moveLightbox(-1);
  });

  $(".lightbox-next")?.addEventListener("click", () => {
    moveLightbox(1);
  });

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
}

function fillInterest() {
  const input = $("#vehicle-interest");

  if (!input) return;

  const id =
    new URLSearchParams(location.search).get("interest");

  const vehicle =
    state.inventory.find(item => String(item.id) === String(id));

  if (vehicle) {
    input.value =
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  }
}

function menu() {
  const button = $(".menu-button");
  const navigation = $(".nav-links");

  button?.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");

    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "×" : "☰";
  });

  $$(".nav-links a").forEach(anchor => {
    anchor.addEventListener("click", () => {
      navigation?.classList.remove("open");
      button?.setAttribute("aria-expanded", "false");
    });
  });
}

let observer;

function revealElements(root = document) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".reveal", root).forEach(element => {
      element.classList.add("is-visible");
    });

    return;
  }

  observer ??= new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$(".reveal", root).forEach(element => {
    observer.observe(element);
  });
}

function prepareLoading() {
  [
    "#featured-inventory",
    "#inventory-grid",
    "#service-grid",
    "#services-grid"
  ].forEach(selector => {
    const element = $(selector);

    if (element && !element.children.length) {
      element.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      `;
    }
  });
}

async function init() {
  prepareLoading();

  try {
    const [
      siteDocument,
      servicesDocument,
      inventoryDocument
    ] = await Promise.all([
      loadJSON("content/site.json"),
      loadJSON("content/services.json"),
      loadJSON("content/inventory.json")
    ]);

    state.site = siteDocument;

    state.services =
      servicesDocument.services ||
      servicesDocument ||
      [];

    state.inventory =
      (
        inventoryDocument.vehicles ||
        inventoryDocument ||
        []
      ).map(vehicle => ({
        ...vehicle,
        primaryImage:
          vehicle.primaryImage ||
          vehicle.image,
        titleStatus:
          vehicle.titleStatus ||
          vehicle.title,
        stockNumber:
          vehicle.stockNumber ||
          vehicle.stock,
        exteriorColor:
          vehicle.exteriorColor ||
          vehicle.exterior,
        interiorColor:
          vehicle.interiorColor ||
          vehicle.interior
      }));
  } catch (error) {
    console.warn("Content load issue", error);

    state.site = {
      name: "ProCode Solutions",
      phoneLink: "8019003492",
      phoneDisplay: "801-900-3492",
      city: "Utah County, Utah"
    };

    state.services = [];
    state.inventory = [];
  }

  applySite();
  setActiveNav();
  menu();
  renderFeatured();
  renderAll();
  renderServices();
  renderVehicle();
  fillInterest();
  revealElements();
}

document.addEventListener("DOMContentLoaded", init);