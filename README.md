# elisha-portfolio

Static site. No build step: plain HTML, CSS and a little JS.

## Run locally

    cd elisha-portfolio
    python3 -m http.server 8080

Open http://localhost:8080

## Deploy to Cloudflare Pages

Option A: drag and drop
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets.
2. Upload this folder. Done.

Option B: from GitHub
1. Push this folder to a GitHub repo.
2. Cloudflare → Pages → Connect to Git → pick the repo.
3. Framework preset: None. Build command: (leave empty). Output directory: `/`.

## Updating

- Text lives in `index.html`.
- Resume: replace `resume.pdf`.
- Photo: replace `assets/photo.jpg`.
- Colors: the variables at the top of `styles.css` (light and dark).
