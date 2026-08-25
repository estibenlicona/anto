/**
 * Dependency vulnerability gate.
 *
 * Runs `pnpm audit` at two thresholds, because where a dependency ends up
 * matters more than its severity alone:
 *
 *   - runtime (`--prod`): code that executes on someone else's machine or in
 *     their browser. Anything from `moderate` up stops the build.
 *   - full: everything, including the build chain, where a vulnerability has to
 *     be serious to justify halting work. `high` and above stop the build.
 *
 * A known vulnerability that cannot be fixed yet is carried in
 * `security-exceptions.json` — never by lowering a threshold, which would also
 * hide everything nobody has looked at. Every exception names the advisory, why
 * it is accepted, who accepted it, and when it must be revisited; past that
 * date it stops the build again on its own.
 *
 * Run with: pnpm run security:audit
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXCEPTIONS_PATH = join(repoRoot, "security-exceptions.json");

const SEVERITY_ORDER = ["info", "low", "moderate", "high", "critical"] as const;
type Severity = (typeof SEVERITY_ORDER)[number];

function atLeast(severity: string, threshold: Severity): boolean {
  const index = SEVERITY_ORDER.indexOf(severity as Severity);
  return index >= 0 && index >= SEVERITY_ORDER.indexOf(threshold);
}

interface Tier {
  label: string;
  reach: string;
  command: string;
  threshold: Severity;
}

const TIERS: Tier[] = [
  {
    label: "runtime",
    reach: "runs on someone else's machine or browser",
    command: "pnpm audit --prod --json",
    threshold: "moderate",
  },
  {
    label: "full",
    reach: "everything, including the build chain",
    command: "pnpm audit --json",
    threshold: "high",
  },
];

interface Advisory {
  github_advisory_id: string;
  severity: string;
  module_name: string;
  patched_versions: string;
  title: string;
}

interface Exception {
  advisory: string;
  package: string;
  reason: string;
  owner: string;
  reviewBy: string;
}

const REQUIRED_FIELDS: Array<keyof Exception> = [
  "advisory",
  "package",
  "reason",
  "owner",
  "reviewBy",
];

/** `YYYY-MM-DD` for today, so comparison is by calendar day and not by clock. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readExceptions(): Exception[] {
  if (!existsSync(EXCEPTIONS_PATH)) {
    console.log("No security-exceptions.json — nothing is being accepted.\n");
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(EXCEPTIONS_PATH, "utf8"));
  } catch (cause) {
    fail(`security-exceptions.json is not valid JSON: ${(cause as Error).message}`);
  }

  const list = (parsed as { exceptions?: unknown }).exceptions;
  if (!Array.isArray(list)) {
    fail('security-exceptions.json must contain an "exceptions" array.');
  }

  const problems: string[] = [];
  const exceptions: Exception[] = [];

  list.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      problems.push(`exception #${index + 1} is not an object`);
      return;
    }
    const record = entry as Record<string, unknown>;
    const missing = REQUIRED_FIELDS.filter(
      (field) => typeof record[field] !== "string" || (record[field] as string).trim() === "",
    );
    if (missing.length > 0) {
      // An exception without these cannot be revisited later, so it is not an
      // exception — it is an untracked decision.
      problems.push(
        `exception #${index + 1} (${String(record.advisory ?? "no advisory")}) is missing: ${missing.join(", ")}`,
      );
      return;
    }
    const exception = record as unknown as Exception;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.reviewBy)) {
      problems.push(`exception ${exception.advisory}: reviewBy must be YYYY-MM-DD`);
      return;
    }
    exceptions.push(exception);
  });

  if (problems.length > 0) {
    console.error("Invalid entries in security-exceptions.json:");
    for (const problem of problems) console.error(`  - ${problem}`);
    fail("Every exception needs an advisory, a package, a reason, an owner and a reviewBy date.");
  }

  return exceptions;
}

function fail(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}

/**
 * Run as one literal command rather than a program plus an argument array.
 *
 * On Windows `pnpm` is a `.cmd`, which Node refuses to spawn without a shell,
 * and passing an argument array *with* a shell raises DEP0190 — the shell
 * concatenates argv instead of escaping it. A single constant command string
 * avoids both: there is no array to mis-escape and nothing here is
 * interpolated from outside this file.
 */
function runAudit(tier: Tier): Advisory[] {
  let stdout = "";
  try {
    stdout = execSync(tier.command, {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (error) {
    // A non-zero exit just means findings exist; the report is still on stdout.
    stdout = (error as { stdout?: string }).stdout ?? "";
    if (!stdout) {
      fail(`Could not run \`${tier.command}\`: ${(error as Error).message}`);
    }
  }

  let report: { advisories?: Record<string, Advisory> };
  try {
    report = JSON.parse(stdout);
  } catch {
    fail(`Could not parse the audit report for the ${tier.label} tier.`);
  }

  return Object.values(report.advisories ?? {});
}

// --- Run -------------------------------------------------------------------

const exceptions = readExceptions();
const expired = exceptions.filter((exception) => exception.reviewBy < today());
const usedAdvisories = new Set<string>();
let failed = false;

for (const tier of TIERS) {
  const advisories = runAudit(tier);
  const overThreshold = advisories.filter((advisory) => atLeast(advisory.severity, tier.threshold));
  const uncovered = overThreshold.filter((advisory) => {
    const covered = exceptions.some((exception) => exception.advisory === advisory.github_advisory_id);
    if (covered) usedAdvisories.add(advisory.github_advisory_id);
    return !covered;
  });

  console.log(`[${tier.label}] threshold ${tier.threshold} — ${tier.reach}`);
  if (overThreshold.length === 0) {
    console.log("  nothing at or above the threshold\n");
    continue;
  }

  for (const advisory of uncovered) {
    console.log(
      `  ${advisory.severity.toUpperCase()} ${advisory.module_name} — ${advisory.title}\n` +
        `    fixed in ${advisory.patched_versions} · ${advisory.github_advisory_id}`,
    );
  }
  const coveredCount = overThreshold.length - uncovered.length;
  if (coveredCount > 0) console.log(`  ${coveredCount} covered by a registered exception`);
  if (uncovered.length > 0) failed = true;
  console.log("");
}

// Always listed, passing or not: an exception nobody sees is an exception
// nobody remembers to remove.
if (exceptions.length > 0) {
  console.log("Active exceptions:");
  for (const exception of exceptions) {
    const state = exception.reviewBy < today() ? "EXPIRED" : `review by ${exception.reviewBy}`;
    const stale = usedAdvisories.has(exception.advisory) ? "" : " (no longer matches any finding — remove it)";
    console.log(`  ${exception.advisory} ${exception.package} — ${state} · ${exception.owner}${stale}`);
    console.log(`    ${exception.reason}`);
  }
  console.log("");
}

if (expired.length > 0) {
  console.error(`${expired.length} exception(s) passed their review date:`);
  for (const exception of expired) {
    console.error(`  - ${exception.advisory} (${exception.package}) was due ${exception.reviewBy}`);
  }
  fail("Resolve them or take the decision again with a new date.");
}

if (failed) {
  fail("Dependency audit failed. Fix the finding, or register an exception with a review date.");
}

console.log("Dependency audit passed.");
