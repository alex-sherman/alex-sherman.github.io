import { Head } from '../components/Head';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { raw } from '../jsx-runtime';

export interface DefaultLayoutProps {
  title: string;
  subtitle?: string;
  custom_css?: string;
  activeNav?: 'about' | 'projects' | 'blog';
  children?: any;
}

export function DefaultLayout({ title, subtitle, custom_css, activeNav, children }: DefaultLayoutProps) {
  return (
    <>
      {raw('<!doctype html>\n')}
      <html class="no-js" lang="en">
        <Head title={title} custom_css={custom_css} />
        <body>
          <Header title={title} subtitle={subtitle} activeNav={activeNav} />
          <main class="container">
            <div class="content">
              {children}
            </div>
          </main>
          <Footer />
        </body>
      </html>
    </>
  );
}
