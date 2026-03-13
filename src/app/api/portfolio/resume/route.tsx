import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import { db } from "@/lib/db";

// Register Helvetica font (built-in)
Font.register({
  family: "Helvetica",
});

// ATS: Validate hex color to prevent StyleSheet.create() crash on bad input
const validateColor = (color: string): string => {
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#10b981";
};

// ATS: Removed letterSpacing — it spreads glyphs in the PDF text layer,
// turning "React" into "R e a c t" which ATS parsers cannot read as a keyword.
const createStyles = (accentColor: string) => {
  const safeColor = validateColor(accentColor);
  return StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      fontFamily: "Helvetica",
      lineHeight: 1.3,
    },
    header: {
      marginBottom: 8,
      textAlign: "center",
    },
    name: {
      fontSize: 26,
      fontWeight: "bold",
      color: safeColor,
      textTransform: "uppercase",
      // REMOVED: letterSpacing: 2
      marginBottom: 10,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 3,
      marginTop: 3,
    },
    contactItem: { fontSize: 10, color: "#333333" },
    contactLink: { fontSize: 10, color: "#333333" },
    contactSeparator: { fontSize: 10, color: "#666666", marginHorizontal: 1 },
    divider: {
      height: 1,
      backgroundColor: safeColor,
      marginTop: 8,
      marginBottom: 8,
    },
    section: { marginBottom: 6 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: safeColor,
      textTransform: "uppercase",
      // REMOVED: letterSpacing: 1
      marginBottom: 6,
    },
    summaryText: { fontSize: 10, color: "#333333", lineHeight: 1.4 },
    experienceItem: { marginBottom: 6 },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 1,
    },
    experienceTitle: { fontSize: 11, fontWeight: "bold", color: "#333333" },
    experienceDate: { fontSize: 10, color: "#666666" },
    experienceCompany: { fontSize: 10, color: "#333333", marginBottom: 2 },
    experienceDescription: {
      fontSize: 10,
      color: "#333333",
      lineHeight: 1.3,
      marginLeft: 8,
    },
    educationItem: { marginBottom: 6 },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 1,
    },
    educationDegree: { fontSize: 11, fontWeight: "bold", color: "#333333" },
    educationDate: { fontSize: 10, color: "#666666" },
    educationSchool: { fontSize: 10, color: "#333333" },
    educationField: { fontSize: 10, color: "#666666" },
    educationDescription: {
      fontSize: 10,
      color: "#333333",
      lineHeight: 1.3,
      marginLeft: 8,
    },
    projectItem: { marginBottom: 6 },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 1,
    },
    projectTitle: { fontSize: 11, fontWeight: "bold", color: "#333333" },
    projectMeta: { flexDirection: "row", gap: 6 },
    projectMetaItem: { fontSize: 10, color: "#666666" },
    projectDescription: {
      fontSize: 10,
      color: "#333333",
      lineHeight: 1.3,
      marginLeft: 8,
    },
    skillsCategory: { marginBottom: 3 },
    skillsCategoryTitle: { fontSize: 10, fontWeight: "bold", color: "#333333" },
    skillsText: { fontSize: 10, color: "#333333", lineHeight: 1.3 },
    skillsBulletItem: { flexDirection: "row", marginBottom: 2 },
    bullet: { fontSize: 10, color: "#333333" },
  });
};

