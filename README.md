# Alvarado Automotive — GitHub Pages Website

This package combines two divisions under one brand:

- Tesla diagnostics and independent repair
- Vehicle sales and inventory

It also includes the first stage of a browser-based content management system at `/admin/`.

## Upload the update

Upload every file and folder in this package to the **root** of the same GitHub repository, replacing older files when GitHub asks.

The root should contain:

- `index.html`
- `inventory.html`
- `vehicle.html`
- `service.html`
- `financing.html`
- `trade-in.html`
- `contact.html`
- `assets/`
- `content/`
- `admin/`

After uploading, wait for GitHub Pages to deploy, then hard-refresh the live website.

## What you can update without touching page code

### Business information
Edit `content/site.json`.

### Repair services
Edit `content/services.json`.

### Inventory
Edit `content/inventory.json`.

The website reads these JSON files automatically. Changes to price, mileage, status, descriptions, features, and image paths update the inventory cards and vehicle-detail pages.

## Adding vehicle photos manually

1. Upload images into `assets/images/uploads/`.
2. Use lowercase filenames without spaces, such as `2023-tesla-model-3-front.jpg`.
3. Add the file paths to the vehicle in `content/inventory.json`.

Use web-sized JPEG or WebP images when possible. A practical target is approximately 1600–2000 pixels wide and under 500 KB per image.

## CMS/admin system

The admin page is located at:

`https://YOUR-DOMAIN.com/admin/`

or

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/admin/`

The editor interface is installed, but GitHub authentication requires a one-time OAuth setup before the live admin login can save changes.

### First configuration change

Open `admin/config.yml` and replace:

`repo: YOUR-GITHUB-USERNAME/YOUR-REPOSITORY`

with your real repository, for example:

`repo: andresalvarado/alvarado-automotive`

### Authentication requirement

GitHub Pages cannot safely store the GitHub OAuth client secret, so the Decap CMS GitHub backend needs a small external OAuth proxy. Once that proxy is selected and deployed, add its address in `admin/config.yml`:

```yaml
backend:
  name: github
  repo: YOUR-GITHUB-USERNAME/YOUR-REPOSITORY
  branch: main
  base_url: https://YOUR-OAUTH-PROXY.example.com
  auth_endpoint: auth
```

Do not put a GitHub client secret directly into this repository.

The package includes `local_backend: true` so the editor can also be tested locally with Decap's local proxy while the live authentication step is being configured.

## Forms

The contact and trade-in pages still contain this placeholder:

`https://formspree.io/f/YOUR_FORM_ID`

Replace it with a Formspree endpoint, Google Form, or another form service before expecting submissions to arrive.

## Important business wording

The site states that the company is independent and is not affiliated with, authorized by, endorsed by, or certified by Tesla, Inc. Keep that disclosure visible and ensure every advertised service accurately reflects your tools, training, insurance, licenses, and capabilities.

## Files added in this update

- `service.html` — dedicated Tesla service page
- `content/site.json` — business information
- `content/services.json` — repair service list
- `content/inventory.json` — inventory database
- `admin/index.html` — CMS editor interface
- `admin/config.yml` — CMS fields and GitHub backend configuration
- `assets/script.js` — working inventory, gallery, business-content, service, menu, and calculator logic

## Operations fields and privacy

The CMS now includes preparation status, parts, next action, readiness, and optional financial fields. These fields are not rendered on public webpages, but a public GitHub repository can still expose the underlying JSON file. Do not enter confidential purchase or profit figures until those records are moved to a private system.

## Admin activation

1. Confirm `admin/config.yml` contains `repo: alvandy98/Tesla-Service`.
2. Deploy a GitHub OAuth proxy and add its `base_url` to `admin/config.yml`.
3. Open `https://alvandy98.github.io/Tesla-Service/admin/`.
4. Log in with a GitHub account that has write permission to the repository.
5. Test by changing one non-sensitive field and confirming a new commit appears.
