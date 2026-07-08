import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SessionEngine } from '../../core/utils/sessionEngine';

export function AcademyPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => SessionEngine.getCurrentSession());
  const courses = SessionEngine.getCourseCatalog();

  React.useEffect(() => {
    return SessionEngine.subscribe(() => {
      setSession(SessionEngine.getCurrentSession());
    });
  }, []);

  const categoryMap: { [key: string]: string } = {
    'web-security': 'Web Security',
    'network': 'Network Security',
    'cryptography': 'Cryptography',
    'malware': 'Malware Analysis',
    'osint': 'OSINT',
  };

  const CATEGORIES = Array.from(new Set(courses.map(c => c.category))).map(cat => categoryMap[cat] || cat);

  const LEARNING_PATHS = [
    { id: 'p1', title: 'Offensive Security Operative', courses: 6, level: 'Beginner to Advanced', badge: '🔴 RED TEAM', startingCourseId: 'c001' },
    { id: 'p2', title: 'SOC Analyst Responder', courses: 5, level: 'Beginner to Intermediate', badge: '🔵 BLUE TEAM', startingCourseId: 'c004' },
    { id: 'p3', title: 'DevSecOps Engineer', courses: 4, level: 'Intermediate', badge: '🟢 DEVSECOPS', startingCourseId: 'c005' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState(() => SessionEngine.getActiveCourseId());

  // Map progress metadata onto live course list
  const coursesWithProgress = courses.map(course => {
    const progress = SessionEngine.getCourseProgress(course.id);
    const categoryTitle = categoryMap[course.category] || course.category;
    return {
      ...course,
      categoryTitle,
      completedCount: progress.completedCount,
      totalCount: progress.totalCount,
      percentage: progress.percentage,
      enrolled: progress.percentage > 0 || session.progress.completedCourses.includes(course.id),
      completed: session.progress.completedCourses.includes(course.id),
    };
  });

  const enrolledCoursesCount = coursesWithProgress.filter(c => c.enrolled).length;
  const certificatesEarned = session.progress.completedCourses.length;
  const totalTimeTrainedHours = Math.round((session.progress.totalTimeMinutes || 0) / 60);

  // Resolve current active course
  const activeCourse = activeCourseId ? coursesWithProgress.find(c => c.id === activeCourseId) : null;
  
  let activeNextLessonTitle = 'Course Completed';
  if (activeCourse && activeCourseId) {
    const nextLessonId = SessionEngine.continueCourse(activeCourseId);
    if (nextLessonId) {
      for (const section of activeCourse.sections) {
        const lesson = section.lessons.find(l => l.id === nextLessonId);
        if (lesson) {
          activeNextLessonTitle = lesson.title;
          break;
        }
      }
    }
  }

  // Filter catalog list
  const filteredCourses = coursesWithProgress.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.categoryTitle === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnroll = (courseId: string) => {
    SessionEngine.startCourse(courseId);
    setActiveCourseId(courseId);
    navigate('/labs');
  };

  const handleResume = (courseId: string) => {
    SessionEngine.startCourse(courseId);
    SessionEngine.continueCourse(courseId);
    setActiveCourseId(courseId);
    navigate('/labs');
  };

  return (
    <div style={styles.container}>
      {/* Top Progress Overview */}
      <div style={styles.overviewRow}>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>{enrolledCoursesCount}</span>
          <span style={styles.overviewLbl}>ENROLLED COURSES</span>
        </Card>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>{certificatesEarned}</span>
          <span style={styles.overviewLbl}>CERTIFICATES EARNED</span>
        </Card>
        <Card style={styles.overviewCard}>
          <span style={styles.overviewVal}>{totalTimeTrainedHours}h</span>
          <span style={styles.overviewLbl}>TOTAL TIME TRAINED</span>
        </Card>
      </div>

      {/* Grid: Continue Learning + Learning Paths */}
      <div style={styles.topSplit}>
        {/* Continue Learning */}
        <div style={styles.continueSection}>
          <h4 style={styles.sectionHeader}>📖 RESUME ACTIVE TRAINING</h4>
          {activeCourse ? (
            <Card style={styles.continueCard}>
              <div style={styles.continueHeader}>
                <span style={styles.continueTag}>{activeCourse.categoryTitle}</span>
                <span style={styles.continuePercent}>{activeCourse.percentage}% Complete</span>
              </div>
              <h4 style={styles.continueTitle}>{activeCourse.title}</h4>
              <p style={styles.continueLesson}>Next Lesson: <strong>{activeNextLessonTitle}</strong></p>
              <div style={styles.continueBarBg}>
                <div style={{ ...styles.continueBarFill, width: `${activeCourse.percentage}%` }} />
              </div>
              <Button 
                variant="primary" 
                style={{ marginTop: '10px', alignSelf: 'flex-start' }}
                onClick={() => handleResume(activeCourse.id)}
              >
                LAUNCH LAB ENVIRONMENT
              </Button>
            </Card>
          ) : (
            <Card style={styles.continueCard}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                <h4 style={styles.continueTitle}>No Active Course</h4>
                <p style={styles.continueLesson}>Browse our catalog below and enroll in a course to begin training.</p>
              </div>
            </Card>
          )}
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEnroll(path.startingCourseId)}
                >
                  START
                </Button>
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
                subtitle={`${course.categoryTitle} • ${course.duration}`}
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
                    <Button 
                      variant="primary" 
                      style={{ width: '100%' }}
                      onClick={() => handleResume(course.id)}
                    >
                      RESUME TRAINING
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      style={{ width: '100%' }}
                      onClick={() => handleEnroll(course.id)}
                    >
                      ENROLL NOW
                    </Button>
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
