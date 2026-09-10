const EDGE_CASE_PATTERNS = {
  nullInvalidInput: {
    name: "Null/Invalid Input Handling",
    patterns: [
      /\bif\s*\([^)]*\bnull\b[^)]*\)/i,
      /\bObjects\.requireNonNull\s*\(/i,
      /\bObjects\.isNull\s*\(/i,
      /\bObjects\.nonNull\s*\(/i,
      /\bvalidate[A-Za-z0-9_]*\s*\(/i,
      /\bisValid[A-Za-z0-9_]*\s*\(/i,
      /\bthrow\s+new\s+(?:IllegalArgumentException|NullPointerException)\s*\(/i,
    ],
  },

  emptyState: {
    name: "Empty/Uninitialized State",
    patterns: [
      /\.isEmpty\s*\(\s*\)/i,
      /\.isBlank\s*\(\s*\)/i,
      /\.size\s*\(\s*\)\s*==\s*0/i,
      /\.length\s*==\s*0/i,
      /\.length\s*<=\s*0/i,
      /\bCollections\.empty[A-Za-z0-9_]*\s*\(/i,
      /\bnew\s+(?:ArrayList|HashMap|HashSet|LinkedList|ArrayDeque)\s*<[^>]*>\s*\(\s*\)/i,
    ],
  },

  boundaryConditions: {
    name: "Boundary Condition Handling",
    patterns: [
      /\b(?:min|max|minimum|maximum|lower|upper|limit|capacity)\b/i,
      /(?:<=|>=|<|>)\s*0\b/,
      /\b(?:Integer|Long|Double|Float)\.(?:MIN_VALUE|MAX_VALUE)\b/,
      /\bMath\.(?:min|max)\s*\(/i,
      /\b(?:first|last|head|tail)\b/i,
    ],
  },

  duplicateHandling: {
    name: "Duplicate Prevention/Detection",
    patterns: [
      /\.contains\s*\(/i,
      /\.containsKey\s*\(/i,
      /\.containsValue\s*\(/i,
      /\bSet\s*</i,
      /\bHashSet\s*</i,
      /\bduplicate\b/i,
      /\balreadyExists\b/i,
      /\bexists\b/i,
    ],
  },

  notFoundHandling: {
    name: "Not Found / Item Not Exist",
    patterns: [
      /\bnotFound\b/i,
      /\bnot_found\b/i,
      /\bNOT_FOUND\b/i,
      /\bNoSuch[A-Za-z0-9_]*Exception\b/i,
      /\.orElse\s*\(/i,
      /\.orElseThrow\s*\(/i,
      /\b==\s*null\b/i,
      /\bindex\s*==\s*-1\b/i,
    ],
  },

  resourceExhaustion: {
    name: "Resource Exhaustion",
    patterns: [
      /\bcapacity\b/i,
      /\bmax(?:imum)?\b/i,
      /\blimit\b/i,
      /\bfull\b/i,
      /\bavailable\b/i,
      /\bremaining\b/i,
      /\bsize\s*\(\s*\)\s*(?:>=|>)\s*[A-Za-z0-9_]+/i,
    ],
  },

  stateValidation: {
    name: "State Validation / Invalid Transitions",
    patterns: [
      /\benum\s+[A-Za-z0-9_]+\s*\{/i,
      /\bstate\b/i,
      /\bcurrentState\b/i,
      /\bstatus\b/i,
      /\btransition\b/i,
      /\bswitch\s*\([^)]*(?:state|status)/i,
      /\bif\s*\([^)]*(?:state|status)[^)]*\)/i,
    ],
  },

  resourceCleanup: {
    name: "Resource Cleanup",
    patterns: [
      /\bfinally\s*\{/i,
      /\.close\s*\(\s*\)/i,
      /\.shutdown\s*\(\s*\)/i,
      /\.dispose\s*\(\s*\)/i,
      /\.release\s*\(\s*\)/i,
      /\.clear\s*\(\s*\)/i,
      /\btry\s*\{[\s\S]*?\}\s*finally\s*\{/i,
    ],
  },

  concurrentAccess: {
    name: "Concurrent Access Awareness",
    optional: true,
    patterns: [
      /\bsynchronized\b/i,
      /\bReentrantLock\b/i,
      /\.lock\s*\(\s*\)/i,
      /\.unlock\s*\(\s*\)/i,
      /\bAtomic(?:Integer|Long|Boolean|Reference)\b/i,
      /\bConcurrentHashMap\b/i,
      /\bvolatile\b/i,
    ],
  },

  errorRecovery: {
    name: "Error Recovery / Fault Tolerance",
    patterns: [
      /\btry\s*\{/i,
      /\bcatch\s*\(/i,
      /\bfinally\s*\{/i,
      /\bretry\b/i,
      /\brecover\b/i,
      /\bIOException\b/i,
      /\bException\b/i,
      /\bRuntimeException\b/i,
    ],
  },
};

const EDGE_CASE_KEYS = Object.keys(EDGE_CASE_PATTERNS);

const detectEdgeCases = (code, options = {}) => {
  const {
    concurrencyRequired = false,
  } = options;

  const normalizedCode = code || "";

  const detected = [];
  const notDetected = [];
  const evidence = {};

  for (const key of EDGE_CASE_KEYS) {
    const edgeCase = EDGE_CASE_PATTERNS[key];

    // Skip concurrency unless the problem requires it
    if (edgeCase.optional && !concurrencyRequired) {
      continue;
    }

    const matchedPatterns = edgeCase.patterns.filter((pattern) =>
      pattern.test(normalizedCode)
    );

    if (matchedPatterns.length > 0) {
      detected.push(edgeCase.name);

      evidence[key] = {
        detected: true,
        matchedPatternCount: matchedPatterns.length,
      };
    } else {
      notDetected.push(edgeCase.name);

      evidence[key] = {
        detected: false,
        matchedPatternCount: 0,
      };
    }
  }

  const totalChecks = detected.length + notDetected.length;

  const score = detected.length;

  const coverage =
    totalChecks === 0
      ? 0
      : Math.round((score / totalChecks) * 100);

  let status;

  if (coverage >= 70) {
    status = "PASS";
  } else {
    status = "WARNING";
  }

  return {
    score,
    total: totalChecks,
    coverage,
    status,
    detected,
    notDetected,
    evidence,
  };
};

export default detectEdgeCases;