import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { chunkSourceDocuments, parseSourceDocumentsFromMarkdown, toSourceDocuments } from './source-parser';

const sampleFiles = [
  'maintenance-schedule.md',
  'filter-replacement.md',
  'fault-triage.md',
  'support-escalation.md',
  'safety-limits.md',
  'warranty-boundaries.md',
];

const sampleMarkdown = sampleFiles.map((fileName) =>
  readFileSync(join(process.cwd(), 'samples', 'equipment-after-sales', fileName), 'utf8'),
);

export const parsedSourceDocuments = parseSourceDocumentsFromMarkdown(sampleMarkdown);
export const sourceDocuments = toSourceDocuments(parsedSourceDocuments);
export const sourceChunks = chunkSourceDocuments(parsedSourceDocuments);
