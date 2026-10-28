export const resumeParserPrompt = (resumeText) => `You are an expert resume parser. Extract structured data from this resume text.

RESUME TEXT:
${resumeText}

Parse the resume and extract ALL information into this EXACT JSON format:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedIn": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "professional summary text if present",
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format or empty if current",
      "current": false,
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1"],
    "languages": ["English"]
  },
  "projects": [
    {
      "name": "Project Name or Title",
      "description": "Concise summary of the project",
      "technologies": ["Technology 1", "Technology 2"],
      "link": "https://... or empty string if none",
      "bullets": [
        "Key achievement, feature built, or implementation detail 1",
        "Key achievement, feature built, or implementation detail 2"
      ]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM format",
      "link": ""
    }
  ]
}

EXTRACTION RULES:
1. PROJECTS:
- Carefully locate project sections under headings such as "Projects", "Academic Projects", "Personal Projects", "Key Projects", "Featured Projects", "Selected Projects", "Technical Projects", "Coursework Projects", or similar.
- Extract EVERY project into the "projects" array.
- For each project:
  - "name": The project title/name (e.g., "AI Resume Builder", "E-Commerce Microservices").
  - "description": A concise summary of the project's purpose and scope. If dates are mentioned (e.g., "Jan 2024 - Present"), you may include them in the description.
  - "technologies": An array of technologies, languages, frameworks, or tools used in the project.
  - "link": Project repository URL, live demo, or website URL if present (leave empty string if none).
  - "bullets": An array of bullet points, numbered items, or key accomplishments describing the project.
- Do NOT mistake projects for work experience. Corporate employment roles belong in "experience"; academic, personal, or open-source projects belong in "projects".
- Support projects written as headings followed by bullet points, numbered lists, or descriptive paragraphs.
- Preserve all projects and their original order in the resume.
- If no projects exist in the resume, return an empty array [].
2. PERSONAL INFO: Extract LinkedIn profile URL into "linkedIn" and GitHub profile URL into "github". If a URL is not present in the resume text or links, leave it as an empty string ("").
3. ACCURACY: Do NOT invent, guess, or hallucinate project names, technologies, descriptions, dates, or URLs. Only extract what is present in the resume text.
4. FORMAT: Convert dates to YYYY-MM format. If information is missing, leave as empty string or empty array. Respond ONLY with valid JSON.`;
export const bulletWriterPrompt = (data) => `You are an expert resume writer specializing in STAR-method bullet points.

CONTEXT:
- Role: ${data.role || ''} at ${data.company || ''}
- Target position: ${data.targetRole || ''}
- Job Description Keywords: ${data.jobDescription || ''}

RAW EXPERIENCE:
${data.rawExperience || ''}

RULES:
1. Write 3-5 bullet points using STAR method (Situation, Task, Action, Result)
2. Start each bullet with a strong action verb (Led, Developed, Optimized, Architected, Spearheaded, etc.)
3. Include specific metrics and numbers (%, $, time saved, users impacted)
4. If user didn't provide numbers, create realistic placeholder metrics marked with [X]
5. Tailor language to match the target position keywords
6. Each bullet should be 1-2 lines maximum
7. Use present tense for current roles, past tense for previous roles

You MUST respond with valid JSON in this exact format:
{
  "bullets": [
    "Developed and launched a React-based dashboard serving 10,000+ daily users, reducing page load time by 40%",
    "Led migration of legacy REST APIs to GraphQL, improving data fetching efficiency by 60% across 12 microservices"
  ],
  "improvementNotes": "Brief explanation of what was improved and why"
}`;


export const summaryWriterPrompt = (data) => `You are a professional resume writer crafting a compelling professional summary.

RESUME DATA:
${JSON.stringify(data.sections || {}, null, 2)}

TARGET ROLE: ${data.targetRole || ''}
JOB DESCRIPTION: ${data.jobDescription || ''}

RULES:
1. Write a 2-4 sentence professional summary
2. Highlight years of experience, key skills, and notable achievements
3. Tailor to the target role and job description keywords
4. Use confident, professional language
5. Include at least one quantifiable achievement

You MUST respond with valid JSON:
{
  "summary": "Your professional summary text here",
  "keywords_used": ["keyword1", "keyword2"]
}`;


