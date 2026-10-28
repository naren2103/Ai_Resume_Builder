import assert from 'node:assert/strict';
import { extractProjectsFromText } from '../src/utils/projectExtractor.js';
import * as resumeService from '../src/services/resume.service.js';

console.log('--- RUNNING PROJECT EXTRACTION & SANITIZATION TESTS ---');

// Test 1: Deterministic Project Extractor on realistic formatted resume text
const sampleResumeTextWithProjects = `
John Doe
Software Engineer | john@example.com | https://linkedin.com/in/johndoe | https://github.com/johndoe

SUMMARY
Experienced Full Stack Engineer with 4 years building scalable web apps.

EXPERIENCE
Tech Solutions Inc. - Senior Developer
Jan 2022 - Present
- Architected cloud-native services using Node.js and AWS
- Improved system throughput by 40%

KEY PROJECTS
AI Document Analyzer | React, Python, FastAPI, Docker
https://github.com/johndoe/ai-document-analyzer
- Built an automated document classification pipeline processing 10k documents/day.
- Integrated OpenAI and Claude APIs for semantic chunking and extraction.
- Reduced manual processing latency by 65%.

E-Commerce Microservices Platform
Technologies: Node.js, Express, MongoDB, Redis, Kubernetes
https://ecommerce-demo.dev
- Designed distributed order processing engine handling 5,000 req/sec.
- Implemented event-driven caching with Redis Pub/Sub.

EDUCATION
University of Technology
B.S. in Computer Science (2018 - 2022)

SKILLS
JavaScript, TypeScript, Python, React, Node.js, Docker
`;

console.log('Test 1: extractProjectsFromText on multi-project text...');
const extracted = extractProjectsFromText(sampleResumeTextWithProjects);
console.log('Extracted projects count:', extracted.length);
console.log('Extracted projects:', JSON.stringify(extracted, null, 2));

assert.equal(extracted.length, 2, 'Should extract exactly 2 projects');
assert.equal(extracted[0].name, 'AI Document Analyzer');
assert.ok(extracted[0].technologies.includes('React'), 'Project 1 should include React');
assert.ok(extracted[0].technologies.includes('Python'), 'Project 1 should include Python');
assert.ok(extracted[0].technologies.includes('FastAPI'), 'Project 1 should include FastAPI');
assert.equal(extracted[0].link, 'https://github.com/johndoe/ai-document-analyzer');
assert.equal(extracted[0].bullets.length, 3, 'Project 1 should have 3 bullets');

assert.equal(extracted[1].name, 'E-Commerce Microservices Platform');
assert.ok(extracted[1].technologies.includes('Node.js'), 'Project 2 should include Node.js');
assert.ok(extracted[1].technologies.includes('Redis'), 'Project 2 should include Redis');
assert.equal(extracted[1].link, 'https://ecommerce-demo.dev');
assert.equal(extracted[1].bullets.length, 2, 'Project 2 should have 2 bullets');

console.log('✓ Test 1 passed!');

// Test 2: Resume with Academic & Personal Projects variations
const academicProjectsText = `
Jane Smith
jane@example.com

ACADEMIC PROJECTS
Smart Health Monitor - IoT & ML
https://github.com/janesmith/health-monitor
A wearable sensor platform tracking biometric signals in real time.
* Designed wearable sensor nodes using Arduino and Bluetooth LE.
* Deployed Python machine learning models predicting arrhythmia with 94% accuracy.

PERSONAL PROJECTS
Portfolio & Blog Engine (React, Next.js, Tailwind CSS)
Personal web portal featuring dynamic markdown rendering.
* Created static site generation pipeline with Next.js.
* Integrated headless CMS for real-time article publishing.
`;

