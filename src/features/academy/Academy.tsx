import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

// Mock list of categories
const CATEGORIES = [
  'Offensive Security', 'Defensive Security', 'GRC', 'DevSecOps',
  'Cloud Security', 'Digital Forensics', 'Malware Analysis',
  'Networking', 'Linux', 'Windows', 'Programming'
];

// Mock Learning Paths
const LEARNING_PATHS = [
  { id: 'p1', title: 'Offensive Security Operative', courses: 6, level: 'Beginner to Advanced', badge: '🔴 RED TEAM' },
  { id: 'p2', title: 'SOC Analyst Responder', courses: 5, level: 'Beginner to Intermediate', badge: '🔵 BLUE TEAM' },
  { id: 'p3', title: 'DevSecOps Engineer', courses: 4, level: 'Intermediate', badge: '🟢 DEVSECOPS' },
];

// Mock Courses Catalog
const COURSES = [
  { id: 'c1', title: 'Web Application Hacking: From Zero to Hero', category: 'Offensive Security', difficulty: 'Beginner', duration: '8.5h', enrolled: true },
  { id: 'c2', title: 'Wireshark Packet Analysis Mastery', category: 'Networking', difficulty: 'Intermediate', duration: '6h', enrolled: false },
  { id: 'c3', title: 'Linux System Hardening Guidelines', category: 'Linux', difficulty: 'Intermediate', duration: '5.5h', enrolled: false },
  { id: 'c4', title: 'Introduction to Malware Disassembly', category: 'Malware Analysis', difficulty: 'Advanced', duration: '12h', enrolled: false },
  { id: 'c5', title: 'Windows Active Directory Exploits', category: 'Offensive Security', difficulty: 'Advanced', duration: '15h', enrolled: false },
  { id: 'c6', title: 'Python Scripting for Cyber Task Automation', category: 'Programming', difficulty: 'Beginner', duration: '7h', enrolled: false },
];

export function AcademyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter logic
  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.container}>
      {/* Top Progress Overview */}
      <div style={styles.overviewRow}>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>3</span>
          <span style={styles.overviewLbl}>ENROLLED COURSES</span>
        </Card>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>1</span>
          <span style={styles.overviewLbl}>CERTIFICATES EARNED</span>
        </Card>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>20h</span>
          <span style={styles.overviewLbl}>TOTAL TIME TRAINED</span>
        </Card>
      </div>

      {/* Grid: Continue Learning + Learning Paths */}
      <div style={styles.topSplit}>
        {/* Continue Learning */}
        <div style={styles.continueSection}>
          <h4 style={styles.sectionHeader}>📖 RESUME ACTIVE TRAINING</h4>
          <Card style={styles.continueCard}>
            <div style={styles.continueHeader}>
              <span style={styles.continueTag}>Offensive Security</span>
              <span style={styles.continuePercent}>65% Complete</span>
            </div>
            <h4 style={styles.continueTitle}>Web Application Hacking: From Zero to Hero</h4>
            <p style={styles.continueLesson}>Next Lesson: <strong>Blind SQL Injection Techniques</strong></p>
            <div style={styles.continueBarBg}>
              <div style={{ ...styles.continueBarFill, width: '65%' }} />
            </div>
            <Button variant="primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
              LAUNCH LAB ENVIRONMENT
            </Button>
          </Card>
        </div>

        {/* Learning Paths */}
        <div style={styles.pathsSection}>
          <h4 style={styles.sectionHeader}>🛣️ SPECIALIZED PATHS</h4>
          <div style={styles.pathsList}>
            {LEARNING_PATHS.map(path => (
              <div key={path.id} style={styles.pathItem}>
                <div>
                  <span style={styles.pathBadge}>{path.badge}</span>
                  <h5 style={styles.pathTitle}>{path.title}</h5>
                  <p style={styles.pathMeta}>{path.courses} Courses • {path.level}</p>
                </div>
                <Button variant="outline" size="sm">START</Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Categories Section */}
      <div style={styles.searchSection}>
        <h4 style={styles.sectionHeader}>🔍 EXPLORE CATALOG</h4>
        
        <div style={styles.filterRow}>
          <div style={{ flex: 1 }}>
            <Input
              type="text"
              placeholder="Search courses, vulnerabilities, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon="🔍"
            />
          </div>
          {selectedCategory && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              style={styles.clearBtn}
            >
              Clear Category Filter
            </Button>
          )}
        </div>

        {/* Category tags */}
        <div style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                style={{
                  ...styles.catTag,
                  ...(isSelected ? styles.catTagActive : {})
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Catalog Grid */}
      <div>
        <h4 style={styles.sectionHeader}>📚 RECOMMENDED MODULES ({filteredCourses.length})</h4>
        <div style={styles.coursesGrid}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <Card 
                key={course.id} 
                title={course.title}
                subtitle={`${course.category} • ${course.duration}`}
                hoverGlow
                extra={
                  <span style={{
                    ...styles.difficultyBadge,
                    ...styles[course.difficulty.toLowerCase() as keyof typeof styles]
                  }}>
                    {course.difficulty}
                  </span>
                }
              >
                <div style={styles.courseFooter}>
                  {course.enrolled ? (
                    <Button variant="primary" style={{ width: '100%' }}>RESUME TRAINING</Button>
                  ) : (
                    <Button variant="secondary" style={{ width: '100%' }}>ENROLL NOW</Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>👽</span>
              <h5>No training modules found</h5>
              <p>Adjust your search criteria or clear category filters to inspect all listings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  overviewRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  overviewCard: {
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '20px',
  },
  overviewVal: {
    fontSize: '2rem',
    fontWeight: 'var(--font-weight-black)',
    color: 'var(--color-primary)',
    display: 'block',
  },
  overviewLbl: {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
    marginTop: '4px',
    textTransform: 'uppercase' as const,
  },
  sectionHeader: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    marginBottom: '15px',
    textTransform: 'uppercase' as const,
  },
  topSplit: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px',
  },
  continueSection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  continueCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    flex: 1,
  },
  continueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-family-mono)',
  },
  continuePercent: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  continueTitle: {
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  continueLesson: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  continueBarBg: {
    height: '6px',
    backgroundColor: 'var(--color-bg-element)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
  },
  continueBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    boxShadow: 'var(--glow-primary)',
    borderRadius: 'var(--radius-pill)',
  },
  pathsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  pathsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  pathItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    padding: '16px 20px',
    borderRadius: 'var(--radius-lg)',
  },
  pathBadge: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '0.65rem',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '4px',
  },
  pathTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  pathMeta: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0 0',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  filterRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  clearBtn: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
  },
  categoryGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  catTag: {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    borderRadius: 'var(--radius-pill)',
    padding: '6px 14px',
    fontSize: 'var(--font-size-xs)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
  catTagActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    boxShadow: 'var(--glow-accent)',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  difficultyBadge: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-family-mono)',
    fontWeight: 'var(--font-weight-bold)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  beginner: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
  },
  intermediate: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    color: 'var(--color-warning)',
    border: '1px solid rgba(255, 179, 0, 0.2)',
  },
  advanced: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  courseFooter: {
    marginTop: '15px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    display: 'block',
  },
};
