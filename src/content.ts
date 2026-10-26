import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

export interface Frontmatter {
  title: string;
  subtitle?: string;
  priority?: number;
  link_url?: string;
  custom_css?: string;
  date?: string;
  [key: string]: any;
}

export interface MarkdownEntry {
  slug: string;
  url: string;
  frontmatter: Frontmatter;
  body: string;
  html: string;
}

export interface BlogPostEntry extends MarkdownEntry {
  title: string;
  date: Date;
  dateString: string;
  excerpt: string;
}

export function parseMarkdownFile(filePath: string, urlPrefix: string): MarkdownEntry {
  const rawText = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  const frontmatter: Record<string, any> = {};
  let body = rawText;

  const match = rawText.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (match) {
    const fmLines = match[1].split('\n');
    for (const line of fmLines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (val !== '' && !Number.isNaN(Number(val))) {
        frontmatter[key] = Number(val);
      } else {
        frontmatter[key] = val;
      }
    }
    body = match[2];
  }

  const slug = basename(filePath, '.md');
  const url = `${urlPrefix}/${slug}`;
  const html = Bun.markdown.html(body, { headingIds: true });

  return {
    slug,
    url,
    frontmatter: frontmatter as Frontmatter,
    body,
    html,
  };
}

export function loadMarkdownCollection(dir: string, urlPrefix: string): MarkdownEntry[] {
  const glob = new Glob('*.md');
  const entries: MarkdownEntry[] = [];
  for (const file of glob.scanSync(dir)) {
    entries.push(parseMarkdownFile(`${dir}/${file}`, urlPrefix));
  }
  return entries;
}

export function getSortedProjects(): MarkdownEntry[] {
  return loadMarkdownCollection('src/pages/projects', '/projects').sort(
    (a, b) => (b.frontmatter.priority ?? 0) - (a.frontmatter.priority ?? 0)
  );
}

function parseDateFromSlug(slug: string, frontmatterDate?: string): Date {
  if (frontmatterDate) return new Date(frontmatterDate);
  const match = slug.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(0);
}

function formatDateToString(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getSortedPosts(): BlogPostEntry[] {
  return loadMarkdownCollection('src/pages/posts', '/posts')
    .map((post) => {
      const date = parseDateFromSlug(post.slug, post.frontmatter.date);
      const firstParagraphMatch = post.html.match(/<p>([\s\S]*?)<\/p>/);
      const excerpt = firstParagraphMatch ? firstParagraphMatch[1] : '';
      return {
        ...post,
        title: post.frontmatter.title,
        date,
        dateString: formatDateToString(date),
        excerpt,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
