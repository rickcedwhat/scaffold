import type {
  PipelineStageConfig,
  StepGraphConfig,
  OutcomeSlice,
  DatasetItem,
} from '@scaffold/ui';

export const mockPipelineStages: PipelineStageConfig[] = [
  {
    id: 'stage-1',
    name: 'Wordlist Ingest',
    description: 'Filters OpenSubtitles 50k frequency list to 5-letter candidate tokens.',
    type: 'transform',
    status: 'success',
    itemCount: 2500,
    badge: 'TRANSFORM',
    summaryMetric: '50k -> 2,500 words',
  },
  {
    id: 'stage-2',
    name: 'Jev Lexical Filter',
    description: 'Fast System One classification + decideShouldRemove() script prune.',
    type: 'jev',
    status: 'success',
    itemCount: 2410,
    badge: 'JEV+SCRIPT',
    summaryMetric: '2,410 kept • 90 pruned',
  },
  {
    id: 'stage-3',
    name: 'Gemini Lexicography',
    description: 'Generates structured definitions, parts of speech, and lemma citations.',
    type: 'llm',
    status: 'success',
    itemCount: 2410,
    badge: 'GEMINI FLASH',
    summaryMetric: '2,410 definitions',
  },
  {
    id: 'stage-4',
    name: 'Jev 3-Way Rubric Eval',
    description: '3 parallel questions: Accuracy, Editorial Format, and Difficulty scoring.',
    type: 'jev',
    status: 'running',
    itemCount: 2410,
    badge: 'JEV+ROUTER',
    summaryMetric: '76% eval • 35 w/s',
  },
  {
    id: 'stage-5',
    name: 'Remediation Loop',
    description: 'Targeted re-prompt loop for flagged entries in the review queue.',
    type: 'llm',
    status: 'queued',
    itemCount: 18,
    badge: 'AUTO-FIX',
    summaryMetric: '18 in queue',
  },
];

// Stage 2: Ingest & Lexical Filter with decideShouldRemove script
export const stage2StepConfig: StepGraphConfig = {
  stageId: 'stage-2',
  stageName: 'Stage 02: Lexical Validity & Dual-Signal Script Pruning',
  stageType: 'jev',
  scriptLabel: 'applyValidityPrune.ts',
  source: {
    label: 'Raw Candidate Wordlist',
    sublabel: 'OpenSubtitles FR',
    count: 2500,
    description: 'Candidate 5-letter tokens from caption frequency lists.',
  },
  questionNodes: [
    {
      id: 's2-q1',
      type: 'choice',
      title: 'JEV Lexical Validity Classifier',
      subtitle: 'Screens names, foreign language leaks, and OCR noise',
      throughput: '42 words/sec',
      options: [
        { key: 'valid', label: 'valid (standard headwords)', percentage: 96.4, count: 2410 },
        { key: 'proper_noun', label: 'proper_noun (character names)', percentage: 2.1, count: 52, isFlag: true },
        { key: 'foreign_leak', label: 'foreign_leak (English leaks)', percentage: 1.1, count: 28, isFlag: true },
        { key: 'non_word', label: 'non_word (subtitle sound effects)', percentage: 0.4, count: 10, isFlag: true },
      ],
    },
  ],
  scriptNode: {
    id: 's2-script',
    type: 'script',
    title: 'decideShouldRemove()',
    subtitle: 'Dual-signal threshold policy & low-confidence safeguard',
    filePath: 'scripts/applyValidityPrune.ts',
    consumedInputs: ['jev.verdict', 'jev.confidence >= 0.70', 'DEF_ADMITS_NOT_PT regex'],
    codeSnippet: `if (verdict !== 'valid' && confidence >= 0.70) {
  prune(token, reason: \`jev_\${verdict}_\${confidence}\`);
} else {
  keep(token); // low-confidence safeguard
}`,
    fullCode: `export function decideShouldRemove(
  verdict: LexicalVerdict,
  confidence: number,
  thresholds = { proper_noun: 0.70, foreign_leak: 0.70, non_word: 0.70 }
): { shouldRemove: boolean; reason?: string } {
  // Dual-signal prune policy
  if (verdict !== 'valid' && confidence >= thresholds[verdict]) {
    return { shouldRemove: true, reason: \`jev_\${verdict}_\${confidence}\` };
  }

  // Low-confidence safeguard: do NOT prune if JEV is unsure
  return { shouldRemove: false };
}`,
    decisionStats: {
      primaryLabel: 'pruned',
      primaryCount: 90,
      secondaryLabel: 'kept in seed',
      secondaryCount: 2410,
    },
  },
  destinationBuckets: [
    {
      id: 'clean_seed',
      title: 'Clean Seed Dictionary',
      count: 2410,
      percentage: 96.4,
      intent: 'success',
      description: 'Proceeds to Gemini 2.5 Flash lexicography',
    },
    {
      id: 'pruned_tokens',
      title: 'Pruned / Excluded Tokens',
      count: 90,
      percentage: 3.6,
      intent: 'error',
      isFlag: true,
      description: 'Excluded from game dictionary',
    },
  ],
};

