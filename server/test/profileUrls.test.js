import assert from 'node:assert/strict';
import { validateLinkedInUrl, validateGitHubUrl } from '../src/utils/urlValidator.js';
import { checkFormatting } from '../src/utils/formatChecker.js';
import { calculateOverallScore } from '../src/utils/scoreCalculator.js';

console.log('--- Starting Profile URL and ATS Scoring Tests ---');

// ==========================================
// Test Suite 1: LinkedIn URL Validation
// ==========================================
console.log('\n[Suite 1] LinkedIn URL Validation');

// 1.1 Valid URLs
{
  const res1 = validateLinkedInUrl('https://www.linkedin.com/in/johndoe');
  assert.equal(res1.isValid, true, 'Should accept standard https://www.linkedin.com/in/username');
  assert.equal(res1.sanitized, 'https://www.linkedin.com/in/johndoe');

  const res2 = validateLinkedInUrl('https://linkedin.com/in/jane-doe-123/');
  assert.equal(res2.isValid, true, 'Should accept naked domain https://linkedin.com/in/...');

  const res3 = validateLinkedInUrl('https://in.linkedin.com/in/devprofile');
  assert.equal(res3.isValid, true, 'Should accept country subdomains like in.linkedin.com');

  const res4 = validateLinkedInUrl('   https://www.linkedin.com/in/trimmed-user   ');
  assert.equal(res4.isValid, true, 'Should trim whitespace');
  assert.equal(res4.sanitized, 'https://www.linkedin.com/in/trimmed-user');

  // Optional empty field
  const empty1 = validateLinkedInUrl('');
  assert.equal(empty1.isValid, true, 'Empty string is valid (optional field)');
  assert.equal(empty1.sanitized, '');

  const empty2 = validateLinkedInUrl('   ');
  assert.equal(empty2.isValid, true, 'Whitespace only is valid (treated as empty)');

  const empty3 = validateLinkedInUrl(null);
  assert.equal(empty3.isValid, true, 'null is valid');

  const empty4 = validateLinkedInUrl(undefined);
  assert.equal(empty4.isValid, true, 'undefined is valid');
}

// 1.2 Invalid URLs & Security Edge Cases
{
  // Non-HTTPS
  const httpRes = validateLinkedInUrl('http://www.linkedin.com/in/johndoe');
  assert.equal(httpRes.isValid, false, 'Should reject plain HTTP');

  // Malformed URL syntax
  const malformed = validateLinkedInUrl('not-a-url');
  assert.equal(malformed.isValid, false, 'Should reject malformed strings');

  // Unrelated domains
  const fakeDomain1 = validateLinkedInUrl('https://fake-linkedin.com/in/johndoe');
  assert.equal(fakeDomain1.isValid, false, 'Should reject fake-linkedin.com domain');

  const fakeDomain2 = validateLinkedInUrl('https://linkedin.com.attacker.com/in/johndoe');
  assert.equal(fakeDomain2.isValid, false, 'Should reject domain spoofing / attacker subdomain');

  const fakeDomain3 = validateLinkedInUrl('https://github.com/in/johndoe');
  assert.equal(fakeDomain3.isValid, false, 'Should reject GitHub URL in LinkedIn field');

  // Missing /in/ path
  const noInPath = validateLinkedInUrl('https://www.linkedin.com/company/google');
  assert.equal(noInPath.isValid, false, 'Should reject non-personal profile path');

  const rootOnly = validateLinkedInUrl('https://www.linkedin.com/');
  assert.equal(rootOnly.isValid, false, 'Should reject root linkedin.com');

  // SSRF attempts
  const ssrf1 = validateLinkedInUrl('http://169.254.169.254/latest/meta-data/');
  assert.equal(ssrf1.isValid, false, 'Should reject AWS metadata SSRF attempt');

  const ssrf2 = validateLinkedInUrl('javascript:alert(1)');
  assert.equal(ssrf2.isValid, false, 'Should reject javascript pseudo-protocol');
}
console.log('✓ LinkedIn validation tests passed!');

// ==========================================
// Test Suite 2: GitHub URL Validation
// ==========================================
console.log('\n[Suite 2] GitHub URL Validation');

// 2.1 Valid URLs
{
  const res1 = validateGitHubUrl('https://github.com/torvalds');
  assert.equal(res1.isValid, true, 'Should accept standard https://github.com/username');
  assert.equal(res1.sanitized, 'https://github.com/torvalds');

  const res2 = validateGitHubUrl('https://www.github.com/octocat/');
  assert.equal(res2.isValid, true, 'Should accept www.github.com/username');

  const res3 = validateGitHubUrl('   https://github.com/my-name-123   ');
  assert.equal(res3.isValid, true, 'Should trim whitespace');
  assert.equal(res3.sanitized, 'https://github.com/my-name-123');

  // Optional empty field
  assert.equal(validateGitHubUrl('').isValid, true, 'Empty string is valid');
  assert.equal(validateGitHubUrl('   ').isValid, true, 'Whitespace is valid');
  assert.equal(validateGitHubUrl(null).isValid, true, 'null is valid');
}