// ── FIX 1: Unicode mathematical bold/italic/script → plain ASCII ─────────────
// Users paste styled text from LinkedIn/Word. Characters like 𝐀𝐛𝐜 live in
// U+1D400-U+1D7FF and are NOT supported by Helvetica — react-pdf drops them.
const normalizeMathUnicode = (text: string): string => {
  if (!text) return "";

  const ranges: Array<{ start: number; base: number }> = [
    { start: 0x1d400, base: 65 }, // Bold Uppercase A-Z
    { start: 0x1d41a, base: 97 }, // Bold Lowercase a-z
    { start: 0x1d434, base: 65 }, // Italic Uppercase
    { start: 0x1d44e, base: 97 }, // Italic Lowercase
    { start: 0x1d468, base: 65 }, // Bold Italic Uppercase
    { start: 0x1d482, base: 97 }, // Bold Italic Lowercase
    { start: 0x1d49c, base: 65 }, // Script Uppercase
    { start: 0x1d4b6, base: 97 }, // Script Lowercase
    { start: 0x1d4d0, base: 65 }, // Bold Script Uppercase
    { start: 0x1d4ea, base: 97 }, // Bold Script Lowercase
    { start: 0x1d504, base: 65 }, // Fraktur Uppercase
    { start: 0x1d51e, base: 97 }, // Fraktur Lowercase
    { start: 0x1d538, base: 65 }, // Double-struck Uppercase
    { start: 0x1d552, base: 97 }, // Double-struck Lowercase
    { start: 0x1d56c, base: 65 }, // Bold Fraktur Uppercase
    { start: 0x1d586, base: 97 }, // Bold Fraktur Lowercase
    { start: 0x1d5a0, base: 65 }, // Sans-serif Uppercase
    { start: 0x1d5ba, base: 97 }, // Sans-serif Lowercase
    { start: 0x1d5d4, base: 65 }, // Sans Bold Uppercase
    { start: 0x1d5ee, base: 97 }, // Sans Bold Lowercase
    { start: 0x1d608, base: 65 }, // Sans Italic Uppercase
    { start: 0x1d622, base: 97 }, // Sans Italic Lowercase
    { start: 0x1d63c, base: 65 }, // Sans Bold Italic Uppercase
    { start: 0x1d656, base: 97 }, // Sans Bold Italic Lowercase
    { start: 0x1d670, base: 65 }, // Monospace Uppercase
    { start: 0x1d68a, base: 97 }, // Monospace Lowercase
  ];

  const map = new Map<number, string>();
  for (const { start, base } of ranges) {
    for (let i = 0; i < 26; i++) {
      map.set(start + i, String.fromCharCode(base + i));
    }
  }

  // Mathematical digits: Bold, Double-struck, Sans, Sans Bold, Monospace
  for (const start of [0x1d7ce, 0x1d7d8, 0x1d7e2, 0x1d7ec, 0x1d7f6]) {
    for (let i = 0; i < 10; i++) {
      map.set(start + i, String.fromCharCode(48 + i));
    }
  }

  let result = "";
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    result += map.get(cp) ?? char;
  }
  return result;
};

// ── FIX 2: Remove all emoji characters ───────────────────────────────────────
// Emojis sit outside the BMP (U+1F300+). react-pdf renders them as <" or boxes.
// Uses Unicode property escapes with /u flag — the only reliable approach.
const removeEmojis = (text: string): string => {
  if (!text) return "";
  return (
    text
      // Unicode property escapes (requires ES2018+ / Node 10+)
      .replace(/\p{Emoji_Presentation}/gu, "")
      .replace(/\p{Extended_Pictographic}/gu, "")
      // Variation selectors FE0E / FE0F
      .replace(/[\uFE0E\uFE0F]/g, "")
      // Zero-width joiner (family/profession emoji sequences)
      .replace(/\u200D/g, "")
      // Regional indicator pairs (flag emoji) U+1F1E0-U+1F1FF
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
      // Combining enclosing keycap U+20E3
      .replace(/\u20E3/g, "")
      // Tags block U+E0000-U+E007F (subdivision flag emoji)
      .replace(/[\u{E0000}-\u{E007F}]/gu, "")
      // Collapse double-spaces left after removal
      .replace(/  +/g, " ")
      .trim()
  );
};

// ── Deep text cleaning pipeline ──────────────────────────────────────────────
// Run on EVERY text field before passing to react-pdf.
// Order matters: normalize Unicode → strip emojis → sanitize the rest.
const cleanText = (text: string): string => {
  if (!text) return "";
  // 1. Convert mathematical/styled Unicode blocks to plain ASCII
  let t = normalizeMathUnicode(text);
  // 2. Remove all emoji (must come after normalizeMathUnicode)
  t = removeEmojis(t);
  // 3. Strip HTML tags
  t = t.replace(/<[^>]*>/g, "");
  // 4. Zero-width chars: ZWSP, BOM, ZWNJ
  t = t.replace(/[\u200B\uFEFF\u200C]/g, "");
  // 5. Non-breaking space → regular space
  t = t.replace(/\u00A0/g, " ");
  // 6. Smart quotes → straight
  t = t.replace(/[\u2018\u2019]/g, "'");
  t = t.replace(/[\u201C\u201D]/g, '"');
  // 7. En-dash / em-dash → hyphen (ATS date separators)
  t = t.replace(/[\u2013\u2014]/g, "-");
  // 8. Ellipsis character → three dots
  t = t.replace(/\u2026/g, "...");
  // 9. Control characters (except \t \n \r)
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  // 10. Stray < not followed by a tag letter (leftover from broken HTML)
  t = t.replace(/<(?![a-zA-Z\/])/g, "");
  // 11. Trailing double-period artifact
  t = t.replace(/\.\s*\.\s*$/, ".");
  // 12. Normalize multiple spaces
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
};

