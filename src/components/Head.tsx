import { raw } from '../jsx-runtime';

export interface HeadProps {
  title: string;
  custom_css?: string;
}

export function Head({ title, custom_css }: HeadProps) {
  return (
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

      <title>{title}</title>
      <meta name="description" content="" />
      <meta name="author" content="Alex Sherman" />

      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="stylesheet" href="/dist/css/bootstrap.min.css" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.6.0/codemirror.min.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.6.0/codemirror.min.css" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.6.0/mode/javascript/javascript.min.js"></script>

      <link rel="stylesheet" href="/css/style.css" />
      <link rel="stylesheet" href="/css/syntax.css" />
      <link rel="stylesheet" href="/css/codemirror.css" />

      {custom_css && <link rel="stylesheet" href={`/css/${custom_css}`} />}
      <script src="/dist/js/jquery-1.11.1.min.js"></script>
      <script src="/dist/js/bootstrap.js"></script>
      <script src="/js/runnify.js"></script>
      <script src="/js/main.js"></script>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-E82DRCH4GP"></script>
      <script>
        {raw(`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-E82DRCH4GP');
        `)}
      </script>
    </head>
  );
}
