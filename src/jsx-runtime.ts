const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

export class SafeHtml {
  constructor(public value: string) {}
  toString() {
    return this.value;
  }
}

export function raw(html: string): SafeHtml {
  return new SafeHtml(html);
}

function renderChild(child: any): string {
  if (child === null || child === undefined || child === false || child === true) {
    return '';
  }
  if (child instanceof SafeHtml) {
    return child.value;
  }
  if (Array.isArray(child)) {
    return child.map(renderChild).join('');
  }
  return Bun.escapeHTML(String(child));
}

export function Fragment({ children }: { children?: any }): SafeHtml {
  return new SafeHtml(renderChild(children));
}

export function jsx(tag: any, props: Record<string, any> | null): SafeHtml {
  const { children, dangerouslySetInnerHTML, ...attrs } = props || {};

  if (typeof tag === 'function') {
    return tag({ ...attrs, children });
  }

  let attrStr = '';
  for (const [key, val] of Object.entries(attrs)) {
    if (val === undefined || val === null || val === false) continue;
    const attrName = key === 'className' ? 'class' : key;
    if (val === true) {
      attrStr += ` ${attrName}`;
    } else {
      attrStr += ` ${attrName}="${Bun.escapeHTML(String(val))}"`;
    }
  }

  if (VOID_ELEMENTS.has(tag)) {
    return new SafeHtml(`<${tag}${attrStr}>`);
  }

  const inner = dangerouslySetInnerHTML
    ? dangerouslySetInnerHTML.__html
    : renderChild(children);

  return new SafeHtml(`<${tag}${attrStr}>${inner}</${tag}>`);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

declare global {
  namespace JSX {
    type Element = SafeHtml;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