export const atsScorerPrompt = (data) => `You are an ATS (Applicant Tracking System) expert who scores resumes.

RESUME SECTIONS:
${JSON.stringify(data.sections || {}, null, 2)}

JOB DESCRIPTION:
${data.jobDescription || ''}

TARGET ROLE: ${data.targetRole || ''}

ALGORITHMIC PRE-ANALYSIS:
${JSON.stringify(data.algorithmicResults || {}, null, 2)}

Score the resume on these 10 categories from 0-100. Provide one specific, actionable fix for each.
Use the algorithmic pre-analysis data to inform your scores where available.

You MUST respond with valid JSON in this exact format:
{
  "overall": 0,
  "breakdown": {
    "keywordMatch": { "score": 0, "fix": "specific actionable suggestion" },
    "formatting": { "score": 0, "fix": "" },
    "sectionCompleteness": { "score": 0, "fix": "" },
    "bulletQuality": { "score": 0, "fix": "" },
    "summaryStrength": { "score": 0, "fix": "" },
    "skillCoverage": { "score": 0, "fix": "" },
    "quantification": { "score": 0, "fix": "" },
    "actionVerbs": { "score": 0, "fix": "" },
    "length": { "score": 0, "fix": "" },
    "contactInfo": { "score": 0, "fix": "" }
  },
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["Top priority suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;


export const reviewerPrompt = (data) => `You are a senior career counselor reviewing a resume for a ${data.targetRole || 'General'} position.

RESUME DATA:
${JSON.stringify(data.sections || {}, null, 2)}

${data.jobDescription ? `TARGET JOB DESCRIPTION:\n${data.jobDescription}` : 'No specific job description provided.'}

Provide a comprehensive review covering:
1. Overall impression and rating
2. Section-by-section feedback
3. Common mistakes found
4. Strengths to highlight
5. Top 3 priority improvements

You MUST respond with valid JSON:
{
  "overallRating": "strong",
  "overallFeedback": "2-3 sentence overall impression",
  "sectionFeedback": {
    "personalInfo": { "rating": "strong", "feedback": "specific feedback" },
    "summary": { "rating": "good", "feedback": "" },
    "experience": { "rating": "needs-work", "feedback": "" },
    "education": { "rating": "good", "feedback": "" },
    "skills": { "rating": "strong", "feedback": "" },
    "projects": { "rating": "good", "feedback": "" }
  },
  "mistakes": ["Common mistake 1", "Common mistake 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "priorityFixes": ["Fix 1 (highest impact)", "Fix 2", "Fix 3"]
}

Valid ratings are: "strong", "good", "needs-work", "weak"`;


export const matchJobPrompt = (data) => `You are an ATS expert analyzing how well a resume matches a specific job description.

RESUME SECTIONS:
${JSON.stringify(data.sections || {}, null, 2)}

JOB DESCRIPTION:
${data.jobDescription || ''}

TARGET ROLE: ${data.targetRole || ''}

Analyze the match between resume and job description. Identify:
1. Keywords present in JD but missing from resume
2. Skills gaps
3. Experience alignment
4. Specific content changes to improve match

You MUST respond with valid JSON:
{
  "matchScore": 0,
  "matchedKeywords": ["keyword1"],
  "missingKeywords": ["keyword1"],
  "contentSuggestions": [
    {
      "section": "experience",
      "suggestion": "Add keywords X and Y to your bullet points about Z",
      "priority": "high"
    }
  ],
  "overallFeedback": "Summary of how to improve the match"
}`;


export const skillGapsPrompt = (data) => `Compare these resume skills against the job description and identify gaps.

RESUME SKILLS:
${JSON.stringify(data.skills || {}, null, 2)}

JOB DESCRIPTION:
${data.jobDescription || ''}

You MUST respond with valid JSON:
{
  "requiredSkills": ["skill1", "skill2"],
  "presentSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "recommendations": [
    {
      "skill": "skill2",
      "priority": "high",
      "suggestion": "Where and how to add this skill to the resume"
    }
  ]
}`;