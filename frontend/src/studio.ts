export type StudioFile = { path: string; content: string };
export type StudioProject = { name: string; prompt: string; files: StudioFile[]; createdAt: string; version: 1 };
export type Spec = { requirements: string[]; design: string[]; tasks: string[]; acceptance: string[] };

const safeName = (text: string) => text.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'new-project';
const htmlEscape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const json = (value: unknown) => JSON.stringify(value, null, 2);

export function generateSpec(prompt: string): Spec {
  const goal = prompt.trim().slice(0, 1200);
  if (!goal) throw new Error('Describe the application first.');
  return {
    requirements: [`Deliver an application addressing: ${goal}`, 'Provide responsive navigation and accessible controls.', 'Keep secrets outside the client bundle.', 'Make generated output inspectable and editable.'],
    design: ['Static HTML/CSS/JavaScript starter; no backend or external services.', 'Separate UI structure, styling and behavior into files.', 'Escape user-provided text in HTML.'],
    tasks: ['Review the generated specification.', 'Edit the project files.', 'Run a sandboxed browser preview.', 'Add real application logic and tests.', 'Review deployment configuration before publishing.'],
    acceptance: ['Files can be exported without a cloud account.', 'The starter renders in a browser.', 'No credentials or arbitrary external scripts are embedded.', 'Deployment requires an explicit user action.']
  };
}

export function generateProject(prompt: string): StudioProject {
  const spec = generateSpec(prompt);
  const name = safeName(prompt.split(/[.!?]/)[0]);
  const title = htmlEscape(prompt.trim().slice(0, 100));
  const files: StudioFile[] = [
    { path: 'index.html', content: `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><link rel="stylesheet" href="style.css"></head>
<body><main><div class="eyebrow">XFREESTUDIO / GENERATED STARTER</div><h1>${title}</h1>
<p>Customize this starter with the Xfree Studio code workspace.</p>
<button id="action" type="button">Get started</button><p id="message" role="status"></p>
</main><script src="app.js" defer></script></body></html>` },
    { path: 'style.css', content: `:root{font-family:system-ui;color:#e9fff0;background:#050a07}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}main{max-width:700px;padding:48px;border:1px solid #1c6034;border-radius:24px;background:#0b1610}h1{font-size:clamp(2rem,6vw,4rem)}p{line-height:1.6;color:#9bbfa7}.eyebrow{color:#35f56a;letter-spacing:.2em;font-size:12px}button{background:#35f56a;color:#071108;padding:14px 22px;border:0;border-radius:10px;font-weight:700;cursor:pointer}` },
    { path: 'app.js', content: `document.getElementById('action')?.addEventListener('click', () => {
  document.getElementById('message').textContent = 'Your project is ready to customize.';
});` },
    { path: 'SPEC.md', content: `# ${prompt.trim().slice(0, 1200)}\n\n${Object.entries(spec).map(([key, items]) => `## ${key}\n${items.map(x => '- ' + x).join('\n')}`).join('\n\n')}\n` },
    { path: 'project.json', content: json({ name, generator: 'xfree-studio-static-v1', version: 1, description: prompt.trim().slice(0, 1200), deployment: 'static' }) }
  ];
  return { name, prompt: prompt.trim().slice(0, 1200), files, createdAt: new Date().toISOString(), version: 1 };
}

const STORAGE_KEY = 'xfree-studio:projects:v1';
export function saveProject(project: StudioProject): void {
  const projects = listProjects().filter(x => x.name !== project.name);
  projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 12)));
}
export function listProjects(): StudioProject[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is StudioProject => x && typeof x.name === 'string' && Array.isArray(x.files) && x.version === 1);
  } catch { return []; }
}
export function previewHtml(project: StudioProject): string {
  const html = project.files.find(x => x.path === 'index.html')?.content || '';
  const css = project.files.find(x => x.path === 'style.css')?.content || '';
  const script = project.files.find(x => x.path === 'app.js')?.content || '';
  return html.replace(/<link[^>]*href="style.css"[^>]*>/, '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>')
    .replace(/<script[^>]*src="app.js"[^>]*><\/script>/, '<script>' + script.replace(/<\/script/gi, '<\\/script') + '</script>');
}
export function exportProject(project: StudioProject): void {
  const blob = new Blob([json(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = project.name + '.xfree.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
