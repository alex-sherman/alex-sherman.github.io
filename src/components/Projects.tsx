import { loadMarkdownCollection } from '../content';

export function Projects() {
  const projects = loadMarkdownCollection('src/pages/projects', '/projects').sort(
    (a, b) => (b.frontmatter.priority ?? 0) - (a.frontmatter.priority ?? 0)
  );

  return (
    <>
      {projects.map((project) => (
        <div class="row-fluid">
          <div class="circle-container col-xs-12 col-sm-4 col-md-3 hide-links">
            <a class="circle" href={project.frontmatter.link_url ?? project.url}>
              <div>
                <h2>{project.frontmatter.title}</h2>
                <p>{project.frontmatter.subtitle}</p>
              </div>
            </a>
          </div>
        </div>
      ))}
    </>
  );
}
