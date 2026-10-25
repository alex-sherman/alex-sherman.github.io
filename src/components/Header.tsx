export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div class="nav-container">
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
      <ul class="nav navbar-nav">
        <li><a href="/">About</a></li>
        <li><a href="/projects.html">Projects</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/resume.pdf">Resume</a></li>
        <li><a href="https://github.com/alex-sherman">Github</a></li>
        <li><a href="http://stackoverflow.com/story/alex_sherman">Stack Overflow</a></li>
      </ul>
    </div>
  );
}