// Stage 4: 3-Way Parallel JEV Evaluation with evaluateQueueRules script
export const stage4StepConfig: StepGraphConfig = {
  stageId: 'stage-4',
  stageName: 'Stage 04: JEV 3-Way Evaluation & Review Queue Router',
  stageType: 'jev',
  scriptLabel: 'auditPuzzleWords.mjs',
  source: {
    label: 'Stage 03 Output Definitions',
    sublabel: 'Gemini 2.5 Flash',
    count: 2410,
    description: 'Definitions, parts of speech, and lemma citations.',
  },
  questionNodes: [
    {
      id: 's4-q1',
      type: 'choice',
      title: 'Q1: Definition Accuracy',
      subtitle: 'Evaluates headword lemma vs inflection vs foreign false friend',
      throughput: '35 words/sec',
      options: [
        { key: 'accurate_base', label: 'accurate_base / inflected', percentage: 96.8, count: 2333 },
        { key: 'wrong_meaning', label: 'wrong_meaning (false friend)', percentage: 3.2, count: 77, isFlag: true },
      ],
    },
    {
      id: 's4-q2',
      type: 'choice',
      title: 'Q2: Editorial Format Hygiene',
      subtitle: 'Flags dangling fragments, malformed syntax, and circular text',
      throughput: '35 words/sec',
      options: [
        { key: 'clean_dictionary', label: 'clean_dictionary', percentage: 98.5, count: 2374 },
        { key: 'malformed_syntax', label: 'malformed / dangling subjunctive', percentage: 1.5, count: 36, isFlag: true },
      ],
    },
    {
      id: 's4-q3',
      type: 'score',
      title: 'Q3: Difficulty Tier Scoring',
      subtitle: 'Calibrated against 4-tier rubric (Elementary, Inter, Adv, Obscure)',
      metricLabel: 'difficulty',
      cutoffValue: 'd <= 0.90',
      tiers: [
        { key: 'elementary', label: 'Elem', percentage: 32, count: 771 },
        { key: 'intermediate', label: 'Inter', percentage: 46, count: 1108 },
        { key: 'advanced', label: 'Adv', percentage: 14, count: 337 },
        { key: 'obscure', label: 'Obscure', percentage: 8, count: 193, isFlag: true },
      ],
    },
  ],
  scriptNode: {
    id: 's4-script',
    type: 'script',
    title: 'evaluateQueueRules()',
    subtitle: 'Consolidates 3 parallel JEV signals into final routing decision',
    filePath: 'scripts/auditPuzzleWords.mjs',
    consumedInputs: ['q1.definitionAccuracy', 'q2.editorialHygiene', 'q3.difficultyTier'],
    codeSnippet: `if (q1.isFlag || q2.isFlag) {
  queue.push(entry, reason: 'flagged_critique');
} else if (q3.d > 0.90) {
  queue.push(entry, reason: 'obscure_word_overflow');
} else {
  pass(entry);
}`,
    fullCode: `export function evaluateQueueRules(entry: DictionaryEntry, jev: JevEval) {
  // Rule 1: Flagged definition accuracy (false friends or wrong POS)
  if (jev.definition !== 'accurate_base' && jev.definition !== 'inflected_form') {
    return { destination: 'review_queue', reason: jev.definition };
  }

  // Rule 2: Editorial formatting hygiene
  if (jev.format !== 'clean_dictionary') {
    return { destination: 'review_queue', reason: jev.format };
  }

  // Rule 3: Obscurity threshold cutoff (consensus > 0.90)
  if (jev.difficultyScore > 0.90) {
    return { destination: 'review_queue', reason: 'obscure_word_overflow' };
  }

  // Consensus Pass
  return { destination: 'clean_pass' };
}`,
    decisionStats: {
      primaryLabel: 'routed to review queue',
      primaryCount: 306,
      secondaryLabel: 'clean pass consensus',
      secondaryCount: 2104,
    },
  },
  destinationBuckets: [
    {
      id: 'clean_pass',
      title: 'Clean 100% Pass Bucket',
      count: 2104,
      percentage: 87.3,
      intent: 'success',
      description: 'Zero critique flags & calibrated difficulty',
    },
    {
      id: 'review_queue',
      title: 'Review Queue (Needs Fix)',
      count: 306,
      percentage: 12.7,
      intent: 'error',
      isFlag: true,
      description: 'Feeds into Stage 05 Auto-Remediation',
    },
  ],
};

