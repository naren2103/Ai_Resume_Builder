// ============================================
// urlValidator.js - Profile URL Validation
// ============================================
// Validates LinkedIn and GitHub profile URLs securely.
// Ensures HTTPS protocol, correct domains, and valid path structures.
// Does NOT perform external HTTP requests (preventing SSRF).
// ============================================

/**
 * Validates a LinkedIn profile URL.
 * Accepts optional empty strings.
 * Requires HTTPS and linkedin.com domain with an /in/<profile> path.
 *
 * @param {string} url
 * @returns {{ isValid: boolean, sanitized: string, error?: string }}
 */
export const validateLinkedInUrl = (url) => {
  if (url === undefined || url === null) {
    return { isValid: true, sanitized: '' };
  }

  const trimmed = String(url).trim();
  if (trimmed === '') {
    return { isValid: true, sanitized: '' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'LinkedIn profile URL must use HTTPS (e.g., https://www.linkedin.com/in/your-profile).',
      };
    }

    const hostname = parsed.hostname.toLowerCase();
    const isLinkedIn = hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com');

    if (!isLinkedIn) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'URL domain must be linkedin.com (e.g., https://www.linkedin.com/in/your-profile).',
      };
    }

    const path = parsed.pathname;
    // Check for /in/<username> pattern
    const inMatch = path.match(/^\/in\/([a-zA-Z0-9_\-%.]+)/);
    if (!inMatch || !inMatch[1]) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'LinkedIn URL must point to a personal profile path (e.g., https://www.linkedin.com/in/your-profile).',
      };
    }

    // Return the clean HTTPS URL without trailing fragment or query tracking if desired, or sanitized href
    return {
      isValid: true,
      sanitized: parsed.href,
    };
  } catch {
    return {
      isValid: false,
      sanitized: trimmed,
      error: 'Please enter a valid URL syntax (e.g., https://www.linkedin.com/in/your-profile).',
    };
  }
};

/**
 * Validates a GitHub profile URL.
 * Accepts optional empty strings.
 * Requires HTTPS and github.com domain with a valid username path.
 *
 * @param {string} url
 * @returns {{ isValid: boolean, sanitized: string, error?: string }}
 */
export const validateGitHubUrl = (url) => {
  if (url === undefined || url === null) {
    return { isValid: true, sanitized: '' };
  }

  const trimmed = String(url).trim();
  if (trimmed === '') {
    return { isValid: true, sanitized: '' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'GitHub profile URL must use HTTPS (e.g., https://github.com/your-username).',
      };
    }

    const hostname = parsed.hostname.toLowerCase();
    const isGitHub = hostname === 'github.com' || hostname === 'www.github.com';

    if (!isGitHub) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'URL domain must be github.com (e.g., https://github.com/your-username).',
      };
    }

    // Path should be /<username> (cannot be empty or root)
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'GitHub profile URL must include a username (e.g., https://github.com/your-username).',
      };
    }

    // Verify valid GitHub username pattern (alphanumeric and single hyphens, not starting/ending with hyphen)
    const username = segments[0];
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: 'GitHub URL contains an invalid username format.',
      };
    }

    return {
      isValid: true,
      sanitized: parsed.href,
    };
  } catch {
    return {
      isValid: false,
      sanitized: trimmed,
      error: 'Please enter a valid URL syntax (e.g., https://github.com/your-username).',
    };
  }
};
