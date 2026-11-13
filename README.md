# Nufy Movies (Next.js 14 + Tailwind + MongoDB)

Watch free full-length films, download them, and see trailers for everything else, with a catalogue filtered by the viewer's age. The product strategy is at the bottom of this file.

## Run it
```bash
cp .env.example .env.local     # fill in the 5 values below
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # production
```

| Variable | Where to get it (all free) |
|---|---|
| `MONGO_URI` | MongoDB Atlas free M0 cluster |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `TMDB_API_TOKEN` | themoviedb.org → Settings → API → *API Read Access Token* |
| `ADMIN_LOGIN` | any username/email you choose for yourself |
| `ADMIN_PASSWORD` | a long password |

## Free APIs used (no paid subscription anywhere)
| API | Used for | Cost |
|---|---|---|
| **TMDB** | metadata, posters, trailers (YouTube), age certifications, "where to watch" | Free (non-commercial; show their attribution, already in the footer. Ask TMDB about a commercial licence before monetising) |
| **Internet Archive** (`advancedsearch` + `metadata`) | full-length public-domain films to stream **and** download | Free, no key |
| **YouTube embeds** | trailers | Free |

**Why no "stream any new movie" source:** sites that serve current blockbusters for free are pirate streams. Embedding them would expose you to takedowns and legal liability, so Nufy only streams films that are genuinely free to distribute and shows the trailer for the rest.

## How things work
**Watch flow (`/movies/[id]`):** released + a verified free copy exists → full player + download · released, none found → trailer + "where to watch in your country" · not released → trailer + countdown + *Remind me* · no trailer → clear empty state.

**Age filtering (`src/lib/age.js`, one file to tweak):**
| Age | Max rating | Extra rules |
|---|---|---|
| 5–6 | G | Animation / Family only |
| 7–12 | PG | no Horror, Thriller, Crime, War |
| 13–15 | PG-13 | no Horror |
| 16–17 | PG-13 | |
| 18+ | everything | |

Enforced at the TMDB query (`certification.lte`, `with_genres`, `without_genres`), re-checked per film for search/recommendations/free library, and again on the movie page, so a pasted link can't bypass it. TMDB's `adult` flag is blocked for everyone. Unrated *modern* films are hidden from minors; unreleased titles and pre-1968 classics pass if the genre rules do.

**Admin:** sign in on the normal `/signin` form with `ADMIN_LOGIN` + `ADMIN_PASSWORD`; you land on `/admin`. No admin record exists in the database, the password is compared in constant time, sessions last 12h, and everyone else gets a plain 404 on `/admin` and `/api/admin`. Controls: overview analytics · users (search, suspend, edit age, reset password, delete) · content (hide, feature, minimum age, pin a specific free stream, with Archive search) · reviews moderation · reports queue · settings (pause sign-ups, free library, downloads, maintenance mode, site banner).

## Project map
```
src/middleware.js           route protection + admin lock
src/lib/age.js              age policy         src/lib/tmdb.js     TMDB client
src/lib/archive.js          free films         src/lib/catalog.js  filtering/overrides
src/lib/home.js             personalised rows  src/lib/models.js   Mongo models
src/components/WatchPanel   player/download/trailer/availability
src/app/{browse,free,search,coming-soon,my-list,account,movies/[id],admin/*}
```

## Things to know
- Existing users (email + password only) keep working: they're asked to add a username and age on `/account`, and until then see the safe "Kids" catalogue.
- Age is locked after signup (so a child can't edit it); admins can change it.
- Downloads open the Archive file in a new tab. Browsers ignore the `download` attribute across domains, so the browser may play it first; *Save as* does the rest.
- The rate limiter is in-memory (fine for one server). Use Upstash Redis (free tier) if you scale to many instances.
- Collecting age from under-13s can carry parental-consent obligations in some countries (COPPA, GDPR, NDPR). Worth a legal check before launch.

## Product strategy

**Core purpose:** a Netflix/YouTube-style place to *watch and download* movies, built on free APIs only.

**The honest constraint that shapes everything:** recent blockbusters are not legally free. So the product has two lanes, and the strategy is to make both feel like one service.

| Lane | Source | What the user gets |
|---|---|---|
| Free lane | Internet Archive public-domain films | Full film, streaming + download |
| Discovery lane | TMDB | Every other film: details, trailer, "where to watch" in the user's country, reminders |

The trailer fallback you asked for is the bridge: nobody hits a dead end.

## Features and the reason each exists

| # | Feature | Why (business goal) | Built |
|---|---|---|---|
| 1 | **Age-matched catalogue** (5 tiers, certification + genre rules, admin overrides) | Trust. Parents let kids use it; adults aren't shown kids' content | ✅ |
| 2 | **Free library** (stream + download, resume) | The differentiator: real "watch and download" at zero licensing cost | ✅ |
| 3 | **Data-saver downloads** (smallest file labelled first) | Nigerian/African mobile users are data-constrained; this is a reason to choose Nufy over YouTube | ✅ |
| 4 | **Continue watching** (progress saved every 20s) | Retention: gives a reason to come back tomorrow | ✅ |
| 5 | **My list + Remind me** for unreleased films | Retention and a return trigger. A released reminder shows a badge in the nav | ✅ |
| 6 | **"Picked for you"** from watch/save history | Engagement without a recommender service (top genres, age-safe) | ✅ |
| 7 | **"Made in {your country}"** shelf (e.g. Nollywood for NG) | Local relevance, the strongest hook for the first market | ✅ |
| 8 | **Coming soon** page with trailers | Keeps the catalogue feeling alive even when the free lane is small | ✅ |
| 9 | **Where to watch** by country (TMDB/JustWatch) | Turns "not free" from a dead end into a useful answer | ✅ |
| 10 | **Member reviews and ratings** | Community + social proof, moderated from admin | ✅ |
| 11 | **Share** (native share sheet / copy link) | Free growth loop; WhatsApp is the main channel | ✅ |
| 12 | **Report a problem** (broken link, wrong age, copyright) | Quality + legal safety valve; feeds the admin queue | ✅ |
| 13 | **Admin analytics** (top played/downloaded, age + country mix) | Know what to feature, and what audience to pitch advertisers later | ✅ |
| 14 | **Announcement banner + feature toggles** | Operate the product without redeploying | ✅ |

## Suggested next steps (not built)
1. **Web-push or email alerts** for released reminders (needs a free sender such as Resend's free tier).
2. **Parent PIN / profiles** so one household account can hold kid and adult profiles.
3. **Offline PWA**: installable app with downloaded films, the closest thing to the Netflix "download" experience.
4. **Creator uploads** (African independent films, with consent and an admin approval queue) to grow the free lane beyond public domain. This is the single biggest lever for the catalogue.
5. **Monetisation** once there's traffic: non-intrusive sponsor banners or a "support Nufy" tier. Avoid pre-roll ads early.
