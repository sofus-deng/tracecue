import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { chunkSourceDocuments, parseSourceDocumentsFromMarkdown, toSourceDocuments } from './source-parser';

const sampleFiles = [
  'client-handoff-notes.md',
  'support-faq.md',
  'delivery-checklist.md',
  'meeting-transcript.md',
  'support-policy-draft.md',
];

const sampleMarkdown = sampleFiles.map((fileName) =>
  readFileSync(join(process.cwd(), 'samples', fileName), 'utf8'),
);

export const parsedSourceDocuments = parseSourceDocumentsFromMarkdown(sampleMarkdown);
export const sourceDocuments = toSourceDocuments(parsedSourceDocuments);
export const sourceChunks = chunkSourceDocuments(parsedSourceDocuments);
