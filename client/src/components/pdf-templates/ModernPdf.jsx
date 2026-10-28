// ============================================
// ModernPdf.jsx - Modern Tech Template for PDF Export
// ============================================
// React-PDF version of ModernTemplate.
// Two-column layout with dark sidebar using View + flex.
// ============================================

import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function ModernPdf({ sections, colors }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const styles = StyleSheet.create({
    container: { flexDirection: 'column', fontFamily: 'Helvetica', fontSize: 10, color: colors.text, minHeight: '100%' },
    header: { padding: '24 36 14', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' },
    name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: colors.primary, letterSpacing: -0.5, textAlign: 'center' },
    contactLine: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 3 },
    contactText: { fontSize: 8.5, color: '#64748b' },
    dividerDot: { fontSize: 8.5, color: '#cbd5e1', marginHorizontal: 5 },
    link: { fontSize: 8.5, color: colors.accent, textDecoration: 'underline' },
    bodyRow: { flexDirection: 'row', flex: 1 },
    // Left sidebar
    sidebar: { width: '35%', backgroundColor: colors.primary, padding: 18, color: '#ffffff' },
    avatar: {
      width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent,
      alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    },
    initials: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    sidebarLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, marginBottom: 6 },
    sidebarSection: { marginBottom: 14 },
    pill: { fontSize: 7, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', marginRight: 4, marginBottom: 4 },
    pillOutline: { fontSize: 7, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff', marginRight: 4, marginBottom: 4 },
    // Right content
    content: { width: '65%', padding: 20, backgroundColor: '#ffffff' },
    sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 2, color: colors.accent, marginBottom: 6 },
    section: { marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    light: { fontSize: 8, color: '#94a3b8' },
    small: { fontSize: 8, color: '#64748b' },
    text: { fontSize: 10, lineHeight: 1.5, color: '#475569' },
    bulletItem: { flexDirection: 'row', marginLeft: 10, marginTop: 2 },
    bulletDot: { width: 8, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.5, color: '#475569' },
    techPill: { fontSize: 7, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, backgroundColor: colors.light, color: colors.accent, marginRight: 3, marginBottom: 3 },
  });

  return (
    <View style={styles.container}>
      {/* Centered Top Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Full Name'}</Text>

        {/* Line 1: Email & Phone */}
        {(personalInfo.email || personalInfo.phone) ? (
          <View style={styles.contactLine}>
            {personalInfo.email ? <Text style={styles.contactText}>{personalInfo.email}</Text> : null}
            {personalInfo.email && personalInfo.phone ? <Text style={styles.dividerDot}>•</Text> : null}
            {personalInfo.phone ? <Text style={styles.contactText}>{personalInfo.phone}</Text> : null}
          </View>
        ) : null}

        {/* Line 2: Location */}
        {personalInfo.location ? (
          <View style={styles.contactLine}>
            <Text style={styles.contactText}>{personalInfo.location}</Text>
          </View>
        ) : null}

        {/* Line 3: LinkedIn & GitHub (and Portfolio) */}
        {(personalInfo.linkedIn || personalInfo.github || personalInfo.portfolio) ? (
          <View style={styles.contactLine}>
            {personalInfo.linkedIn ? (
              <Link src={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} style={styles.link}>LinkedIn</Link>
            ) : null}
            {personalInfo.linkedIn && (personalInfo.github || personalInfo.portfolio) ? (
              <Text style={styles.dividerDot}>•</Text>
            ) : null}
            {personalInfo.github ? (
              <Link src={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} style={styles.link}>GitHub</Link>
            ) : null}
            {personalInfo.github && personalInfo.portfolio ? (
              <Text style={styles.dividerDot}>•</Text>
            ) : null}
            {personalInfo.portfolio ? (
              <Link src={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} style={styles.link}>Portfolio</Link>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Two Column Body */}
      <View style={styles.bodyRow}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(personalInfo.fullName)}</Text>
          </View>

        {/* Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {skills.technical.map((skill, i) => (
                <Text key={i} style={styles.pill}>{skill}</Text>
              ))}
              {skills.soft.map((skill, i) => (
                <Text key={`s-${i}`} style={styles.pillOutline}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {skills.languages.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Languages</Text>
            {skills.languages.map((lang, i) => (
              <Text key={i} style={[styles.contactText, { marginBottom: 2 }]}>{lang}</Text>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Certifications</Text>
            {certifications.map((cert, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={[styles.contactText, { fontFamily: 'Helvetica-Bold', fontSize: 8 }]}>{cert.name}</Text>
                {cert.issuer && <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)' }}>{cert.issuer}</Text>}
                {cert.date && <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{cert.date}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Right Content */}
      <View style={styles.content}>
        {/* Summary */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.text}>{summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={[styles.bold, { color: colors.primary }]}>{exp.role}</Text>
                  <Text style={styles.light}>
                    {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                    {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.company && <Text style={styles.small}>{exp.company}</Text>}
                {exp.bullets && exp.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={[styles.row, { marginBottom: 4 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bold, { color: colors.primary }]}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </Text>
                  <Text style={styles.small}>
                    {edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                  </Text>
                </View>
                <Text style={styles.light}>
                  {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                  <Text style={[styles.bold, { color: colors.primary }]}>{proj.name}</Text>
                  {proj.link && <Link src={proj.link} style={styles.link}>Link</Link>}
                </View>
                {proj.description && <Text style={[styles.small, { marginTop: 1 }]}>{proj.description}</Text>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 }}>
                    {proj.technologies.map((tech, j) => (
                      <Text key={j} style={styles.techPill}>{tech}</Text>
                    ))}
                  </View>
                )}
                {proj.bullets && proj.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
      </View>
    </View>
  );
}

export default ModernPdf;
