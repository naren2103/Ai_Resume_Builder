// ============================================
// projectExtractor.js - Fallback Projects Extractor
// ============================================
// Deterministically parses project entries from raw resume text
// when the AI parser returns an empty list or misses the section.
// Supports diverse formats: headings, bullets, tech tags, links, and dates.
// Does NOT invent or fabricate any project data.
// ============================================

const MAJOR_SECTIONS_REGEX = /(?:^|\n)\s*(?:###?\s*)?(?:(?:academic|personal|key|featured|selected|technical|coursework|notable|independent|side)\s+projects?|projects|work\s+experience|experience|employment|education|skills|technical\s+skills|certifications?|licenses?|achievements?|awards?|publications?|languages?|interests?)\b[^\n]*/gi;

const SECTION_HEADER_PATTERN = /^(?:###?\s*)?(?:(?:academic|personal|key|featured|selected|technical|coursework|notable|independent|side)\s+)?projects?\s*[:\-]?$/i;

/**
 * Extracts all slices of text corresponding to Projects sections.
 * @param {string} text
 * @returns {string[]}
 */
export const extractProjectSectionSlices = (text) => {
  if (!text || typeof text !== 'string') return [];

  const matches = [];
  let m;
  while ((m = MAJOR_SECTIONS_REGEX.exec(text)) !== null) {
    matches.push({
      header: m[0].trim(),
      index: m.index,
      length: m[0].length,
    });
  }

  if (matches.length === 0) {
    // If no major sections matched, check if simple "Projects" is somewhere
    const simpleMatch = text.match(/(?:^|\n)\s*(?:###?\s*)?(?:[a-zA-Z\s]+)?projects\b[^\n]*/i);
    if (!simpleMatch || simpleMatch.index === undefined) return [];
    const start = simpleMatch.index + simpleMatch[0].length;
    return [text.slice(start).trim()];
  }

  const projectSlices = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    if (/projects/i.test(current.header)) {
      const sliceStart = current.index + current.length;
      const sliceEnd = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const slice = text.slice(sliceStart, sliceEnd).trim();
      if (slice) {
        projectSlices.push(slice);
      }
    }
  }

  return projectSlices;
};

/**
 * Backwards-compatible single section text extractor.
 * @param {string} text
 * @returns {string}
 */
export const extractProjectSectionText = (text) => {
  const slices = extractProjectSectionSlices(text);
  return slices.join('\n\n');
};

/**
 * Extracts clean technologies from a line or segment.
 * e.g., "React, Node.js, Express | MongoDB" or "(Python, Flask, Docker)"
 * @param {string} str
 * @returns {string[]}
 */
export const parseTechList = (str) => {
  if (!str) return [];
  return str
    .replace(/^(technologies|tech stack|tools|skills|built with|built using)\s*[:\-]\s*/i, '')
    .split(/[,|/•]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 35 && !/^\d+$/.test(s));
};

/**
 * Parses projects from raw resume text.
 * @param {string} resumeText
 * @returns {Array<{ name: string, description: string, technologies: string[], link: string, bullets: string[] }>}
 */
export const extractProjectsFromText = (resumeText) => {
  const slices = extractProjectSectionSlices(resumeText);
  if (slices.length === 0) return [];

  const projects = [];

  const isBulletLine = (line) => /^([•\-*▪]|\d+\.)\s+/.test(line);

  const isHeadingMarker = (line) => SECTION_HEADER_PATTERN.test(line);

  const isHeaderLine = (line) => {
    if (isBulletLine(line)) return false;
    if (isHeadingMarker(line)) return false;
    if (/^https?:\/\/[^\s]+$/i.test(line)) return false;
    if (/^(technologies|tech stack|tools|skills|built with|description|overview)\s*[:\-]/i.test(line)) return false;
    // Common header indicators
    if (line.includes('|') || line.includes('–') || line.includes(' - ')) return true;
    if (line.includes('(') && line.includes(')')) return true;
    if (line.length < 75 && !line.endsWith('.')) return true;
    return false;
  };

  for (const sectionText of slices) {
    const rawLines = sectionText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let currentProject = null;

    const flushCurrent = () => {
      if (currentProject && (currentProject.name || currentProject.bullets.length > 0 || currentProject.description)) {
        if (!currentProject.name && currentProject.description) {
          currentProject.name = currentProject.description;
          currentProject.description = '';
        }
        if (currentProject.name && !SECTION_HEADER_PATTERN.test(currentProject.name)) {
          projects.push({ ...currentProject });
        }
      }
      currentProject = null;
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // If the line is an internal section heading (like "PERSONAL PROJECTS"), flush and skip
      if (isHeadingMarker(line)) {
        flushCurrent();
        continue;
      }

      // Check for standalone URL line
      if (/^https?:\/\/[^\s]+$/i.test(line)) {
        if (currentProject && !currentProject.link) {
          currentProject.link = line;
        }
        continue;
      }

      // Check for inline URL
      const urlMatch = line.match(/https?:\/\/[^\s)]+/i);
      const lineUrl = urlMatch ? urlMatch[0] : '';
      const cleanLine = urlMatch ? line.replace(urlMatch[0], '').replace(/[()]/g, '').trim() : line;

      if (isHeaderLine(line) && (!currentProject || currentProject.bullets.length > 0 || currentProject.description)) {
        flushCurrent();

        let projectName = cleanLine;
        let projectTech = [];

        // Check format "Name | Tech1, Tech2 | Date"
        if (cleanLine.includes('|')) {
          const parts = cleanLine.split('|').map((p) => p.trim());
          projectName = parts[0];
          for (let p = 1; p < parts.length; p++) {
            const part = parts[p];
            if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(part)) {
              // date part, ignore
            } else {
              projectTech.push(...parseTechList(part));
            }
          }
        } else if (cleanLine.includes('(') && cleanLine.endsWith(')')) {
          // e.g. "Project Name (React, Node.js)"
          const parenMatch = cleanLine.match(/^(.*?)\s*\((.*?)\)$/);
          if (parenMatch) {
            projectName = parenMatch[1].trim();
            projectTech.push(...parseTechList(parenMatch[2]));
          }
        } else if (cleanLine.includes(' - ') || cleanLine.includes(' – ')) {
          const delimiter = cleanLine.includes(' – ') ? ' – ' : ' - ';
          const parts = cleanLine.split(delimiter).map((p) => p.trim());
          projectName = parts[0];
          if (parts.length > 1 && !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(parts[1])) {
            projectTech.push(...parseTechList(parts.slice(1).join(', ')));
          }
        }

        currentProject = {
          name: projectName.replace(/^[\s\-–—:]+/, '').trim(),
          description: '',
          technologies: projectTech,
          link: lineUrl,
          bullets: [],
        };
      } else if (isBulletLine(line)) {
        const cleanBullet = line.replace(/^([•\-*▪]|\d+\.)\s+/, '').trim();
        if (!currentProject) {
          currentProject = {
            name: 'Project',
            description: '',
            technologies: [],
            link: lineUrl,
            bullets: [],
          };
        }
        if (lineUrl && !currentProject.link) {
          currentProject.link = lineUrl;
        }
        if (cleanBullet) {
          currentProject.bullets.push(cleanBullet);
        }
      } else if (/^(technologies|tech stack|tools|skills|built with)\s*[:\-]/i.test(line)) {
        if (currentProject) {
          const tech = parseTechList(line);
          currentProject.technologies = Array.from(new Set([...currentProject.technologies, ...tech]));
        }
      } else {
        // Descriptive text / paragraph
        if (currentProject) {
          if (!currentProject.description) {
            currentProject.description = line;
          } else {
            currentProject.bullets.push(line);
          }
          if (lineUrl && !currentProject.link) {
            currentProject.link = lineUrl;
          }
        }
      }
    }

    flushCurrent();
  }

  return projects;
};
