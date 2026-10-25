import { DefaultLayout } from '../layouts/DefaultLayout';
import { loadMarkdownCollection } from '../content';
import { raw } from '../jsx-runtime';

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

export default function BlogPage() {
  const posts = loadMarkdownCollection('src/pages/posts', '/posts')
    .map((post) => {
      const date = parseDateFromSlug(post.slug, post.frontmatter.date);
      const firstParagraphMatch = post.html.match(/<p>([\s\S]*?)<\/p>/);
      const excerpt = firstParagraphMatch ? firstParagraphMatch[1] : '';
      return {
        title: post.frontmatter.title,
        href: post.url,
        date,
        dateString: formatDateToString(date),
        excerpt,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <DefaultLayout title="Blog" subtitle="Things I write about">
      {posts.map((post) => (
        <div class="row-fluid">
          <div class="col-xs-12 hide-links">
            <a href={post.href}><h2>{post.title}</h2></a>
            <div class="date">{post.dateString}</div>
            <p>{raw(post.excerpt)}</p>
          </div>
        </div>
      ))}
    </DefaultLayout>
  );
}
