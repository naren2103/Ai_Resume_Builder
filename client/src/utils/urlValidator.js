// ============================================
// urlValidator.js - Client-Side Profile URL Validation
// ============================================
// Validates LinkedIn and GitHub profile URLs for syntax,
// HTTPS protocol, and domain correctness.
// Both fields are optional (empty strings are valid).
// ============================================

/**
 * Validates a LinkedIn profile URL.
 * Empty values are valid (optional field).
 * Non-empty values must be valid HTTPS URLs under linkedin.com with an /in/ path.
 *
 * @param {string} url
 * @returns {{ isValid: boolean, error: string }}
 */
export const validateLinkedInUrl = (url) => {
  if (url === undefined || url === null) {
    return { isValid: true, error: '' };
  }

  const trimmed = String(url).trim();
  if (trimmed === '') {
    return { isValid: true, error: '' };
  }

  // Must start with https://
  if (!trimmed.toLowerCase().startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must use HTTPS (e.g., https://www.linkedin.com/in/your-profile).',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    const isLinkedIn = hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com');

    if (!isLinkedIn) {
      return {
        isValid: false,
        error: 'URL domain must be linkedin.com (e.g., https://www.linkedin.com/in/your-profile).',
      };
    }

    const inMatch = parsed.pathname.match(/^\/in\/([a-zA-Z0-9_\-%.]+)/);
    if (!inMatch || !inMatch[1]) {
      return {
        isValid: false,
        error: 'Must point to a LinkedIn profile path (e.g., https://www.linkedin.com/in/your-profile).',
      };
    }

    return { isValid: true, error: '' };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL syntax (e.g., https://www.linkedin.com/in/your-profile).',
    };
  }
};

/**
 * Validates a GitHub profile URL.
 * Empty values are valid (optional field).
 * Non-empty values must be valid HTTPS URLs under github.com with a valid username path.
 *
 * @param {string} url
 * @returns {{ isValid: boolean, error: string }}
 */
export const validateGitHubUrl = (url) => {
  if (url === undefined || url === null) {
    return { isValid: true, error: '' };
  }

  const trimmed = String(url).trim();
  if (trimmed === '') {
    return { isValid: true, error: '' };
  }

  // Must start with https://
  if (!trimmed.toLowerCase().startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must use HTTPS (e.g., https://github.com/your-username).',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    const isGitHub = hostname === 'github.com' || hostname === 'www.github.com';

    if (!isGitHub) {
      return {
        isValid: false,
        error: 'URL domain must be github.com (e.g., https://github.com/your-username).',
      };
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return {
        isValid: false,
        error: 'GitHub profile URL must include a username (e.g., https://github.com/your-username).',
      };
    }

    const username = segments[0];
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return {
        isValid: false,
        error: 'GitHub profile URL contains an invalid username format.',
      };
    }

    return { isValid: true, error: '' };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL syntax (e.g., https://github.com/your-username).',
    };
  }
};
