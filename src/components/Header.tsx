export interface HeaderProps {
  title: string;
  subtitle?: string;
  activeNav?: 'about' | 'projects' | 'blog';
}

export function Header({ title, subtitle, activeNav }: HeaderProps) {
  return (
    <header class="nav-container">
      <div class="container">
        <h1>{title}</h1>
        {subtitle && <h2>{subtitle}</h2>}
        <ul class="nav navbar-nav">
          <li><a href="/" class={activeNav === 'about' ? 'active' : undefined}>About</a></li>
          <li><a href="/projects.html" class={activeNav === 'projects' ? 'active' : undefined}>Projects</a></li>
          <li><a href="/blog.html" class={activeNav === 'blog' ? 'active' : undefined}>Blog</a></li>
          <li><a href="/resume.pdf">Resume</a></li>
          <li><a href="https://github.com/alex-sherman" target="_blank" rel="noopener">GitHub ↗</a></li>
        </ul>
      </div>
    </header>
  );
}