// ATS: Full month names — higher parse rate than 3-letter abbreviations
const formatDate = (dateStr: string): string => {
  try {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = parseInt(parts[1]) - 1;
      const year = parts[0];
      return months[month] ? months[month] + " " + year : year;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// FIX 3: Split on newlines only — the previous lookbehind regex (?<=\.)
// was double-escaped in the template literal → invalid regex → silent crash
// → text after the first sentence was silently truncated.
const parseBullets = (description: string): string[] => {
  if (!description) return [];
  const cleaned = cleanText(description);
  return cleaned
    .split(/\n+/)
    .map((line) => line.replace(/^[\s\-*\u2022]+/, "").trim())
    .filter((line) => line.length > 2);
};

function ResumeDocument({
  user,
  portfolio,
  accentColor,
}: {
  user: any;
  portfolio: any;
  accentColor: string;
}) {
  const styles = createStyles(accentColor);
  const content = portfolio?.content || {};
  const experiences = portfolio?.experiences || [];
  const educations = portfolio?.educations || [];
  const projects = portfolio?.projects || [];
  const skills = portfolio?.skills || [];

  // ATS: "Skills" canonical section grouping
  const technicalSkills = skills.filter((s: any) => s.category === "technical");
  const softSkills = skills.filter((s: any) => s.category === "soft");
  const toolSkills = skills.filter((s: any) => s.category === "tools");

  const githubUrl =
    content?.githubUrl ||
    (user?.githubLogin ? "https://github.com/" + user.githubLogin : null);
  const websiteUrl = content?.websiteUrl || user?.blog || null;

  const contactItems: { text: string; link?: string }[] = [];
  if (user?.email)
    contactItems.push({ text: user.email, link: "mailto:" + user.email });
  if (user?.location) contactItems.push({ text: user.location });
  if (content?.linkedinUrl)
    contactItems.push({ text: "LinkedIn", link: content.linkedinUrl });
  if (githubUrl) contactItems.push({ text: "GitHub", link: githubUrl });
  if (websiteUrl) contactItems.push({ text: "Portfolio", link: websiteUrl });

  const cleanName = cleanText(user?.name || "Your Name");
  const summaryText = cleanText(content?.aboutText || "");
  // ATS: PDF metadata — secondary keyword channel
  const allSkillNames = skills.map((s: any) => s.name).join(", ");

  return (
    <Document
      title={cleanName + " - Resume"}
      author={cleanName}
      subject="Professional Resume"
      keywords={allSkillNames}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cleanName}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                {index > 0 && <Text style={styles.contactSeparator}>|</Text>}
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

        {summaryText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        )}

        {summaryText &&
          (experiences.length > 0 ||
            educations.length > 0 ||
            projects.length > 0 ||
            skills.length > 0) && <View style={styles.divider} />}

        {/* ATS: "Experience" is the canonical section name */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experiences.map((exp: any, index: number) => {
              const bullets = parseBullets(exp.description);
              return (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>
                      {cleanText(exp.role)}
                    </Text>
                    {/* ATS: plain hyphen, not en-dash */}
                    <Text style={styles.experienceDate}>
                      {formatDate(exp.startDate)} -{" "}
                      {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.experienceCompany}>
                    {cleanText(exp.company)}
                    {exp.location ? ", " + cleanText(exp.location) : ""}
                  </Text>
                  {/* ATS: each bullet is its own <Text> node for correct extraction */}
                  {bullets.length > 0
                    ? bullets.map((bullet, bIdx) => (
                        <Text key={bIdx} style={styles.experienceDescription}>
                          {String.fromCharCode(8226)} {bullet}
                        </Text>
                      ))
                    : exp.description && (
                        <Text style={styles.experienceDescription}>
                          {String.fromCharCode(8226)}{" "}
                          {cleanText(exp.description)}
                        </Text>
                      )}
                </View>
              );
            })}
          </View>
        )}

        {experiences.length > 0 &&
          (educations.length > 0 ||
            projects.length > 0 ||
            skills.length > 0) && <View style={styles.divider} />}

        {educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {educations.map((edu: any, index: number) => {
              const bullets = parseBullets(edu.description);
              return (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.educationDegree}>
                      {cleanText(edu.degree)}
                    </Text>
                    <Text style={styles.educationDate}>
                      {formatDate(edu.startDate)} -{" "}
                      {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.educationSchool}>
                    {cleanText(edu.institution)}
                  </Text>
                  {edu.field && (
                    <Text style={styles.educationField}>
                      {cleanText(edu.field)}
                    </Text>
                  )}
                  {bullets.length > 0
                    ? bullets.map((bullet, bIdx) => (
                        <Text key={bIdx} style={styles.educationDescription}>
                          {String.fromCharCode(8226)} {bullet}
                        </Text>
                      ))
                    : edu.description && (
                        <Text style={styles.educationDescription}>
                          {String.fromCharCode(8226)}{" "}
                          {cleanText(edu.description)}
                        </Text>
                      )}
                </View>
              );
            })}
          </View>
        )}

        {educations.length > 0 &&
          (projects.length > 0 || skills.length > 0) && (
            <View style={styles.divider} />
          )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.slice(0, 5).map((proj: any, index: number) => {
              const projectUrl = proj.url || proj.githubUrl || null;
              const bullets = parseBullets(proj.description);
              return (
                <View key={index} style={styles.projectItem}>
                  <View style={styles.projectHeader}>
                    {projectUrl ? (
                      <Link style={styles.projectTitle} src={projectUrl}>
                        {cleanText(proj.title)}
                      </Link>
                    ) : (
                      <Text style={styles.projectTitle}>
                        {cleanText(proj.title)}
                      </Text>
                    )}
                    <View style={styles.projectMeta}>
                      {proj.githubStars !== null &&
                        proj.githubStars !== undefined && (
                          <Text style={styles.projectMetaItem}>
                            {proj.githubStars} stars
                          </Text>
                        )}
                      {proj.githubLanguage && (
                        <Text style={styles.projectMetaItem}>
                          {proj.githubLanguage}
                        </Text>
                      )}
                    </View>
                  </View>
                  {bullets.length > 0
                    ? bullets.map((bullet, bIdx) => (
                        <Text key={bIdx} style={styles.projectDescription}>
                          {String.fromCharCode(8226)} {bullet}
                        </Text>
                      ))
                    : proj.description && (
                        <Text style={styles.projectDescription}>
                          {String.fromCharCode(8226)}{" "}
                          {cleanText(proj.description)}
                        </Text>
                      )}
                </View>
              );
            })}
          </View>
        )}

        {projects.length > 0 && skills.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* ATS: "Skills" is the canonical section name */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {technicalSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>
                    {String.fromCharCode(8226)}{" "}
                  </Text>
                  <Text style={styles.skillsCategoryTitle}>
                    Technical Skills:{" "}
                  </Text>
                  {/* ATS: comma-separated — tokenizers split on comma, not middle-dot */}
                  <Text style={styles.skillsText}>
                    {technicalSkills.map((s: any) => s.name).join(", ")}
                  </Text>
                </View>
              </View>
            )}
            {toolSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>
                    {String.fromCharCode(8226)}{" "}
                  </Text>
                  <Text style={styles.skillsCategoryTitle}>
                    Tools & Technologies:{" "}
                  </Text>
                  <Text style={styles.skillsText}>
                    {toolSkills.map((s: any) => s.name).join(", ")}
                  </Text>
                </View>
              </View>
            )}
            {softSkills.length > 0 && (
              <View style={styles.skillsCategory}>
                <View style={styles.skillsBulletItem}>
                  <Text style={styles.bullet}>
                    {String.fromCharCode(8226)}{" "}
                  </Text>
                  <Text style={styles.skillsCategoryTitle}>Soft Skills: </Text>
                  <Text style={styles.skillsText}>
                    {softSkills.map((s: any) => s.name).join(", ")}
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
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const portfolio = await db.portfolio.findUnique({
      where: { userId },
      include: {
        content: true,
        projects: { orderBy: { displayOrder: "asc" } },
        experiences: { orderBy: { displayOrder: "asc" } },
        educations: { orderBy: { displayOrder: "asc" } },
        skills: { orderBy: { displayOrder: "asc" } },
      },
    });

    const accentColor = portfolio?.accentColor || "#10b981";

    const doc = (
      <ResumeDocument
        user={user}
        portfolio={portfolio}
        accentColor={accentColor}
      />
    );
    const stream = await renderToStream(doc);

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="' +
          (user.username || "resume") +
          '-resume.pdf"',
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