const wordsCatalog: DatasetItem[] = [
  {
    id: 'w-about',
    title: 'about',
    subtitle: 'fr • noun',
    verdict: 'wrong_meaning',
    confidence: 86,
    contentPreview: 'The extreme end or butt joint of a structural beam.',
    rationale: 'False friend collision with English preposition "about"',
    isFlag: true,
  },
  {
    id: 'w-types',
    title: 'types',
    subtitle: 'fr • noun',
    verdict: 'wrong_meaning',
    confidence: 91,
    contentPreview: 'Informal plural referring to guys, blokes, or fellows.',
    rationale: 'Confused with English font/data type headword',
    isFlag: true,
  },
  {
    id: 'w-cents',
    title: 'cents',
    subtitle: 'fr • num',
    verdict: 'wrong_meaning',
    confidence: 88,
    contentPreview: 'Plural form of hundred (cent): hundreds.',
    rationale: 'Treated as English currency cents',
    isFlag: true,
  },
  {
    id: 'w-moral',
    title: 'moral',
    subtitle: 'es • noun',
    verdict: 'wrong_meaning',
    confidence: 84,
    contentPreview: 'The black mulberry tree (Morus nigra) or its edible fruit.',
    rationale: 'Evaluator expected ethical/moral adjective',
    isFlag: true,
  },
  {
    id: 'w-pulse',
    title: 'pulse',
    subtitle: 'es • verb',
    verdict: 'wrong_meaning',
    confidence: 82,
    contentPreview: 'First/third-person singular present subjunctive of pulsar: to press or pulse.',
    rationale: 'Treated as English medical noun pulse',
    isFlag: true,
  },
  {
    id: 'w-dudes',
    title: 'dudes',
    subtitle: 'es • verb',
    verdict: 'malformed_syntax',
    confidence: 88,
    contentPreview: 'That you (informal singular) doubt or question something.',
    rationale: 'Dangling subjunctive fragment without active meaning',
    isFlag: true,
  },
  {
    id: 'w-liras',
    title: 'liras',
    subtitle: 'fr • verb',
    verdict: 'malformed_syntax',
    confidence: 85,
    contentPreview: 'You will read; future tense of lire.',
    rationale: 'Missing clear grammatical parenthetical citation',
    isFlag: true,
  },
  {
    id: 'w-romps',
    title: 'romps',
    subtitle: 'fr • verb',
    verdict: 'malformed_syntax',
    confidence: 83,
    contentPreview: 'That I break, rupture, or snap.',
    rationale: 'Dangling fragment grammar',
    isFlag: true,
  },
  {
    id: 'w-agua',
    title: 'agua',
    subtitle: 'es • noun',
    verdict: 'accurate_base',
    confidence: 99,
    contentPreview: 'Water; the clear, odorless liquid essential for plant and animal life.',
    rationale: 'Clean headword definition',
  },
  {
    id: 'w-abate',
    title: 'abate',
    subtitle: 'es • verb',
    verdict: 'accurate_base',
    confidence: 94,
    contentPreview: 'Conjugated form of abatir: that he, she, or formal you knock down or dispirit.',
    rationale: 'Clean subjunctive lemma citation',
  },
  {
    id: 'w-pomme',
    title: 'pomme',
    subtitle: 'fr • noun',
    verdict: 'accurate_base',
    confidence: 98,
    contentPreview: 'Apple; the round edible fruit of a deciduous tree.',
    rationale: 'Standard headword',
  },
  {
    id: 'w-fleur',
    title: 'fleur',
    subtitle: 'fr • noun',
    verdict: 'accurate_base',
    confidence: 97,
    contentPreview: 'Flower; the seed-bearing part of a plant, consisting of reproductive organs.',
    rationale: 'Standard headword',
  },
  {
    id: 'w-soleil',
    title: 'soleil',
    subtitle: 'fr • noun',
    verdict: 'accurate_base',
    confidence: 99,
    contentPreview: 'Sun; the star around which the earth orbits.',
    rationale: 'Standard headword',
  },
  {
    id: 'w-xylem',
    title: 'xylem',
    subtitle: 'fr • noun',
    verdict: 'obscure',
    confidence: 96,
    contentPreview: 'The vascular tissue in plants that conducts water and dissolved nutrients.',
    rationale: 'Specialized botanical term exceeding d > 0.90 threshold',
    isFlag: true,
  },
  {
    id: 'w-fovea',
    title: 'fovea',
    subtitle: 'fr • noun',
    verdict: 'obscure',
    confidence: 94,
    contentPreview: 'A tiny pit located in the macula of the retina that provides sharp central vision.',
    rationale: 'Specialized medical jargon exceeding d > 0.90 threshold',
    isFlag: true,
  },
];

