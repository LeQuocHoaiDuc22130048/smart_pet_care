import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'div',
    'em',
    'figcaption',
    'figure',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
];

const ALLOWED_ATTR = [
    'alt',
    'class',
    'colspan',
    'height',
    'href',
    'loading',
    'rel',
    'rowspan',
    'scope',
    'src',
    'style',
    'target',
    'title',
    'width',
];

const ALLOWED_STYLE_PROPERTIES = new Set([
    'text-align',
    'margin-left',
    'margin-right',
    'padding-left',
    'width',
    'height',
]);

function sanitizeInlineStyles(container: HTMLTemplateElement): void {
    container.content.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
        const sanitized = element
            .getAttribute('style')
            ?.split(';')
            .map((rule) => rule.trim())
            .filter(Boolean)
            .filter((rule) => {
                const property = rule.split(':')[0]?.trim().toLowerCase();
                return ALLOWED_STYLE_PROPERTIES.has(property);
            })
            .join('; ');

        if (sanitized) {
            element.setAttribute('style', sanitized);
        } else {
            element.removeAttribute('style');
        }
    });
}

export function sanitizeHtml(value?: string): string {
    if (!value?.trim() || typeof document === 'undefined') {
        return '';
    }

    const sanitized = DOMPurify.sanitize(value, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form'],
        FORBID_ATTR: ['srcdoc'],
    });

    const template = document.createElement('template');
    template.innerHTML = sanitized;
    sanitizeInlineStyles(template);
    template.content.querySelectorAll('a').forEach((element) => {
        element.setAttribute('rel', 'noopener noreferrer');
    });

    return template.innerHTML;
}

export function htmlToPlainText(value?: string): string {
    if (!value?.trim()) return '';

    if (typeof document === 'undefined') {
        return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const template = document.createElement('template');
    template.innerHTML = sanitizeHtml(value);
    return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim();
}
