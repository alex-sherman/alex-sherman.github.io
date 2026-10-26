import { raw } from '../../jsx-runtime';

export default function DriveViewAuthBouncePage() {
  return (
    <>
      {raw('<!DOCTYPE html>\n')}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Drive View — Authenticating...</title>
          <style>
            {raw(`
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #1b1d1e;
                color: #f1f3f5;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
              }
              .card {
                background: #242729;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-top: 3px solid #259054;
                border-radius: 12px;
                padding: 32px 24px;
                max-width: 420px;
                width: 100%;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
              }
              h1 { font-size: 1.35rem; margin: 0 0 12px; color: #f1f3f5; }
              p { color: #9aa0a6; font-size: 0.95rem; line-height: 1.5; margin: 0 0 20px; }
              .btn {
                display: inline-block;
                background: #259054;
                color: #fff;
                font-weight: 600;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                transition: background 0.2s;
              }
              .btn:hover { background: #34b86e; }
              .code-box {
                margin-top: 12px;
                background: #161819;
                padding: 10px 12px;
                border-radius: 6px;
                font-family: Consolas, monospace;
                font-size: 0.85rem;
                word-break: break-all;
                color: #8ce6b0;
                border: 1px solid rgba(255, 255, 255, 0.08);
                user-select: all;
              }
            `)}
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Redirecting to Obsidian...</h1>
            <p>Sign-in complete. You should be redirected back to the Obsidian app automatically.</p>
            <a id="obsidian-link" class="btn" href="#">Open in Obsidian</a>
            <div id="fallback" style="display: none;">
              <p style="margin-top: 20px; margin-bottom: 8px; font-size: 0.85rem;">
                If Obsidian didn't open automatically, copy this code and paste it into the plugin:
              </p>
              <div id="code-display" class="code-box"></div>
            </div>
          </div>

          <script>
            {raw(`
              (function () {
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                const error = params.get("error");

                const deepLink = "obsidian://drive-view-auth?" + params.toString();
                const btn = document.getElementById("obsidian-link");
                btn.href = deepLink;

                if (code) {
                  document.getElementById("fallback").style.display = "block";
                  document.getElementById("code-display").textContent = code;
                  window.location.href = deepLink;
                } else if (error) {
                  document.querySelector("h1").textContent = "Authentication Error";
                  document.querySelector("p").textContent = "Google reported an error: " + error;
                  btn.style.display = "none";
                }
              })();
            `)}
          </script>
        </body>
      </html>
    </>
  );
}
