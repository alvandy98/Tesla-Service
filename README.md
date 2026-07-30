# ProCode Solutions — Version 2.0 Foundation

This directory is the single master codebase for the ProCode Solutions public website and CMS foundation.

## Public pages
- `index.html` — landing page
- `service.html` — Tesla diagnostics and repair
- `inventory.html` — searchable inventory
- `vehicle.html` — dynamic vehicle detail page
- `contact.html` — service and sales contact form

## Content
- `content/site.json` — business information
- `content/services.json` — diagnostic and repair services
- `content/inventory.json` — public vehicle listings

## Admin
- `admin/index.html` — Decap CMS entry point
- `admin/config.yml` — CMS configuration
- `admin/mission-control.html` — visual preview of the future operations dashboard

## Version 2.0 foundation changes
- Shared design tokens for color, typography, spacing, radius, shadow, and motion
- One navigation and footer pattern across all public pages
- Accessible skip links, labels, focus states, and reduced-motion support
- Active navigation states
- Responsive mobile menu
- Loading skeletons and missing-image fallbacks
- Corrected service-grid and vehicle-detail rendering IDs
- Improved inventory filtering and status badges
- Unified form controls and page shells
- Mission Control dashboard preview shell

## Cloudflare Pages
The repository is deployed automatically through Cloudflare Pages.

- Production branch: `main`
- Framework preset: None
- Build command: blank
- Output directory: `/`

## Important remaining setup
1. Configure GitHub OAuth for `/admin/`.
2. Replace `YOUR_FORM_ID` in `contact.html` with a Formspree form ID or future Cloudflare form endpoint.
3. Upload actual vehicle photos to `assets/images/uploads/` and update `content/inventory.json`.
4. Keep private costs, profit, customer data, and internal repair notes out of this public repository.
