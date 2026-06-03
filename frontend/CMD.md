# Command Reference for Zoventro

This file documents the most important commands for development, testing, linting, formatting, building, and deployment.

---

## 1. Install dependencies

Use this first after cloning the repository.

```bash
npm install
```

If dependencies are already installed, you can update them with:

```bash
npm update
```

---

## 2. Start development server

Run the app locally in development mode.

```bash
npm run dev
```

Then open the browser at:

```text
http://localhost:5173
```

> If `localhost:5173` is occupied, Vite will suggest another port.

---

## 3. Build for production

Compile the app for production output.

```bash
npm run build
```

This generates optimized static assets in the `dist/` directory.

---

## 4. Build for development mode

Use this when you want a dev-mode build output without minification.

```bash
npm run build:dev
```

---

## 5. Preview production build locally

After building, preview the production output in a local server.

```bash
npm run preview
```

Then open the browser at the address shown in the terminal.

---

## 6. Code quality and formatting

### Run ESLint

Check the codebase for linting issues.

```bash
npm run lint
```

### Format code with Prettier

Automatically format all files.

```bash
npm run format
```

---

## 7. Cloudflare / production deployment

This project uses Cloudflare Workers if deployed through Wrangler. Run these from the repo root.

### Authenticate Wrangler (if needed)

```bash
npx wrangler login
```

### Publish to Cloudflare

```bash
npx wrangler publish
```

> Confirm your Cloudflare account and environment are configured in `wrangler.jsonc`.

### Preview Cloudflare deployment

```bash
npx wrangler dev
```

---

## 8. Useful troubleshooting commands

### Verify installed node version

```bash
node -v
```

### Verify npm version

```bash
npm -v
```

### Clean node modules and reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### Check the generated route tree

```bash
npm run build
```

---

## 9. Recommended workflow

1. `npm install`
2. `npm run dev`
3. Edit code and refresh browser
4. `npm run lint`
5. `npm run format`
6. `npm run build`
7. `npx wrangler publish` (production deploy)

---

## 10. Notes

- Use `npm run dev` for active feature work.
- Use `npm run build` before deployment to confirm production readiness.
- Use `npm run format` before code reviews.
- Use `npm run lint` to catch issues early.
