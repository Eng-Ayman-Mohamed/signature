import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { db } from '@/lib/db';

// Register Helvetica font (built-in)
Font.register({
  family: 'Helvetica',
});

// Create dynamic styles based on accent color
const createStyles = (accentColor: string) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      fontFamily: 'Helvetica',
      lineHeight: 1.3,
    },
    // Header Section - Centered
    header: {
      marginBottom: 8,
      textAlign: 'center',
    },
    name: {
      fontSize: 26,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 10,
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 3,
      marginTop: 3,
    },
    contactItem: {
      fontSize: 10,
      color: '#333333',
    },
    contactLink: {
      fontSize: 10,
      color: '#333333',
    },
    contactSeparator: {
      fontSize: 10,
      color: '#666666',
      marginHorizontal: 1,
    },
    // Divider
    divider: {
      height: 1,
      backgroundColor: accentColor,
      marginTop: 8,
      marginBottom: 8,
    },
    // Section Styles
    section: {
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    // Summary
    summaryText: {
      fontSize: 10,
      color: '#333333',
      lineHeight: 1.4,
    },
    // Experience Item
    experienceItem: {
      marginBottom: 6,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 1,
    },
    experienceTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#333333',
    },
    experienceDate: {
      fontSize: 10,
      color: '#666666',
    },
    experienceCompany: {
      fontSize: 10,
      color: '#333333',
      marginBottom: 2,
    },
    experienceDescription: {
      fontSize: 10,
      color: '#333333',
      lineHeight: 1.3,
      marginLeft: 8,
    },
    // Education Item
    educationItem: {
      marginBottom: 6,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 1,
    },
    educationDegree: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#333333',
    },
    educationDate: {
      fontSize: 10,
      color: '#666666',
    },
    educationSchool: {
      fontSize: 10,
      color: '#333333',
    },
    educationField: {
      fontSize: 10,
      color: '#666666',
    },
    educationDescription: {
      fontSize: 10,
      color: '#333333',
      lineHeight: 1.3,
      marginLeft: 8,
    },
    // Project Item
    projectItem: {
      marginBottom: 6,
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 1,
    },
    projectTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#333333',
    },
    projectMeta: {
      flexDirection: 'row',
      gap: 6,
    },
    projectMetaItem: {
      fontSize: 10,
      color: '#666666',
    },
    projectDescription: {
      fontSize: 10,
      color: '#333333',
      lineHeight: 1.3,
      marginLeft: 8,
    },
    // Skills - Simple text layout
    skillsCategory: {
      marginBottom: 3,
    },
    skillsCategoryTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#333333',
    },
    skillsText: {
      fontSize: 10,
      color: '#333333',
      lineHeight: 1.3,
    },
    skillsBulletItem: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    bullet: {
      fontSize: 10,
      color: '#333333',
    },
  });

