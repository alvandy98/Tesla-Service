# ProCode Solutions — Premium Automotive Website

A Cloudflare Pages-ready static website for independent Tesla diagnostics, select repairs, and vehicle sales.

## Content management

The public site reads content from:

- `content/site.json`
- `content/services.json`
- `content/inventory.json`

The Decap CMS dashboard is located at `/admin/` and configured by `admin/config.yml`.
OAuth must be connected before the dashboard can save changes to GitHub.

## Cloudflare Pages settings

- Repository: `alvandy98/Tesla-Service`
- Production branch: `main`
- Framework preset: `None`
- Build command: leave blank
- Output directory: `/`

## Branding

Use **ProCode Solutions** in customer-facing copy. The Cloudflare project slug may remain `procode-solutions` because URLs use lowercase hyphenated names.

## Before accepting leads

Replace `YOUR_FORM_ID` in the contact form with a working form endpoint.
