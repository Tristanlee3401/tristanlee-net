#!/usr/bin/env node
// suggest_links.js - Diary entry linking via DeepSeek API
// Run: node suggest_links.js
// Force reprocess: node suggest_links.js --force 2026-06-21
// Requires: DEEPSEEK_API_KEY environment variable

const fs = require("fs");
const path = require("path");

const DIARY_DIR = path.join(__dirname, "src/diary");
const OUTPUT = path.join(__dirname, "src/_data/diaryLinks.json");
const MAX_RETRIES = 3;
const ONE_DAY_MS = 86400000;
const MODEL = "deepseek-chat";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
	console.error("Error: DEEPSEEK_API_KEY environment variable not set");
	console.error("Export it first: export DEEPSEEK_API_KEY=your_key_here");
	process.exit(1);
}

// Parse CLI
const forceIdx = process.argv.indexOf("--force");
const forceDate = forceIdx !== -1 ? process.argv[forceIdx + 1] : null;

if (forceIdx !== -1 && !forceDate) {
	console.error("--force requires a date: node suggest_links.js --force 2026-06-21");
	process.exit(1);
}

// ── Read entries ───────────────────────────────────────────────────────────────

function readEntries() {
	if (!fs.existsSync(DIARY_DIR)) {
		console.error(`Diary directory not found: ${DIARY_DIR}`);
		process.exit(1);
	}

	return fs
		.readdirSync(DIARY_DIR)
		.filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
		.sort()
		.map((f) => {
			const date = f.replace(".md", "");
			const raw = fs.readFileSync(path.join(DIARY_DIR, f), "utf8");
			const body = raw.replace(/\r\n/g, "\n").replace(/^---[\s\S]*?---\n?/, "").trim();

			if (!body) {
				console.log(`  SKIP ${date} (empty)`);
				return null;
			}

			return { date, body };
		})
		.filter(Boolean);
}

// ── Persistence ───────────────────────────────────────────────────────────────

function loadExisting() {
	if (!fs.existsSync(OUTPUT)) return {};
	try {
		return JSON.parse(fs.readFileSync(OUTPUT, "utf8"));
	} catch {
		console.warn("WARN: diaryLinks.json corrupted, restarting");
		return {};
	}
}

function save(data) {
	fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
	fs.writeFileSync(OUTPUT + ".tmp", JSON.stringify(data, null, 2));
	fs.renameSync(OUTPUT + ".tmp", OUTPUT);
}

// ── Shuffle ────────────────────────────────────────────────────────────────────

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ── DeepSeek API ───────────────────────────────────────────────────────────────

async function askDeepSeek(current, others) {
	const entriesList = others
		.map((e) => `${e.date}:\n${e.body}`)
		.join("\n\n---\n\n");

	const prompt = `You are analyzing diary entries to find thematic connections.

CURRENT ENTRY (${current.date}):
${current.body}

AVAILABLE ENTRIES TO LINK TO:
${entriesList}

Your task:
- Pick the 2 entries most thematically related to the current entry
- Pick 1 entry that provides an interesting contrast/difference

Constraints:
- All picks must be from the available entries above
- Return valid JSON only, no markdown, no explanation

Return:
{"related": ["YYYY-MM-DD", "YYYY-MM-DD"], "unrelated": "YYYY-MM-DD"}`;

	const res = await fetch(DEEPSEEK_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [{ role: "user", content: prompt }],
			max_tokens: 100,
			temperature: 0.3,
		}),
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => "");
		throw new Error(`HTTP ${res.status}: ${errText.slice(0, 120)}`);
	}

	const data = await res.json();
	const content = data.choices?.[0]?.message?.content;
	if (!content) throw new Error("Empty response from DeepSeek");

	// Extract JSON (handle any surrounding text/markdown)
	const match = content.match(/\{[\s\S]*\}/);
	if (!match) throw new Error(`No JSON in: ${content.slice(0, 80)}`);

	return JSON.parse(match[0]);
}

function getAdjacentDates(dateStr) {
	const d = new Date(dateStr);
	const prev = new Date(d.getTime() - ONE_DAY_MS).toISOString().split("T")[0];
	const next = new Date(d.getTime() + ONE_DAY_MS).toISOString().split("T")[0];
	return [prev, next];
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(picks, current, others) {
	if (!picks.related || !Array.isArray(picks.related) || picks.related.length !== 2) {
		throw new Error(`related must be array of 2 dates, got: ${JSON.stringify(picks.related)}`);
	}

	if (typeof picks.unrelated !== "string") {
		throw new Error(`unrelated must be string, got: ${typeof picks.unrelated}`);
	}

	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	for (const d of picks.related) {
		if (!dateRegex.test(d)) throw new Error(`Invalid related date: ${d}`);
	}
	if (!dateRegex.test(picks.unrelated)) {
		throw new Error(`Invalid unrelated date: ${picks.unrelated}`);
	}

	const otherDates = new Set(others.map((e) => e.date));
	const allPicks = [...picks.related, picks.unrelated];

	// All picks must be in the filtered candidate list
	for (const d of allPicks) {
		if (!otherDates.has(d)) {
			throw new Error(`Pick not in available entries: ${d}`);
		}
	}

	// No duplicates
	if (new Set(allPicks).size !== 3) {
		throw new Error(`Duplicate picks: ${JSON.stringify(allPicks)}`);
	}
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
	console.log("Reading entries...");
	const entries = readEntries();

	if (entries.length < 3) {
		console.error(`Need 3+ entries, found ${entries.length}`);
		process.exit(1);
	}

	const validDates = new Set(entries.map((e) => e.date));
	if (forceDate && !validDates.has(forceDate)) {
		console.error(`--force date ${forceDate} not found`);
		process.exit(1);
	}

	console.log(`Found ${entries.length} entries\n`);

	const result = { ...loadExisting() };
	let processed = 0;
	let failed = 0;

	for (const entry of entries) {
		const isForced = forceDate === entry.date;

		if (result[entry.date] && !isForced) {
			continue;
		}

		const adjacent = new Set(getAdjacentDates(entry.date));
		const others = entries.filter((e) => e.date !== entry.date && !adjacent.has(e.date));
		const shuffledOthers = shuffle([...others]); // Shuffle before creating prompt
		const entriesList = shuffledOthers
			.map((e) => `${e.date}:\n${e.body}`)
			.join("\n\n---\n\n");

		let success = false;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				const label = isForced ? " [force]" : attempt > 1 ? ` [attempt ${attempt}]` : "";
				process.stdout.write(`${entry.date}${label}... `);

				const picks = await askDeepSeek(entry, others);
				validate(picks, entry, others);

				result[entry.date] = picks;
				console.log(`✓ ${picks.related.join(", ")} | ${picks.unrelated}`);
				save(result);
				processed++;
				success = true;
				break;
			} catch (err) {
				if (attempt === MAX_RETRIES) {
					console.log(`✗ ${err.message}`);
					failed++;
				} else {
					process.stdout.write("retry... ");
				}
			}
		}
	}

	console.log(`\n✓ ${processed} processed, ${failed} failed → ${OUTPUT}`);
}

main().catch((err) => {
	console.error("FATAL:", err.message);
	process.exit(1);
});
