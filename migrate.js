const fs = require("fs");
const path = require("path");

const dataDir = "./src/_data";
const outDir = "./src/diary";

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(dataDir)
  .filter(f => /^diary-\d{4}\.json$/.test(f));

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  for (const year of data) {
    for (const entry of year.entries) {
      const body = entry.text.join("\n\n");
      const content = `---\ndate: ${entry.date}\ntags: diary\n---\n${body}\n`;
      const outPath = path.join(outDir, `${entry.date}.md`);
      fs.writeFileSync(outPath, content);
      console.log(`wrote ${outPath}`);
    }
  }
}
