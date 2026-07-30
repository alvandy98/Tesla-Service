# Deploy to Cloudflare Pages

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Select **Create application** → **Pages** → **Connect to Git**.
3. Connect GitHub and select `alvandy98/Tesla-Service`.
4. Project name: `procode-solutions`.
5. Production branch: `main`.
6. Framework preset: `None`.
7. Build command: leave blank.
8. Build output directory: `/` (or leave blank if Cloudflare accepts the repository root).
9. Deploy.
10. Cloudflare will provide a `*.pages.dev` URL. Test the site there before attaching a custom domain.

## Admin OAuth
The Decap CMS admin remains at `/admin/`. After the Pages deployment works, deploy the GitHub OAuth proxy as a Cloudflare Worker and set `base_url` in `admin/config.yml` to that Worker URL.

## Recommended workflow
- Continue editing the GitHub repository.
- Every commit to `main` automatically deploys production.
- Use branches and pull requests for major redesigns; Cloudflare creates preview deployments.
