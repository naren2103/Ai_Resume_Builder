import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';

// Strip invalid _id fields from subdocument arrays before saving.
// The client generates temporary _id values (e.g., Date.now().toString())
// that are not valid ObjectIds and cause Mongoose CastErrors.
const sanitizeSections = (sections) => {
  if (!sections) return sections;
  const cleaned = { ...sections };
  const arrayFields = ['experience', 'education', 'projects', 'certifications'];

  for (const field of arrayFields) {
    if (Array.isArray(cleaned[field])) {
      cleaned[field] = cleaned[field].map(({ _id, ...rest }) => {
        if (_id && mongoose.Types.ObjectId.isValid(_id)) {
          return { _id, ...rest };
        }
        return rest;
      });
    }
  }
  return cleaned;
};

const ensureString = (value) => {
  if (Array.isArray(value)) return value.map(ensureString).join(' ');
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const ensureStringArray = (value) => {
  if (Array.isArray(value)) return value.map(ensureString);
  if (value === undefined || value === null) return [];
  return [String(value)];
};

const sanitizeParsedSections = (sections = {}) => {
  const parsed = sections.sections || sections;
  const normalized = { ...parsed };

  normalized.personalInfo = normalized.personalInfo || {};
  normalized.personalInfo = {
    fullName: ensureString(normalized.personalInfo.fullName),
    email: ensureString(normalized.personalInfo.email),
    phone: ensureString(normalized.personalInfo.phone),
    location: ensureString(normalized.personalInfo.location),
    linkedIn: ensureString(normalized.personalInfo.linkedIn),
    portfolio: ensureString(normalized.personalInfo.portfolio),
  };

  normalized.summary = ensureString(normalized.summary);

  normalized.experience = Array.isArray(normalized.experience)
    ? normalized.experience.map((item) => ({
        company: ensureString(item.company),
        role: ensureString(item.role),
        startDate: ensureString(item.startDate),
        endDate: ensureString(item.endDate),
        current: Boolean(item.current),
        bullets: ensureStringArray(item.bullets),
      }))
    : [];

  normalized.education = Array.isArray(normalized.education)
    ? normalized.education.map((item) => ({
        institution: ensureString(item.institution),
        degree: ensureString(item.degree),
        field: ensureString(item.field),
        startDate: ensureString(item.startDate),
        endDate: ensureString(item.endDate),
        gpa: ensureString(item.gpa),
      }))
    : [];

  normalized.skills = {
    technical: ensureStringArray(normalized.skills?.technical),
    soft: ensureStringArray(normalized.skills?.soft),
    languages: ensureStringArray(normalized.skills?.languages),
  };

  normalized.projects = Array.isArray(normalized.projects)
    ? normalized.projects.map((item) => ({
        name: ensureString(item?.name),
        description: ensureString(item?.description),
        technologies: ensureStringArray(item?.technologies),
        link: ensureString(item?.link),
        bullets: ensureStringArray(item?.bullets),
      }))
    : typeof normalized.projects === 'string'
    ? [{ name: ensureString(normalized.projects), description: '', technologies: [], link: '', bullets: [] }]
    : [];

  normalized.certifications = Array.isArray(normalized.certifications)
    ? normalized.certifications.map((item) => {
        if (typeof item === 'string' || Array.isArray(item)) {
          return {
            name: ensureString(item),
            issuer: '',
            date: '',
            link: '',
          };
        }
        return {
          name: ensureString(item?.name),
          issuer: ensureString(item?.issuer),
          date: ensureString(item?.date),
          link: ensureString(item?.link),
        };
      })
    : typeof normalized.certifications === 'string'
    ? [{ name: ensureString(normalized.certifications), issuer: '', date: '', link: '' }]
    : [];

  return normalized;
};

export const createResume = async (userId, data = {}) => {
  const resume = await Resume.create({
    userId,
    title: data.title || 'Untitled Resume',
    templateId: data.templateId || 'classic',
    targetRole: data.targetRole || '',
  });
  return resume;
};

export const getResumesByUser = async (userId) => {
  const resumes = await Resume.find({ userId })
    .sort({ updatedAt: -1 })
    .select('-__v');
  return resumes;
};

export const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId }).select('-__v');
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateResume = async (resumeId, userId, updateData) => {
  if (updateData.sections) {
    updateData.sections = sanitizeSections(updateData.sections);
  }
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateSection = async (resumeId, userId, sectionName, sectionData) => {
  const arrayFields = ['experience', 'education', 'projects', 'certifications'];
  let cleanData = sectionData;
  if (arrayFields.includes(sectionName) && Array.isArray(sectionData)) {
    cleanData = sectionData.map(({ _id, ...rest }) => {
      if (_id && mongoose.Types.ObjectId.isValid(_id)) {
        return { _id, ...rest };
      }
      return rest;
    });
  }

  if (['experience', 'education', 'projects', 'certifications'].includes(sectionName)) {
    cleanData = sanitizeParsedSections({ [sectionName]: cleanData })[sectionName];
  }

  const updateKey = `sections.${sectionName}`;
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { [updateKey]: cleanData } },
    { returnDocument: 'after' }
  );
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateTemplate = async (resumeId, userId, templateId) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { templateId } },
    { returnDocument: 'after' }
  );
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const createFromUpload = async (userId, parsedSections, title = 'Uploaded Resume') => {
  const normalizedSections = sanitizeParsedSections(parsedSections);

  const resume = await Resume.create({
    userId,
    title,
    templateId: 'classic',
    sections: normalizedSections,
  });
  return resume;
};

export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};