console.log('Test 2: extractProjectsFromText with Academic / Personal headers...');
const academicExtracted = extractProjectsFromText(academicProjectsText);
console.log('Academic/Personal Extracted count:', academicExtracted.length);
assert.equal(academicExtracted.length, 2, 'Should extract both academic and personal projects');
assert.ok(academicExtracted[0].name.includes('Smart Health Monitor'), 'Should capture Smart Health Monitor');
assert.ok(academicExtracted[1].name.includes('Portfolio & Blog Engine'), 'Should capture Portfolio & Blog Engine');
assert.ok(academicExtracted[1].technologies.includes('Next.js') || academicExtracted[1].technologies.includes('React'), 'Should capture tech');
console.log('✓ Test 2 passed!');

// Test 3: Resume with NO projects
const noProjectsText = `
Alex Brown
alex@brown.com
EXPERIENCE
Manager at Retail Corp (2019 - 2023)
- Managed inventory and store logistics.
EDUCATION
State College - B.A. Business (2015 - 2019)
`;
console.log('Test 3: extractProjectsFromText on resume with no projects...');
const noProjectsExtracted = extractProjectsFromText(noProjectsText);
assert.equal(noProjectsExtracted.length, 0, 'Should return empty array when no projects exist');
console.log('✓ Test 3 passed!');

// Test 4: sanitizeParsedSections with AI output variations (title aliases, comma-separated strings, etc.)
console.log('Test 4: sanitizeParsedSections normalizing various AI response shapes...');
const simulatedAiResponse = {
  personalInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    linkedIn: 'https://linkedin.com/in/testuser',
    github: 'https://github.com/testuser',
  },
  summary: 'A test user summary',
  projects: [
    {
      title: 'Project Alpha', // alias for name
      techStack: 'Vue.js, Vite, Pinia', // string alias for technologies
      projectUrl: 'https://alpha.example.com', // alias for link
      highlights: ['Feature 1 built', 'Feature 2 delivered'], // alias for bullets
    },
    {
      projectName: 'Project Beta',
      technologies: ['Go', 'gRPC', 'PostgreSQL'],
      link: 'https://github.com/testuser/beta',
      description: 'High performance backend',
      bullets: ['Handled 100k QPS'],
    },
  ],
};

const sanitized = resumeService.sanitizeParsedSections(simulatedAiResponse);
assert.equal(sanitized.projects.length, 2, 'Should sanitize both projects');

assert.equal(sanitized.projects[0].name, 'Project Alpha', 'title should map to name');
assert.deepEqual(sanitized.projects[0].technologies, ['Vue.js', 'Vite', 'Pinia'], 'techStack string should be split into array');
assert.equal(sanitized.projects[0].link, 'https://alpha.example.com', 'projectUrl should map to link');
assert.deepEqual(sanitized.projects[0].bullets, ['Feature 1 built', 'Feature 2 delivered'], 'highlights should map to bullets');

assert.equal(sanitized.projects[1].name, 'Project Beta', 'projectName should map to name');
assert.deepEqual(sanitized.projects[1].technologies, ['Go', 'gRPC', 'PostgreSQL']);
assert.equal(sanitized.projects[1].link, 'https://github.com/testuser/beta');
assert.equal(sanitized.projects[1].description, 'High performance backend');
assert.deepEqual(sanitized.projects[1].bullets, ['Handled 100k QPS']);

console.log('✓ Test 4 passed!');

// Test 5: Recovery when projects are placed in experience by AI
console.log('Test 5: Recovery when projects are placed in experience...');
const misplacedProjectsAiResponse = {
  experience: [
    {
      company: 'Personal Projects',
      role: 'Full Stack Developer',
      bullets: [
        'Built real-time chat app using WebSockets and Redis',
        'Implemented end-to-end encryption with Web Crypto API',
      ],
    },
  ],
  projects: [],
};

const recovered = resumeService.sanitizeParsedSections(misplacedProjectsAiResponse);
assert.equal(recovered.projects.length, 1, 'Should recover project from experience');
assert.equal(recovered.projects[0].name, 'Full Stack Developer');
assert.equal(recovered.projects[0].bullets.length, 2);
assert.equal(recovered.experience.length, 0, 'Misplaced experience entry should be migrated');
console.log('✓ Test 5 passed!');

console.log('ALL TESTS PASSED SUCCESSFULLY!');
