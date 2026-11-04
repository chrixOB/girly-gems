# Girly Gems

A playful jewelry storefront built with Next.js, TypeScript, Tailwind CSS, and lucide-react.

## Run locally

From this folder in Windows Command Prompt:

```bat
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Available scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.

## Admin test login

- Username: `admin`
- Password: `GirlyGems123!`

The credentials can be changed in production with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables. Set `ADMIN_SESSION_SECRET` to a strong random value as well.

## Admin API

- `POST /api/auth/login` creates an admin session.
- `POST /api/auth/logout` ends the admin session.
- `GET /api/items` lists items.
- `POST /api/items` adds an item.
- `PUT /api/items/:id` updates item fields or prices.
- `DELETE /api/items/:id` removes an item.

Item records currently use in-memory storage and reset when the server restarts.
