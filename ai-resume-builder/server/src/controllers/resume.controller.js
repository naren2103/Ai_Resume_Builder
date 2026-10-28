import * as resumeService from '../services/resume.service.js';
import extractTextFromPdf from '../utils/resumeParser.js';
import * as aiService from '../services/ai.service.js';
import { validateLinkedInUrl, validateGitHubUrl } from '../utils/urlValidator.js';
import { extractProjectsFromText } from '../utils/projectExtractor.js';

export const createResume = async (req, res, next) => {
  try {
    if (req.body.sections?.personalInfo) {
      const p = req.body.sections.personalInfo;
      if (p.linkedIn !== undefined) {
        const check = validateLinkedInUrl(p.linkedIn);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.linkedIn = check.sanitized;
      }
      if (p.github !== undefined || p.gitHub !== undefined) {
        const rawGithub = p.github !== undefined ? p.github : p.gitHub;
        const check = validateGitHubUrl(rawGithub);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.github = check.sanitized;
      }
    }

    const resume = await resumeService.createResume(req.user._id, req.body);
    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getResumesByUser(req.user._id);
    return res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    if (req.body.sections?.personalInfo) {
      const p = req.body.sections.personalInfo;
      if (p.linkedIn !== undefined) {
        const check = validateLinkedInUrl(p.linkedIn);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.linkedIn = check.sanitized;
      }
      if (p.github !== undefined || p.gitHub !== undefined) {
        const rawGithub = p.github !== undefined ? p.github : p.gitHub;
        const check = validateGitHubUrl(rawGithub);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.github = check.sanitized;
      }
    }

    const resume = await resumeService.updateResume(req.params.id, req.user._id, req.body);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, message: `Invalid section: ${section}` });
    }

    if (section === 'personalInfo' && req.body.data) {
      const p = req.body.data;
      if (p.linkedIn !== undefined) {
        const check = validateLinkedInUrl(p.linkedIn);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.linkedIn = check.sanitized;
      }
      if (p.github !== undefined || p.gitHub !== undefined) {
        const rawGithub = p.github !== undefined ? p.github : p.gitHub;
        const check = validateGitHubUrl(rawGithub);
        if (!check.isValid) {
          return res.status(400).json({ success: false, message: check.error });
        }
        p.github = check.sanitized;
      }
    }

    const resume = await resumeService.updateSection(req.params.id, req.user._id, section, req.body.data);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.body;
    const validTemplates = ['classic', 'modern', 'creative', 'minimal', 'executive'];
    if (!validTemplates.includes(templateId)) {
      return res.status(400).json({ success: false, message: `Invalid template: ${templateId}` });
    }

    const resume = await resumeService.updateTemplate(req.params.id, req.user._id, templateId);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    await resumeService.deleteResume(req.params.id, req.user._id);
    return res.json({ success: true, data: { message: 'Resume deleted successfully' } });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const extractedText = await extractTextFromPdf(req.file.buffer);
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please try a different file.' });
    }

    let parsedSections = {};
    try {
      parsedSections = await aiService.parseResume({ resumeText: extractedText });
    } catch {
      parsedSections = {};
    }

    // Ensure parsedSections structure
    if (!parsedSections || typeof parsedSections !== 'object') {
      parsedSections = {};
    }
    parsedSections.personalInfo = parsedSections.personalInfo || {};

    // Validate any URLs AI parsed; if AI produced invalid or hallucinated URLs, clear them
    if (parsedSections.personalInfo.linkedIn) {
      const check = validateLinkedInUrl(parsedSections.personalInfo.linkedIn);
      parsedSections.personalInfo.linkedIn = check.isValid ? check.sanitized : '';
    }
    if (parsedSections.personalInfo.github) {
      const check = validateGitHubUrl(parsedSections.personalInfo.github);
      parsedSections.personalInfo.github = check.isValid ? check.sanitized : '';
    }

    // Fallback extraction from raw extracted text / annotations if AI missed them
    if (!parsedSections.personalInfo.linkedIn) {
      const linkedInMatch = extractedText.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-%.]+/i)
        || extractedText.match(/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-%.]+/i);
      if (linkedInMatch) {
        const candidate = linkedInMatch[0].startsWith('http') ? linkedInMatch[0] : `https://${linkedInMatch[0]}`;
        const check = validateLinkedInUrl(candidate);
        if (check.isValid) {
          parsedSections.personalInfo.linkedIn = check.sanitized;
        }
      }
    }

    if (!parsedSections.personalInfo.github) {
      const githubMatch = extractedText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_\-]+/i)
        || extractedText.match(/(?:www\.)?github\.com\/[a-zA-Z0-9_\-]+/i);
      if (githubMatch) {
        const candidate = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
        const check = validateGitHubUrl(candidate);
        if (check.isValid) {
          parsedSections.personalInfo.github = check.sanitized;
        }
      }
    }

    // Fallback extraction for Projects if AI omitted them or returned an empty array
    if (!Array.isArray(parsedSections.projects) || parsedSections.projects.length === 0) {
      const fallbackProjects = extractProjectsFromText(extractedText);
      if (fallbackProjects && fallbackProjects.length > 0) {
        parsedSections.projects = fallbackProjects;
      }
    }

    const resume = await resumeService.createFromUpload(req.user._id, parsedSections);
    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};