const prunedTokens: DatasetItem[] = [
  {
    id: 'p-johns',
    title: 'johns',
    subtitle: 'fr • noun',
    verdict: 'proper_noun',
    confidence: 94,
    contentPreview: 'N/A (Pruned before lexicography)',
    rationale: 'JEV: proper_noun (character name in subtitle corpus)',
    isFlag: true,
  },
  {
    id: 'p-right',
    title: 'right',
    subtitle: 'fr • adv',
    verdict: 'foreign_leak',
    confidence: 98,
    contentPreview: 'N/A (Pruned before lexicography)',
    rationale: 'JEV: foreign_leak (English word leaked into French captions)',
    isFlag: true,
  },
  {
    id: 'p-aaagh',
    title: 'aaagh',
    subtitle: 'fr • intj',
    verdict: 'non_word',
    confidence: 99,
    contentPreview: 'N/A (Pruned before lexicography)',
    rationale: 'JEV: non_word (subtitle sound effect)',
    isFlag: true,
  },
];

export const mockPipelineSlices: Record<string, OutcomeSlice> = {
  all: {
    key: 'all',
    title: 'All Input Definitions',
    count: 2410,
    items: wordsCatalog,
  },
  wrong_meaning: {
    key: 'wrong_meaning',
    title: 'Wrong Meaning / False Friend (Homograph Collision)',
    count: 77,
    items: wordsCatalog.filter((w) => w.verdict === 'wrong_meaning'),
  },
  malformed_syntax: {
    key: 'malformed_syntax',
    title: 'Malformed Syntax / Dangling Subjunctive',
    count: 36,
    items: wordsCatalog.filter((w) => w.verdict === 'malformed_syntax'),
  },
  accurate_base: {
    key: 'accurate_base',
    title: 'Accurate Base Headwords & Inflections',
    count: 2333,
    items: wordsCatalog.filter((w) => w.verdict === 'accurate_base'),
  },
  clean_dictionary: {
    key: 'clean_dictionary',
    title: 'Clean Dictionary Style (Pass)',
    count: 2374,
    items: wordsCatalog.filter((w) => w.verdict === 'accurate_base'),
  },
  obscure: {
    key: 'obscure',
    title: 'Obscure Words Exceeding Cutoff (d > 0.90)',
    count: 193,
    items: wordsCatalog.filter((w) => w.verdict === 'obscure'),
  },
  clean_pass: {
    key: 'clean_pass',
    title: 'Clean 100% Pass Bucket',
    count: 2104,
    items: wordsCatalog.filter((w) => !w.isFlag),
  },
  review_queue: {
    key: 'review_queue',
    title: 'Review Queue (All Flagged Entries)',
    count: 306,
    items: wordsCatalog.filter((w) => w.isFlag),
  },
  clean_seed: {
    key: 'clean_seed',
    title: 'Clean Seed Dictionary (Kept)',
    count: 2410,
    items: wordsCatalog.filter((w) => !w.isFlag),
  },
  pruned_tokens: {
    key: 'pruned_tokens',
    title: 'Pruned / Excluded Tokens',
    count: 90,
    items: prunedTokens,
  },
};