// Helper function to format date
const formatDate = (dateStr: string): string => {
  try {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = parseInt(parts[1]) - 1;
      const year = parts[0];
      return `${months[month] || ''} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// Helper to clean text (remove unwanted characters)
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<[""'']/g, '')           // Remove < followed by any quote (regular or smart)
    .replace(/<[^\w\s]/g, '')          // Remove < followed by any non-word, non-space char
    .replace(/\s*<\s*$/g, '')          // Remove trailing < with optional whitespace
    .replace(/\s*\.\s*\.\s*$/g, '.')   // Fix double periods
    .replace(/\s+$/g, '')              // Remove trailing whitespace
    .replace(/\s{2,}/g, ' ')           // Normalize multiple spaces to single space
    .trim();
};

// Create PDF Document component
function ResumeDocument({ user, portfolio, accentColor }: { user: any; portfolio: any; accentColor: string }) {
  const styles = createStyles(accentColor);
  const content = portfolio?.content || {};
  const experiences = portfolio?.experiences || [];
  const educations = portfolio?.educations || [];
  const projects = portfolio?.projects || [];
  const skills = portfolio?.skills || [];

  // Group skills by category
  const technicalSkills = skills.filter((s: any) => s.category === 'technical');
  const softSkills = skills.filter((s: any) => s.category === 'soft');
  const toolSkills = skills.filter((s: any) => s.category === 'tools');

  // Get URLs
  const githubUrl = content?.githubUrl || (user?.githubLogin ? `https://github.com/${user.githubLogin}` : null);
  const websiteUrl = content?.websiteUrl || user?.blog || null;

  // Build contact items with bullet separators
  const contactItems: { text: string; link?: string }[] = [];
  if (user?.email) contactItems.push({ text: user.email, link: `mailto:${user.email}` });
  if (user?.location) contactItems.push({ text: user.location });
  if (content?.linkedinUrl) contactItems.push({ text: 'LinkedIn', link: content.linkedinUrl });
  if (githubUrl) contactItems.push({ text: 'GitHub', link: githubUrl });
  if (websiteUrl) contactItems.push({ text: 'Personal Website', link: websiteUrl });

  // Clean summary text
  const summaryText = cleanText(content?.aboutText || '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Centered */}
        <View style={styles.header}>
          <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {index > 0 && <Text style={styles.contactSeparator}>•</Text>}
                {item.link ? (
                  <Link style={styles.contactLink} src={item.link}>
                    {item.text}
                  </Link>
                ) : (
                  <Text style={styles.contactItem}>{item.text}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {summaryText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experiences.map((exp: any, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{exp.role}</Text>
                  <Text style={styles.experienceDate}>
                    {formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.experienceCompany}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ''}
                </Text>
                {exp.description && (
                  <Text style={styles.experienceDescription}>• {exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {experiences.length > 0 && (educations.length > 0 || projects.length > 0 || skills.length > 0) && (
          <View style={styles.divider} />
        )}

        {/* Education */}
        {educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {educations.map((edu: any, index: number) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationDegree}>{edu.degree}</Text>
                  <Text style={styles.educationDate}>
                    {formatDate(edu.startDate)} – {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.educationSchool}>{edu.institution}</Text>
                {edu.field && <Text style={styles.educationField}>{edu.field}</Text>}
                {edu.description && (
                  <Text style={styles.educationDescription}>• {edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {educations.length > 0 && (projects.length > 0 || skills.length > 0) && (
          <View style={styles.divider} />
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.slice(0, 5).map((proj: any, index: number) => {
              const projectUrl = proj.url || proj.githubUrl || null;
              return (
                <View key={index} style={styles.projectItem}>
                  <View style={styles.projectHeader}>
                    {projectUrl ? (
                      <Link style={styles.projectTitle} src={projectUrl}>
                        {proj.title}
                      </Link>
                    ) : (
                      <Text style={styles.projectTitle}>{proj.title}</Text>
                    )}
                    <View style={styles.projectMeta}>
                      {proj.githubStars !== null && proj.githubStars !== undefined && (
                        <Text style={styles.projectMetaItem}>★ {proj.githubStars}</Text>
                      )}
                      {proj.githubLanguage && (
                        <Text style={styles.projectMetaItem}>{proj.githubLanguage}</Text>
                      )}
                    </View>
                  </View>
                  {proj.description && (
                    <Text style={styles.projectDescription}>• {proj.description}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {projects.length > 0 && skills.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* Skills - Simple text layout */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {technicalSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>• </Text>
                  <Text style={styles.skillsCategoryTitle}>Technical Skills: </Text>
                  <Text style={styles.skillsText}>
                    {technicalSkills.map((s: any) => s.name).join(' • ')}
                  </Text>
                </View>
              </View>
            )}
            
            {toolSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>• </Text>
                  <Text style={styles.skillsCategoryTitle}>Tools & Technologies: </Text>
                  <Text style={styles.skillsText}>
                    {toolSkills.map((s: any) => s.name).join(' • ')}
                  </Text>
                </View>
              </View>
            )}
            
            {softSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>• </Text>
                  <Text style={styles.skillsCategoryTitle}>Soft Skills: </Text>
                  <Text style={styles.skillsText}>
                    {softSkills.map((s: any) => s.name).join(' • ')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const portfolio = await db.portfolio.findUnique({
      where: { userId },
      include: {
        content: true,
        projects: { orderBy: { displayOrder: 'asc' } },
        experiences: { orderBy: { displayOrder: 'asc' } },
        educations: { orderBy: { displayOrder: 'asc' } },
        skills: { orderBy: { displayOrder: 'asc' } },
      },
    });

    // Get accent color from portfolio or default
    const accentColor = portfolio?.accentColor || '#10b981';

    const doc = <ResumeDocument user={user} portfolio={portfolio} accentColor={accentColor} />;
    const stream = await renderToStream(doc);
    
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${user.username || 'resume'}-resume.pdf"`,
      },
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 });
  }
}
