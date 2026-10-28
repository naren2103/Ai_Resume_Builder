import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import ReactPDF, { Document, Page } from '@react-pdf/renderer';

// Import all 5 PDF templates
import ClassicPdf from '../src/components/pdf-templates/ClassicPdf.jsx';
import ModernPdf from '../src/components/pdf-templates/ModernPdf.jsx';
import CreativePdf from '../src/components/pdf-templates/CreativePdf.jsx';
import MinimalPdf from '../src/components/pdf-templates/MinimalPdf.jsx';
import ExecutivePdf from '../src/components/pdf-templates/ExecutivePdf.jsx';
import TEMPLATES from '../src/constants/templates.js';

console.log('--- TESTING ALL 5 PDF TEMPLATES WITH NEW 3-LINE CONTACT HIERARCHY ---');

const sampleResumeData = {
  personalInfo: {
    fullName: 'Alexandra Montgomery',
    email: 'alexandra.montgomery@enterprise-domain.org',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA, USA',
    linkedIn: 'https://linkedin.com/in/alexandramontgomery',
    github: 'https://github.com/alexandram',
    portfolio: 'https://alexandra.dev',
  },
  summary: 'Senior Software Engineer with 8+ years leading cloud architecture and microservices design.',
  experience: [
    {
      company: 'Apex Cloud Systems',
      role: 'Lead Architect',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bullets: [
        'Spearheaded transition to Kubernetes-based microservices architecture.',
        'Reduced infrastructure costs by 32% across multi-region AWS deployments.',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      field: 'Computer Science',
      startDate: '2013',
      endDate: '2017',
      gpa: '3.9',
    },
  ],
  skills: {
    technical: ['React', 'Node.js', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis'],
    soft: ['Team Leadership', 'Mentorship', 'Agile Architecture'],
    languages: ['English', 'Spanish'],
  },
  projects: [
    {
      name: 'Cloud Observability Suite',
      description: 'Distributed trace aggregation platform processing 50k events/sec',
      technologies: ['Go', 'gRPC', 'Kafka', 'React'],
      link: 'https://github.com/alexandram/observability',
      bullets: [
        'Built low-overhead trace collector with sub-5ms latency.',
        'Adopted by 12 internal engineering teams.',
      ],
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
};

const templateMap = {
  classic: ClassicPdf,
  modern: ModernPdf,
  creative: CreativePdf,
  minimal: MinimalPdf,
  executive: ExecutivePdf,
};

const outDir = path.resolve('test/output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const tmpl of TEMPLATES) {
  const Component = templateMap[tmpl.id];
  assert.ok(Component, `Template component for ${tmpl.id} must exist`);

  console.log(`Testing PDF rendering for template: ${tmpl.name} (${tmpl.id})...`);
  const docElement = React.createElement(
    Document,
    { title: 'Resume Test', author: sampleResumeData.personalInfo.fullName },
    React.createElement(
      Page,
      { size: 'A4', style: { backgroundColor: '#ffffff' } },
      React.createElement(Component, { sections: sampleResumeData, colors: tmpl.colors })
    )
  );

  const outPath = path.join(outDir, `export_${tmpl.id}_test.pdf`);
  await ReactPDF.renderToFile(docElement, outPath);
  assert.ok(fs.existsSync(outPath), `PDF file must be created for ${tmpl.id}`);
  const stats = fs.statSync(outPath);
  assert.ok(stats.size > 1000, `PDF file for ${tmpl.id} should have substantial content (got ${stats.size} bytes)`);
  console.log(`✓ ${tmpl.name} rendered successfully (${stats.size} bytes)`);
}

// Test edge case: Candidate with long contact values & missing optional fields
console.log('Testing edge case: Long email, missing phone & missing location...');
const edgeCaseData = {
  ...sampleResumeData,
  personalInfo: {
    fullName: 'Christopher Bartholomew Van-Der-Bilt',
    email: 'christopher.bartholomew.vanderbilt.extraordinary.consultant@worldwide-enterprise-solutions-corp.com',
    phone: '',
    location: '',
    linkedIn: 'https://linkedin.com/in/christophervanderbilt',
    github: '',
    portfolio: 'https://portfolio.christopher.me',
  },
};

for (const tmpl of TEMPLATES) {
  const Component = templateMap[tmpl.id];
  const docElement = React.createElement(
    Document,
    { title: 'Resume Edge Test', author: edgeCaseData.personalInfo.fullName },
    React.createElement(
      Page,
      { size: 'A4', style: { backgroundColor: '#ffffff' } },
      React.createElement(Component, { sections: edgeCaseData, colors: tmpl.colors })
    )
  );

  const outPath = path.join(outDir, `export_${tmpl.id}_edge_test.pdf`);
  await ReactPDF.renderToFile(docElement, outPath);
  assert.ok(fs.existsSync(outPath));
}
console.log('✓ Edge cases rendered successfully across all 5 templates');

console.log('ALL PDF TEMPLATE TESTS COMPLETED SUCCESSFULLY!');
