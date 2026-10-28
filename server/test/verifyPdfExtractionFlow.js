import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import extractTextFromPdf from '../src/utils/resumeParser.js';
import { extractProjectsFromText } from '../src/utils/projectExtractor.js';
import { sanitizeParsedSections } from '../src/services/resume.service.js';

console.log('--- VERIFYING END-TO-END PDF EXTRACTION FLOW ---');

const pdfPath = path.resolve('server/test/test_resume_with_projects.pdf');
const pdfBuffer = fs.readFileSync(pdfPath);

console.log('Stage 1: Extracting text from PDF via resumeParser...');
const extractedText = await extractTextFromPdf(pdfBuffer);
console.log('Extracted Text:\n--------------------\n' + extractedText + '\n--------------------');

// Verification 1: Extracted text contains project titles and details
assert.ok(extractedText.includes('PROJECTS'), 'PDF text must contain PROJECTS section heading');
assert.ok(extractedText.includes('Cloud Stream Analytics'), 'PDF text must contain project 1 title');
assert.ok(extractedText.includes('Healthcare Patient Portal'), 'PDF text must contain project 2 title');
assert.ok(extractedText.includes('Processed real-time telemetry'), 'PDF text must contain project 1 bullet');
assert.ok(extractedText.includes('Developed HIPAA-compliant'), 'PDF text must contain project 2 bullet');
console.log('✓ Stage 1 Passed: PDF text extraction preserved project titles, headings, and bullets.');

// Verification 2: Project extraction from the extracted PDF text
console.log('Stage 2: Parsing projects from extracted text...');
const parsedProjects = extractProjectsFromText(extractedText);
console.log('Extracted Projects count:', parsedProjects.length);
console.log(JSON.stringify(parsedProjects, null, 2));

assert.equal(parsedProjects.length, 2, 'Should extract exactly 2 projects from the PDF');
assert.equal(parsedProjects[0].name, 'Cloud Stream Analytics');
assert.ok(parsedProjects[0].technologies.includes('Kafka') || parsedProjects[0].technologies.includes('Flink') || parsedProjects[0].technologies.includes('React'), 'Should have technologies for Project 1');
assert.equal(parsedProjects[0].link, 'https://github.com/alicemorgan/cloud-stream');
assert.ok(parsedProjects[0].bullets.length >= 2, 'Project 1 should have bullets');

assert.equal(parsedProjects[1].name, 'Healthcare Patient Portal');
assert.ok(parsedProjects[1].technologies.includes('Node.js') || parsedProjects[1].technologies.includes('Express') || parsedProjects[1].technologies.includes('MongoDB'), 'Should have technologies for Project 2');
assert.equal(parsedProjects[1].link, 'https://patient-portal.med.org');
assert.ok(parsedProjects[1].bullets.length >= 2, 'Project 2 should have bullets');
console.log('✓ Stage 2 Passed: Projects accurately extracted from PDF text.');

// Verification 3: Sanitization and schema mapping
console.log('Stage 3: Testing schema normalization & sanitization...');
const normalized = sanitizeParsedSections({
  personalInfo: {
    fullName: 'Alice Morgan',
    email: 'alice@example.com',
    linkedIn: 'https://linkedin.com/in/alicemorgan',
    github: 'https://github.com/alicemorgan',
  },
  projects: parsedProjects,
});

assert.equal(normalized.projects.length, 2);
for (const p of normalized.projects) {
  assert.ok(typeof p.name === 'string' && p.name.length > 0, 'Project name must be a non-empty string');
  assert.ok(Array.isArray(p.technologies), 'Project technologies must be an array');
  assert.ok(typeof p.link === 'string', 'Project link must be a string');
  assert.ok(Array.isArray(p.bullets), 'Project bullets must be an array');
  assert.ok(typeof p.description === 'string', 'Project description must be a string');
}
console.log('✓ Stage 3 Passed: Schema matches application project model.');

// Verification 4: Empty project case
console.log('Stage 4: Testing resume without projects...');
const emptyResumeNormalized = sanitizeParsedSections({
  personalInfo: { fullName: 'Bob No Projects' },
  projects: [],
});
assert.equal(emptyResumeNormalized.projects.length, 0);
assert.ok(Array.isArray(emptyResumeNormalized.projects));
console.log('✓ Stage 4 Passed: Empty projects array handled safely without error.');

console.log('ALL PDF EXTRACTION VERIFICATION STAGES PASSED!');
