# Aerial Surveying — aerialsurveying.ie

Marketing website for a drone aerial-surveying business serving roofing contractors,
solar installers, HVAC/maintenance engineers, architects and facade/power-washing crews
across Ireland.

Static HTML/CSS/JS — no build step, no dependencies.

## Pages
- `index.html` — Home
- `about.html` — About
- `services.html` — Services
- `gallery.html` — Gallery
- `contact.html` — Contact
- `booking.html` — Book a survey

## Structure
```
.
├── *.html            # pages
├── css/styles.css    # all styling
├── js/main.js        # nav, FAQ, form handling, scroll reveal
└── assets/           # logo.svg, favicon.svg (add real photos here)
```

## Run locally
Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```

## Deploy (Netlify)
- **Drag & drop:** drag this folder onto https://app.netlify.com/drop
- **Git:** connect this repo in Netlify → it auto-deploys on every push.
  Publish directory is `.` (set in `netlify.toml`).

## To do before launch
- Replace gallery placeholder tiles with real drone photos (`assets/`).
- Wire up the booking + contact forms (currently front-end only — add
  Netlify Forms or a form handler so submissions are actually delivered).
- Point the custom domain `aerialsurveying.ie` at Netlify and enable HTTPS.
```

## Contact details used on site
- Phone / WhatsApp: 089 481 3390 (+353 89 481 3390)
- Email: hello@aerialsurveying.ie
