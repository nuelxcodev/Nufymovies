# MyMovieBox (Next.js + Tailwind)

The old `nufy-client` (Vite/React) and `nufy_server` (Express) are merged into one Next.js 14 App Router project.

## Run
```bash
cp .env.example .env.local   # fill in TMDB_API_TOKEN, MONGO_URI, JWT_SECRET
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Where things went
| Before | Now |
|---|---|
| `nufy-client/src/pages/Home.jsx` | `src/app/page.jsx` (server component, `?page=` and `?genre=`) |
| `nufy-client/src/pages/movies.jsx` (`/movies?movies=ID`) | `src/app/movies/[id]/page.jsx` |
| `nufy-client/src/pages/Signup.jsx` | `src/app/signup/page.jsx` + new `src/app/signin/page.jsx` |
| `component/*` | `src/components/*` |
| `POST /api/v1/movies` | `src/app/api/movies/route.js` |
| `POST /api/v1/watchtriller` | `src/app/api/trailer/route.js` |
| `POST /api/v1/signup`, `/signin` | `src/app/api/auth/{signup,signin,signout}/route.js` |
| `utils/movie_datas_api.js` + `dataobjects.js` | `src/lib/tmdb.js` |
| mongoose user schema | `src/lib/models/User.js`, connection in `src/lib/db.js` |
| `startApp.js`, CORS, Vite proxy, `VITE_API_URL` | removed (one server, same origin) |
