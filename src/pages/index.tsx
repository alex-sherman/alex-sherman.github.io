import { DefaultLayout } from '../layouts/DefaultLayout';
import { Projects } from '../components/Projects';
import { getSortedPosts } from '../content';
import { raw } from '../jsx-runtime';

export default function IndexPage() {
  const recentPosts = getSortedPosts().slice(0, 3);

  return (
    <DefaultLayout title="Alex_Sherman" subtitle="Professional developer" activeNav="about">
      <section class="about-card">
        <div class="about-avatar">
          <img src="/images/headshot_md.png" class="image" alt="Alex Sherman" />
        </div>
        <div class="about-bio">
          <h2 id="about-me">About Me</h2>
          <p>
            I'm a systems and networking engineer at{' '}
            <strong class="google-word" aria-label="Google">
              <span class="g-blue">G</span>
              <span class="g-red">o</span>
              <span class="g-yellow">o</span>
              <span class="g-blue">g</span>
              <span class="g-green">l</span>
              <span class="g-red">e</span>
            </strong>
            , where I built the high-performance RPC stack behind{' '}
            <strong class="gemini-word">Gemini</strong> and work on Snap user-space networking, as well as an indie game developer at{' '}
            <strong class="faff-word">Faff Games</strong>. I earned my master's in Computer Engineering from UW–Madison.
          </p>
          <p>
            I love building fast, low-level systems and simplifying complex workflows—whether that's distributed networking, multiplayer game engines, or developer tools. Check out my <a href="https://github.com/alex-sherman" target="_blank" rel="noopener">GitHub</a> for my open-source libraries in C++, C#, and Python.
          </p>
        </div>
      </section>

      <section class="home-section">
        <div class="section-heading">
          <h2>Featured Projects</h2>
          <a href="/projects.html" class="section-link">View all projects →</a>
        </div>
        <Projects limit={3} />
      </section>

      <section class="home-section">
        <div class="section-heading">
          <h2>Recent Posts</h2>
          <a href="/blog.html" class="section-link">View all posts →</a>
        </div>
        <div class="posts-list">
          {recentPosts.map((post) => (
            <a class="post-card" href={post.url}>
              <div class="post-card-top">
                <h2>{post.frontmatter.title}</h2>
                <span class="date-badge">{post.dateString}</span>
              </div>
              {post.frontmatter.subtitle && <div class="post-subtitle">{post.frontmatter.subtitle}</div>}
              <p class="post-excerpt">{raw(post.excerpt)}</p>
            </a>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
