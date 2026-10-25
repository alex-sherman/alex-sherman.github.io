import { Glob } from 'bun';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DefaultLayout } from './src/layouts/DefaultLayout';
import { parseMarkdownFile } from './src/content';
import { raw } from './src/jsx-runtime';

export async function buildSite(outDir = 'dist') {
  const start = performance.now();

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // 1. Copy static assets from public/ and root CNAME
  if (existsSync('public')) {
    cpSync('public', outDir, { recursive: true });
  }
  if (existsSync('CNAME')) {
    cpSync('CNAME', join(outDir, 'CNAME'));
  }

  let pageCount = 0;

  // 2. Render .tsx pages in src/pages/
  const tsxGlob = new Glob('**/*.tsx');
  for (const relPath of tsxGlob.scanSync('src/pages')) {
    const fullPath = join(process.cwd(), 'src/pages', relPath);
    const mod = await import(`${fullPath}?t=${Date.now()}`);
    const PageComponent = mod.default;
    if (typeof PageComponent === 'function') {
      const html = String(await PageComponent());
      const outPath = join(outDir, relPath.replace(/\.tsx$/, '.html'));
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      pageCount++;
    }
  }

  // 3. Render .md pages in src/pages/
  const mdGlob = new Glob('**/*.md');
  for (const relPath of mdGlob.scanSync('src/pages')) {
    const normalizedRel = relPath.replace(/\\/g, '/');
    const dirPart = dirname(normalizedRel);
    const urlPrefix = dirPart === '.' ? '' : `/${dirPart}`;
    const entry = parseMarkdownFile(join('src/pages', relPath), urlPrefix);

    const activeNav = dirPart.startsWith('posts')
      ? 'blog'
      : dirPart.startsWith('projects') || dirPart.startsWith('haprojects')
      ? 'projects'
      : undefined;

    const html = String(
      <DefaultLayout
        title={entry.frontmatter.title}
        subtitle={entry.frontmatter.subtitle}
        custom_css={entry.frontmatter.custom_css}
        activeNav={activeNav}
      >
        <article class="markdown-body">
          {raw(entry.html)}
        </article>
      </DefaultLayout>
    );

    const outPath = join(outDir, normalizedRel.replace(/\.md$/, '.html'));
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    pageCount++;
  }

  const elapsed = (performance.now() - start).toFixed(0);
  console.log(`Built ${pageCount} pages into ${outDir}/ in ${elapsed}ms`);
}

if (import.meta.main) {
  await buildSite();
}