// 2.2 Invalid URLs & Security Edge Cases
{
  // Non-HTTPS
  const httpRes = validateGitHubUrl('http://github.com/torvalds');
  assert.equal(httpRes.isValid, false, 'Should reject plain HTTP');

  // Malformed URL
  assert.equal(validateGitHubUrl('random_text').isValid, false);

  // Unrelated / spoofed domains
  assert.equal(validateGitHubUrl('https://fakegithub.com/torvalds').isValid, false, 'Should reject fake domain');
  assert.equal(validateGitHubUrl('https://github.com.attacker.com/torvalds').isValid, false, 'Should reject subdomain attack');
  assert.equal(validateGitHubUrl('https://gitlab.com/username').isValid, false, 'Should reject gitlab.com');
  assert.equal(validateGitHubUrl('https://linkedin.com/in/user').isValid, false, 'Should reject LinkedIn URL in GitHub field');

  // Missing username
  assert.equal(validateGitHubUrl('https://github.com').isValid, false, 'Should reject root URL without username');
  assert.equal(validateGitHubUrl('https://github.com/').isValid, false, 'Should reject root slash without username');

  // SSRF attempts
  assert.equal(validateGitHubUrl('http://localhost:5000/api').isValid, false, 'Should reject localhost SSRF');
  assert.equal(validateGitHubUrl('file:///etc/passwd').isValid, false, 'Should reject file:// protocol');
}
console.log('✓ GitHub validation tests passed!');

// ==========================================
// Test Suite 3: ATS Scoring & Missing Profile Links
// ==========================================
console.log('\n[Suite 3] ATS Scoring & Contact Info Analysis');

// 3.1 Candidate with full contact info (name, email, phone, location) WITHOUT LinkedIn or GitHub
{
  const sectionsWithoutLinks = {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555-123-4567',
      location: 'New York, NY',
      linkedIn: '',
      github: '',
    },
    summary: 'Senior developer with 8 years of experience.',
    experience: [{ company: 'Acme', role: 'Dev', bullets: ['Led project delivering 20% growth'] }],
    education: [{ institution: 'State Univ', degree: 'BS' }],
    skills: { technical: ['JavaScript', 'Node.js'], soft: [], languages: [] },
  };

  const results = checkFormatting(sectionsWithoutLinks);
  assert.equal(
    results.contactInfo,
    100,
    'Candidate with complete contact info (name, email, phone, location) should receive 100% without penalty for missing LinkedIn or GitHub'
  );
}

// 3.2 Candidate with profile link instead of location
{
  const sectionsWithLink = {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555-123-4567',
      location: '',
      linkedIn: 'https://www.linkedin.com/in/janedoe',
      github: '',
    },
  };
  const results = checkFormatting(sectionsWithLink);
  assert.equal(results.contactInfo, 100, 'Profile link completes contact info score up to 100%');
}

// 3.3 Adding both URLs does NOT exceed 100% or inflate score
{
  const sectionsWithBoth = {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555-123-4567',
      location: 'New York, NY',
      linkedIn: 'https://www.linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe',
    },
  };
  const results = checkFormatting(sectionsWithBoth);
  assert.equal(results.contactInfo, 100, 'Adding both links does not exceed 100%');

  // Verify overall score calculation preserves weights
  const overall = calculateOverallScore({
    keywordMatch: 80,
    bulletQuality: 80,
    formatting: 90,
    sectionCompleteness: 90,
    summaryStrength: 80,
    skillCoverage: 80,
    quantification: 70,
    actionVerbs: 80,
    length: 100,
    contactInfo: results.contactInfo,
  });
  assert(overall >= 80 && overall <= 85, 'Overall score maintains established category weighting');
}

// 3.4 Missing essential fields (e.g. phone or email) scales down properly
{
  const missingPhone = {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      location: 'New York, NY',
      linkedIn: 'https://www.linkedin.com/in/janedoe',
    },
  };
  const results = checkFormatting(missingPhone);
  assert.equal(results.contactInfo, 80, 'Missing phone reduces score (30 name + 35 email + 15 extra = 80)');
}
console.log('✓ ATS Scoring & Contact Info tests passed!');

console.log('\n--- ALL TEST SUITES PASSED SUCCESSFULLY ---');
