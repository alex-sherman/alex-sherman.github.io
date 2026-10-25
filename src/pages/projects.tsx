import { DefaultLayout } from '../layouts/DefaultLayout';
import { Projects } from '../components/Projects';

export default function ProjectsPage() {
  return (
    <DefaultLayout title="Projects" subtitle="Things I've Done">
      <Projects />
    </DefaultLayout>
  );
}
