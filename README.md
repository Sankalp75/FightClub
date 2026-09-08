# HUSTLE CLUB

*You are not your job. You are not your fucking khakis.*

This is not a website. This is a reminder. I built this place for the ones who stopped hitting snooze and started hitting something real.

If you're here to admire the design — you're missing the point. If you're here because you're tired of being told to sit down, smile, and consume — welcome home.

---

### The First Rule

You don't talk about it. You **live** it. This site isn't responsive. It wasn't made to be thumbed on a couch. If you open it on your phone you'll see Bateman on a brick phone — blurred — saying:

> **Instead use your laptop, Noob!**

That's not a bug. That's a filter. Weak screens get no entry.

### The Second Rule

You **DO NOT** talk about it.

### What This Is

A single-page descent into the club:

- **FightClub Landing** (`index.html` / `fightclub_landing.html`) — split face, left is Narrator / right is Tyler. Move your mouse. Pick a side. Click and answer: *are you strong enough?*
- **Strong People** (`strong_people.html`) — Vision → Projects → Members → Join. Four blurred altars, white on black, blood-fill on hover. One button bleeds from where your cursor enters. White → Red. Slow. Like it should.
- **Weak People** (`weak_people.html`) — `Sorry, This World is not for you princess.` That's it.
- **Members** / **Projects** / **Vision** / **Join** — individual pages. No hierarchy. No leaders. Just proof.

### How To Open It (Without Embarrassing Yourself)

```bash
git clone git@github.com:Sankalp75/FightClub.git
cd FightClub
# just open it — no build step, no framework, no npm worship
open index.html
# or: python3 -m http.server 8000
```

> **Use a laptop.** Desktop. Anything with a real screen and a real mouse. This was lit for 1920×1080, not for your thumb.

### Structure

```
.
├── index.html              → landing (rename fightclub_landing.html → index.html for Pages)
├── strong_people.html      → Vision / Projects / Members / Join
├── weak_people.html        → exit for the soft
├── members.html / projects.html / vision.html / join.html
├── images/                 → all images (Final.png, princes.png, gurl.jpg, members.jpg, projects.jpg, join.png, instead.jpg)
├── FightThis.ttf           → the only font that matters
└── README.md               → this warning
```

Images are `images/` — 1920×1080, cover, blurred `10px`. Don't give me 4K PNGs. Export JPEG q80, <400KB. This is a fight, not a gallery.

### Hosting It Globally (So Others Can Find You)

```bash
git add .
git commit -m "wake up"
git pull --rebase origin main
git push origin main
```

GitHub → **Settings → Pages** → Source: `main` / `/(root)` → Save.  
Live at `https://sankalp75.github.io/FightClub/`

Custom domain? Buy it, point DNS:
```
A @ 185.199.108.153 / .109 / .110 / .111
CNAME www → sankalp75.github.io.
```
Then set it in **Settings → Pages → Custom domain** → Enforce HTTPS.

### The Buttons

All *Back* and banner buttons bleed. White box, black text — hover and the red spills from your cursor. `transform: scale()` not `clip-path`, `1.35s → 2.70s`, `rAF` throttled. Smooth. Optimized. Like blood should be.

### Join

`join.html` → **Alter Ego** (`Tyler Durden`), **Contact** (`tyler.durden@soap.com`), **State Your Dialogue** (`I don't want to die without any scars.`) — single-line, same size as mail. Send and we’ll find you. Maybe.

---

*You met me at a very strange time in my life.*

— **Tyler**

> Self-improvement is masturbation. Self-destruction is the answer.
