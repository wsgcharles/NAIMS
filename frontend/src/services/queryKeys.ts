export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    stats: (role: string) => ['dashboard', 'stats', role] as const,
  },
  studentPortal: {
    profile: ['studentPortal', 'profile'] as const,
    subjects: ['studentPortal', 'subjects'] as const,
    grades: ['studentPortal', 'grades'] as const,
    financials: ['studentPortal', 'financials'] as const,
    ledger: ['studentPortal', 'ledger'] as const,
    history: ['studentPortal', 'history'] as const,
  },
  enrollment: {
    queue: ['enrollment', 'queue'] as const,
    application: (id: string) => ['enrollment', 'application', id] as const,
  },
  gradebook: {
    section: (sectionId: string, subjectId: string) =>
      ['gradebook', 'section', sectionId, subjectId] as const,
  },
  accounting: {
    bills: ['accounting', 'bills'] as const,
    receipts: ['accounting', 'receipts'] as const,
  },
  parentPortal: {
    profile: ['parentPortal', 'profile'] as const,
    children: ['parentPortal', 'children'] as const,
    childDetails: (studentId: number) => ['parentPortal', 'children', studentId] as const,
    currentAcademicYear: ['parentPortal', 'academicYear', 'current'] as const,
    childGrades: (studentId: number, academicYearId: number) =>
      ['parentPortal', 'children', studentId, 'grades', academicYearId] as const,
    childLedger: (studentId: number) => ['parentPortal', 'children', studentId, 'ledger'] as const,
  },
  teacherPortal: {
    classes: ['teacherPortal', 'classes'] as const,
    grades: (teachingAssignmentId: number) => ['teacherPortal', 'classes', teachingAssignmentId, 'grades'] as const,
  },
  registrar: {
    applications: ['registrar', 'applications'] as const,
    students: ['registrar', 'students'] as const,
    studentHistory: (studentId: number) => ['registrar', 'students', studentId, 'history'] as const,
    sections: ['registrar', 'sections'] as const,
    academicYears: ['registrar', 'academicYears'] as const,
    currentEmployee: ['registrar', 'currentEmployee'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    students: ['admin', 'students'] as const,
    employees: ['admin', 'employees'] as const,
    subjects: ['admin', 'subjects'] as const,
    gradeLevels: ['admin', 'gradeLevels'] as const,
    grades: ['admin', 'grades'] as const,
    users: ['admin', 'users'] as const,
    systemSettings: ['admin', 'systemSettings'] as const,
    sectionAssignments: ['admin', 'sectionAssignments'] as const,
    sections: ['admin', 'sections'] as const,
    academicYears: ['admin', 'academicYears'] as const,
    activeAcademicYear: ['admin', 'academicYears', 'active'] as const,
    academicPrograms: ['admin', 'academicPrograms'] as const,
    announcements: ['admin', 'announcements'] as const,
    auditLogs: ['admin', 'auditLogs'] as const,
    reportsOverview: ['admin', 'reportsOverview'] as const,
    gradeApprovals: ['admin', 'gradeApprovals'] as const,
  },
  finance: {
    dashboard: ['finance', 'dashboard'] as const,
    fees: ['finance', 'fees'] as const,
    currentEmployee: ['finance', 'currentEmployee'] as const,
    ledger: (studentId: number) => ['finance', 'ledger', studentId] as const,
    bills: (studentId: number) => ['finance', 'bills', studentId] as const,
    receipts: (studentId: number) => ['finance', 'receipts', studentId] as const,
  },
} as const;
