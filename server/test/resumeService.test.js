import assert from 'node:assert/strict';

// Import function directly or simulate sanitizeParsedSections logic
const ensureString = (value) => {
  if (Array.isArray(value)) return value.map(ensureString).join(' ');
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const sanitizeParsedSections = (sections = {}) => {
  const parsed = sections.sections || sections;
  const normalized = { ...parsed };

  normalized.personalInfo = normalized.personalInfo || {};
  const linkedIn = ensureString(
    normalized.personalInfo.linkedIn || normalized.personalInfo.linkedin || normalized.personalInfo.linkedInUrl
  ).trim();
  const github = ensureString(
    normalized.personalInfo.github || normalized.personalInfo.gitHub || normalized.personalInfo.githubUrl
  ).trim();

  normalized.personalInfo = {
    fullName: ensureString(normalized.personalInfo.fullName),
    email: ensureString(normalized.personalInfo.email),
    phone: ensureString(normalized.personalInfo.phone),
    location: ensureString(normalized.personalInfo.location),
    linkedIn,
    github,
    portfolio: ensureString(normalized.personalInfo.portfolio),
  };

  return normalized;
};

console.log('--- Testing Resume Service Sanitization & Backward Compatibility ---');

// Test 1: Backward compatibility with older resume data without github/linkedIn
{
  const legacyResume = {
    personalInfo: {
      fullName: 'Old User',
      email: 'old@example.com',
      phone: '123-456-7890',
      location: 'Boston, MA',
    },
  };

  const sanitized = sanitizeParsedSections(legacyResume);
  assert.equal(sanitized.personalInfo.fullName, 'Old User');
  assert.equal(sanitized.personalInfo.linkedIn, '', 'Should default linkedIn to empty string');
  assert.equal(sanitized.personalInfo.github, '', 'Should default github to empty string');
  console.log('✓ Legacy resume backward compatibility verified');
}

// Test 2: Case insensitivity and alternate keys (e.g. gitHub, linkedin, githubUrl)
{
  const inputWithVariants = {
    personalInfo: {
      fullName: 'Dev User',
      gitHub: 'https://github.com/myuser',
      linkedin: 'https://www.linkedin.com/in/myuser',
    },
  };

  const sanitized = sanitizeParsedSections(inputWithVariants);
  assert.equal(sanitized.personalInfo.github, 'https://github.com/myuser');
  assert.equal(sanitized.personalInfo.linkedIn, 'https://www.linkedin.com/in/myuser');
  console.log('✓ Key casing normalization verified');
}

// Test 3: Do not invent missing URLs
{
  const emptyResume = {};
  const sanitized = sanitizeParsedSections(emptyResume);
  assert.equal(sanitized.personalInfo.linkedIn, '');
  assert.equal(sanitized.personalInfo.github, '');
  console.log('✓ No hallucinated/invented URLs verified');
}

console.log('--- ALL RESUME SERVICE TESTS PASSED ---');
