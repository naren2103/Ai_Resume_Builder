// ============================================
// PersonalInfoForm.jsx - Personal Details Form
// ============================================
// Controlled form for name, email, phone, location,
// LinkedIn Profile URL, GitHub Profile URL, and portfolio fields.
// Includes real-time HTTPS URL validation with domain verification.
// ============================================

import { useContext } from 'react';
import { ResumeContext } from '../../context/ResumeContext.jsx';
import { validateLinkedInUrl, validateGitHubUrl } from '../../utils/urlValidator.js';

const FIELDS = [
  { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA' },
  {
    key: 'linkedIn',
    label: 'LinkedIn Profile URL',
    type: 'url',
    placeholder: 'https://www.linkedin.com/in/your-profile',
    validator: validateLinkedInUrl,
  },
  {
    key: 'github',
    label: 'GitHub Profile URL',
    type: 'url',
    placeholder: 'https://github.com/your-username',
    validator: validateGitHubUrl,
  },
  { key: 'portfolio', label: 'Portfolio', type: 'url', placeholder: 'https://yourportfolio.com' },
];

function PersonalInfoForm() {
  const { resume, updateSection } = useContext(ResumeContext);
  const personalInfo = resume.sections.personalInfo || {};

  const handleChange = (key, value) => {
    updateSection('personalInfo', { ...personalInfo, [key]: value });
  };

  const handleClearField = (key) => {
    updateSection('personalInfo', { ...personalInfo, [key]: '' });
  };

  return (
    <div className="grid-2">
      {FIELDS.map(({ key, label, type, placeholder, validator }) => {
        const val = personalInfo[key] || '';
        const validation = validator ? validator(val) : { isValid: true, error: '' };
        const hasError = !validation.isValid && val.trim() !== '';

        return (
          <div key={key} className="form-group">
            <div className="flex-between items-center mb-xs">
              <label htmlFor={`input-${key}`} className="label-text" style={{ marginBottom: 0 }}>
                {label}
              </label>
              {val && (key === 'linkedIn' || key === 'github') && (
                <button
                  type="button"
                  onClick={() => handleClearField(key)}
                  className="text-xs text-muted hover:text-danger cursor-pointer"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                  title={`Remove ${label}`}
                >
                  Clear
                </button>
              )}
            </div>
            <input
              id={`input-${key}`}
              type={type}
              value={val}
              onChange={(e) => handleChange(key, e.target.value)}
              className="input-field"
              placeholder={placeholder}
              style={hasError ? { borderColor: '#dc2626', backgroundColor: '#fef2f2' } : {}}
            />
            {hasError && (
              <span className="text-danger text-xs mt-xs block">
                {validation.error}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PersonalInfoForm;
