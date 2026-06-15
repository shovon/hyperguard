#!/usr/bin/env node
"use strict";

/*
 * Regenerates the API reference and table of contents inside README.md, in place.
 *
 * Source of truth:
 *   - API section: the TSDoc/JSDoc in lib.ts, rendered to Markdown by TypeDoc
 *     (configured in typedoc.json) via typedoc-plugin-markdown.
 *   - Table of contents: the headings of the final README itself.
 *
 * Both are spliced between HTML-comment markers:
 *   <!-- doc-gen API -->            ... <!-- end-doc-gen -->
 *   <!-- doc-gen TOC maxDepth=4 --> ... <!-- end-doc-gen -->
 *
 * This is a single, deterministic string rewrite — no Markdown is hand-duplicated,
 * and the splice tolerates any whitespace a formatter may inject around the
 * markers. Re-run `npm run docs:api` after editing the doc-comments.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const README = path.join(ROOT, "README.md");

// TypeDoc top-level groups. Anything else at H2 in the generated file is a
// heading authored inside a doc-comment (e.g. the `## Usage` blocks).
const GROUP_NAMES = new Set([
	"Functions",
	"Variables",
	"Type Aliases",
	"Classes",
	"Interfaces",
	"Enumerations",
	"References",
	"Namespaces",
]);

// Groups we don't mirror into the README. The error classes are public, but
// TypeDoc renders each with all inherited `Error` members (stack/message/...),
// which is far too noisy for a README. Set to `[]` to mirror everything.
const DROP_GROUPS = ["Classes"];

// ---------------------------------------------------------------------------
// API section (TypeDoc -> normalized Markdown)
// ---------------------------------------------------------------------------

/** Run TypeDoc into a throwaway dir and return the generated Markdown. */
function runTypedoc() {
	const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "hg-typedoc-"));
	try {
		const bin = path.join(ROOT, "node_modules", ".bin", "typedoc");
		execFileSync(bin, ["--out", outDir], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
		return fs.readFileSync(path.join(outDir, "README.md"), "utf8");
	} finally {
		fs.rmSync(outDir, { recursive: true, force: true });
	}
}

/**
 * Re-level headings so the section nests cleanly under the README's `## API`:
 *   group ("## Functions")            -> ###
 *   member ("### either()")           -> ####
 *   member parts ("#### Parameters")  -> #####
 *   param names ("##### alts")        -> ######
 *   doc-comment headings ("## Usage") -> ##### (a subsection of its member)
 */
function relevelHeadings(md) {
	return md
		.split("\n")
		.map((line) => {
			const m = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
			if (!m) return line;
			const level = m[1].length;
			const text = m[2];
			if (level === 1) return null; // drop the "# hyperguard" project title
			const next = level === 2 ? (GROUP_NAMES.has(text) ? 3 : 5) : Math.min(level + 1, 6);
			return `${"#".repeat(next)} ${text}`;
		})
		.filter((line) => line !== null)
		.join("\n");
}

/** Remove whole `### <group>` sections listed in DROP_GROUPS. */
function dropGroups(md, groups) {
	const drop = new Set(groups);
	let skipping = false;
	return md
		.split("\n")
		.filter((line) => {
			const m = /^###\s+(.+?)\s*$/.exec(line);
			if (m) skipping = drop.has(m[1].trim());
			return !skipping;
		})
		.join("\n");
}

function buildApiMarkdown() {
	let md = runTypedoc();
	md = relevelHeadings(md);
	md = dropGroups(md, DROP_GROUPS);
	return md.replace(/\n{3,}/g, "\n\n").trim();
}

// ---------------------------------------------------------------------------
// Table of contents (headings -> nested list with GitHub-compatible anchors)
// ---------------------------------------------------------------------------

/** GitHub-flavoured heading slug. */
function slug(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\- ]/g, "")
		.trim()
		.replace(/ +/g, "-");
}

/**
 * Build a nested TOC from headings of level 2..maxDepth (the H1 title is
 * excluded). Anchor de-duplication counts *every* heading in document order so
 * the `-1`, `-2` suffixes match GitHub exactly, even for headings outside the
 * TOC's depth. Headings inside fenced code blocks are ignored.
 */
function buildToc(md, { maxDepth, exclude = [] }) {
	const excluded = new Set(exclude.map((s) => s.toLowerCase()));
	const seen = Object.create(null);
	const items = [];
	let inFence = false;
	for (const line of md.split("\n")) {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
		if (!m) continue;
		const level = m[1].length;
		const text = m[2];
		let anchor = slug(text);
		if (seen[anchor] === undefined) seen[anchor] = 0;
		else anchor = `${anchor}-${++seen[anchor]}`;
		if (level >= 2 && level <= maxDepth && !excluded.has(text.toLowerCase())) {
			items.push(`${"  ".repeat(level - 2)}- [${text}](#${anchor})`);
		}
	}
	return items.join("\n");
}

// ---------------------------------------------------------------------------
// Marker splice
// ---------------------------------------------------------------------------

/**
 * Replace everything between an opening marker and the next `<!-- end-doc-gen -->`
 * with `content`, normalizing the surrounding whitespace. `openSource` is a
 * RegExp source string that matches the opening marker (its exact text is
 * preserved). A replacer function is used so `$` sequences in `content` are
 * never interpreted.
 */
function spliceBlock(md, openSource, label, content) {
	const re = new RegExp(`${openSource}[\\s\\S]*?<!-- end-doc-gen -->`);
	if (!re.test(md)) throw new Error(`Marker block not found: ${label}`);
	return md.replace(re, (whole) => {
		const open = whole.match(new RegExp(openSource))[0];
		return `${open}\n\n${content}\n\n<!-- end-doc-gen -->`;
	});
}

function main() {
	const before = fs.readFileSync(README, "utf8");

	// 1. Splice the API reference first, so its headings exist for the TOC.
	let md = spliceBlock(before, "<!-- doc-gen API -->", "API", buildApiMarkdown());

	// 2. Build the TOC from the now-final document and splice it in.
	const tocOpen = md.match(/<!-- doc-gen TOC[^>]*-->/);
	if (!tocOpen) throw new Error("Marker block not found: TOC");
	const maxDepth = Number((tocOpen[0].match(/maxDepth=(\d+)/) || [])[1] || 4);
	const toc = buildToc(md, { maxDepth, exclude: ["Table of Contents"] });
	md = spliceBlock(md, "<!-- doc-gen TOC[^>]*-->", "TOC", toc);

	if (md !== before) fs.writeFileSync(README, md);
	console.log(md === before ? "README.md already up to date." : "README.md regenerated (API + TOC).");
}

main();
