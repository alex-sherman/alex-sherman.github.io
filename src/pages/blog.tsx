import { DefaultLayout } from '../layouts/DefaultLayout';
import { getSortedPosts } from '../content';
import { raw } from '../jsx-runtime';

export default function BlogPage() {
  const posts = getSortedPosts();

  return (
    <DefaultLayout title="Blog" subtitle="Things I write about" activeNav="blog">
      <div class="posts-list">
        {posts.map((post) => (
          <a class="post-card" href={post.url}>
            <div class="post-card-top">
              <h2>{post.frontmatter.title}</h2>
              <span class="date-badge">{post.dateString}</span>
            </div>
            {post.frontmatter.subtitle && <div class="post-subtitle">{post.frontmatter.subtitle}</div>}
            <p class="post-excerpt">{raw(post.excerpt)}</p>
            <span class="post-read-more">Read article →</span>
          </a>
        ))}
      </div>
    </DefaultLayout>
  );
}
