# tristanlee.net
Personal static website built with Eleventy, Tailwind CSS.

## Clone
```bash
git clone https://github.com/Tristanlee3401/tristanlee-net.git
cd tristanlee-net
npm install
```

## Develop
Starts Tailwind and Eleventy in watch mode concurrently:
```bash
npm start
```
Visit `http://localhost:8080`

## Build
Builds Tailwind CSS then generates the static site into `_site/`:
```bash
npm run build
```

## Deploy
Push to `main` — GitHub Actions builds and deploys automatically:
```bash
git add -A && git commit -m "message" && git push origin main
```

## Diary workflow
1. Creates `src/diary/YYYY-MM-DD.md` with front matter
2. Edit entry content
3. Generates related/unrelated links via `suggest_links_deepseek.js`
4. Build and push to `main`

## Files
- `src/` - Source templates (Liquid + Markdown)
- `src/diary/` - Diary entries (Markdown)
- `src/assets/css/tailwind-input.css` - Tailwind source
- `src/assets/css/styles.css` - Generated CSS (do not edit directly)
- `_site/` - Built static site (generated, gitignored)
- `.eleventy.js` - Eleventy config
- `suggest_links_deepseek.js` - Generates related/unrelated diary links via DeepSeek API
- `src/_data/diaryLinks.json` - Related and unrelated links per diary entry

## License
ISC
