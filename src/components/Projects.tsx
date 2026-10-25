import { getSortedProjects } from '../content';

export interface ProjectsProps {
  limit?: number;
}

export function Projects({ limit }: ProjectsProps = {}) {
  const allProjects = getSortedProjects();
  const projects = limit ? allProjects.slice(0, limit) : allProjects;

  return (
    <div class="projects-grid">
      {projects.map((project) => {
        const isExternal = Boolean(project.frontmatter.link_url);
        const href = project.frontmatter.link_url ?? project.url;
        return (
          <a
            class="project-card"
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener' : undefined}
          >
            <div class="project-card-header">
              <h2>{project.frontmatter.title}</h2>
              <span class="project-card-arrow">{isExternal ? '↗' : '→'}</span>
            </div>
            {project.frontmatter.subtitle && <p>{project.frontmatter.subtitle}</p>}
          </a>
        );
      })}
    </div>
  );
}
