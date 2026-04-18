/**
 * Sanitize utility to prevent XSS attacks by escaping HTML entities
 */

export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return str.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

export function sanitizeUserInput(input) {
  if (typeof input !== 'string') return input;
  return escapeHtml(input.trim());
}
