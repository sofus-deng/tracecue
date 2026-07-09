import type { SourceChunk, SourceDocument } from './types';

type SourceMetadata = Pick<SourceDocument, 'id' | 'title' | 'kind'>;

export type ParsedSourceDocument = SourceDocument & {
  sections: SourceSection[];
};

export type SourceSection = {
  label: string;
  text: string;
};

const allowedKinds = [
  'handoff',
  'faq',
  'checklist',
  'transcript',
  'policy',
  'manual',
  'troubleshooting',
  'support',
  'warranty',
] as const;

function parseMetadata(markdown: string): { metadata: SourceMetadata; body: string } {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error('Source markdown must start with frontmatter metadata.');
  }

  const [, frontmatter = '', body = ''] = frontmatterMatch;
  const entries = frontmatter
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        throw new Error(`Invalid source metadata line: ${line}`);
      }

      return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()] as const;
    });
  const metadata = Object.fromEntries(entries);

  if (!metadata.id || !metadata.title || !metadata.kind) {
    throw new Error('Source markdown metadata must include id, title, and kind.');
  }

  if (!allowedKinds.includes(metadata.kind as SourceDocument['kind'])) {
    throw new Error(`Unsupported source document kind: ${metadata.kind}`);
  }

  return {
    metadata: {
      id: metadata.id,
      title: metadata.title,
      kind: metadata.kind as SourceDocument['kind'],
    },
    body,
  };
}

function parseSections(body: string): SourceSection[] {
  const sections: SourceSection[] = [];
  const sectionMatches = body.matchAll(/^##\s+(.+)\n+([\s\S]*?)(?=^##\s+|\s*$)/gm);

  for (const match of sectionMatches) {
    const [, label = '', text = ''] = match;
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    if (label.trim() && normalizedText) {
      sections.push({
        label: label.trim(),
        text: normalizedText,
      });
    }
  }

  if (sections.length > 0) {
    return sections;
  }

  const fallbackText = body.replace(/^#\s+.+$/gm, '').replace(/\s+/g, ' ').trim();

  return fallbackText ? [{ label: 'Source note', text: fallbackText }] : [];
}

function buildExcerpt(sections: SourceSection[]): string {
  return sections.map((section) => section.text).join(' ').replace(/\s+/g, ' ').trim();
}

export function parseSourceMarkdown(markdown: string): ParsedSourceDocument {
  const { metadata, body } = parseMetadata(markdown.trim());
  const sections = parseSections(body);

  return {
    ...metadata,
    excerpt: buildExcerpt(sections),
    sections,
  };
}

export function parseSourceDocumentsFromMarkdown(markdowns: string[]): ParsedSourceDocument[] {
  return markdowns.map(parseSourceMarkdown);
}

export function chunkSourceDocuments(documents: ParsedSourceDocument[]): SourceChunk[] {
  return documents.flatMap((document) =>
    document.sections.map((section, sectionIndex) => ({
      id: `${document.id}#${String(sectionIndex + 1).padStart(2, '0')}`,
      documentId: document.id,
      label: section.label,
      text: section.text,
    })),
  );
}

export function toSourceDocuments(documents: ParsedSourceDocument[]): SourceDocument[] {
  return documents.map(({ sections: _sections, ...document }) => document);
}
