// User Roles matching EduCore backend UserRole enum
export const UserRole = {
  SuperAdministrator: 1,
  Administrator: 2,
  Principal: 3,
  Registrar: 4,
  Teacher: 5,
  Accountant: 6,
  Student: 7,
  Parent: 8,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type UserRoleString =
  | 'SuperAdministrator'
  | 'Administrator'
  | 'Principal'
  | 'Registrar'
  | 'Teacher'
  | 'Accountant'
  | 'Student'
  | 'Parent';

// Domain Enums as const maps
export const EnrollmentStatus = {
  Draft: 1,
  Submitted: 2,
  UnderReview: 3,
  Verified: 4,
  SectionAssigned: 5,
  Approved: 6,
  Rejected: 7,
  Cancelled: 8,
} as const;

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const BillStatus = {
  Unpaid: 1,
  PartiallyPaid: 2,
  Paid: 3,
  Overdue: 4,
  Cancelled: 5,
} as const;

export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];

export const PaymentStatus = {
  Pending: 1,
  Completed: 2,
  Failed: 3,
  Refunded: 4,
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const AcademicYearStatus = {
  Upcoming: 1,
  Active: 2,
  Completed: 3,
  Archived: 4,
} as const;

export type AcademicYearStatus = (typeof AcademicYearStatus)[keyof typeof AcademicYearStatus];

// Authentication Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  userId: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  expiresAt: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRoleString;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  mustChangePassword: boolean;
  isActive: boolean;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// Dashboard & Analytics Metrics
export interface DashboardStats {
  totalStudents: number;
  totalEmployees: number;
  totalTeachers: number;
  totalParents: number;
  ytdRevenue: number;
  outstandingBills: number;
  pendingEnrollments: number;
  recentActivity: ActivityLog[];
  monthlyRevenue: RevenueTrendPoint[];
  enrollmentTrend: EnrollmentTrendPoint[];
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'enrollment' | 'payment' | 'grade' | 'system';
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  collected: number;
}

export interface EnrollmentTrendPoint {
  month: string;
  applications: number;
  approved: number;
}

// Academic Entities
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  isCurrent: boolean;
}

export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface GradeLevel {
  id: string;
  name: string;
  order: number;
  programId: string;
  programName?: string;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  units: number;
  gradeLevelId: string;
  gradeLevelName?: string;
}

export interface Section {
  id: string;
  name: string;
  capacity: number;
  gradeLevelId: string;
  gradeLevelName?: string;
  academicYearId: string;
  advisorName?: string;
}

// Student & Parent Entities
export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthDate: string;
  gradeLevelName: string;
  sectionName?: string;
  enrollmentStatus: EnrollmentStatus;
  parentName?: string;
  parentContact?: string;
}

export interface StudentLedgerItem {
  id: string;
  description: string;
  amount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: BillStatus;
  receiptNumber?: string;
}

export interface GradeItem {
  subjectCode: string;
  subjectTitle: string;
  firstQuarter?: number;
  secondQuarter?: number;
  thirdQuarter?: number;
  fourthQuarter?: number;
  finalGrade?: number;
  remarks?: string;
}

export interface ScheduleItem {
  id: string;
  subjectCode: string;
  subjectTitle: string;
  timeSlot: string;
  days: string[];
  room: string;
  teacherName: string;
}

// Parent Portal Entities (mirrors EduCore.API DTOs/ParentPortal + Accounting)
export interface ParentProfile {
  parentId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  occupation: string;
}

export interface ChildSummary {
  studentId: number;
  studentNumber: string;
  fullName: string;
  status: string;
  currentGradeLevel: string;
  currentSection: string;
}

export interface ChildDetails extends ChildSummary {
  birthDate: string;
  gender: string;
  address: string;
}

export interface ChildGrade {
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  finalAverage: number | null;
  remarks: string;
}

export interface AcademicYearRecord {
  id: number;
  schoolYear: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Current' | 'Completed' | 'Archived' | string;
  isActive: boolean;
  enrollmentStartDate?: string | null;
  enrollmentEndDate?: string | null;
  isEnrollmentOpen: boolean;
  isReturningEnrollmentOpen: boolean;
  currentSemester: string;
  classesStartDate?: string | null;
  classesEndDate?: string | null;
  graduationDate?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface LedgerTransaction {
  date: string;
  referenceNo: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface StudentLedger {
  studentId: number;
  studentNumber: string;
  fullName: string;
  gradeLevelName: string;
  totalBilled: number;
  totalPaid: number;
  currentBalance: number;
  transactions: LedgerTransaction[];
}

// Teacher Portal Entities (mirrors EduCore.API DTOs — TeacherDashboardController)
export interface TeacherClass {
  teachingAssignmentId: number;
  subjectId: number;
  subjectName: string;
  sectionId: number;
  sectionName: string;
  academicYearId: number;
  academicYear: string;
  studentCount: number;
}

export interface TeacherGrade {
  gradeId: number;
  studentId: number;
  studentNumber: string;
  studentName: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  finalAverage: number | null;
  remarks: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Released' | 'Rejected' | string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  reviewerRemarks?: string | null;
  canEdit: boolean;
  isReleased: boolean;
  dateEncoded: string;
}

export interface GradeApprovalItem {
  gradeId: number;
  teachingAssignmentId: number;
  studentName: string;
  studentNumber: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  sectionName: string;
  gradeLevelName: string;
  academicYear: string;
  semester: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  finalAverage: number | null;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Released' | 'Rejected' | string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedByTeacherOrAdmin?: string | null;
  reviewerRemarks?: string | null;
}

// Registrar Module Entities (mirrors EduCore.API DTOs — EnrollmentController,
// RegistrarController, StudentHistoryController, SectionsController, EmployeesController)

// The real backend status for an enrollment application (EnrollmentApplicationStatus
// enum). Distinct from the pre-existing, unrelated `EnrollmentStatus` numeric type
// above, which has no backend counterpart and is left untouched for its existing
// (out-of-scope) consumers.
export type EnrollmentApplicationStatusString = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface EnrollmentApplication {
  id: number;
  applicationNumber: string;
  fullName: string;
  gradeApplyingFor: string;
  track?: string | null;
  strand?: string | null;
  previousSchool: string;
  email: string;
  parentName?: string;
  parentContact?: string;
  parentEmail?: string;
  relationship?: string;
  status: EnrollmentApplicationStatusString;
  isApproved: boolean;
  hasRegistrarVerificationSlip?: boolean;
  verificationSlipNumber?: string;
  createdAt: string;
}



export interface RegistrarStudent {
  studentId: number;
  studentNumber: string;
  fullName: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  isActive: boolean;
}

export interface StudentHistoryEntry {
  id: number;
  studentId: number;
  action: string;
  description: string;
  dateOccurred: string;
  employeeId: number | null;
  performedBy: string | null;
}

export interface SectionEnrolledStudent {
  studentId: number;
  studentNumber: string;
  fullName: string;
  gender: string;
  assignedAt: string;
}


export interface SectionOption {
  id: number;
  programOfferingId: number;
  programOfferingName: string;
  academicYearId: number;
  schoolYear: string;
  semester: string;
  gradeLevelId: number;
  gradeLevelName: string;
  programId?: number | null;
  trackCode: string;
  strandCode: string;
  sectionName: string;
  capacity: number;
  currentStudents: number;
  remainingSlots: number;
  adviserEmployeeId?: number | null;
  adviserName: string;
  hasAdviser: boolean;
  isActive: boolean;
  status: string;
  readinessStatus: 'Ready' | 'Warning' | 'Incomplete' | 'Full' | string;
  sectionHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Configuration Required' | string;
  assignedSubjectsCount: number;
  requiredSubjectsCount: number;
  assignedTeachersCount: number;
  requiredTeachersCount: number;
  isSubjectComplete: boolean;
  isTeacherComplete: boolean;
  subjects: SectionSubjectDetail[];
  enrolledStudents: SectionEnrolledStudent[];
}

export interface SectionStats {
  totalSections: number;
  activeSections: number;
  fullSections: number;
  sectionsMissingAdviser: number;
  sectionsMissingTeachers: number;
  averageUtilization: number;
}

export interface CreateSectionPayload {
  programOfferingId?: number;
  academicYearId?: number;
  gradeLevelId?: number;
  programId?: number;
  sectionName: string;
  capacity: number;
  adviserEmployeeId?: number | null;
  isActive?: boolean;
}

export interface UpdateSectionPayload {
  programOfferingId?: number;
  academicYearId?: number;
  gradeLevelId?: number;
  programId?: number;
  sectionName: string;
  capacity: number;
  adviserEmployeeId?: number | null;
  isActive: boolean;
}

export interface AssignSectionTeacherPayload {
  subjectId: number;
  employeeId: number;
}


export interface EmployeeDirectoryEntry {
  id: number;
  fullName: string;
  email: string;
}

export type FrontendEnrollmentType = 'New' | 'Old' | 'Transferee' | 'Returnee';

export interface ApproveAndEnrollResult {
  studentId: number;
  studentNumber: string;
  fullName: string;
  email: string;
  temporaryPassword: string;
  parentEmail: string;
  parentTemporaryPassword: string;
  applicationNumber: string;
  message: string;
}

// Administrator Module Entities (mirrors EduCore.API DTOs — DashboardController,
// StudentsController, EmployeesController, SubjectsController, GradesController,
// GradeLevelsController, UsersController, SystemSettingsController)

export interface RoleCountStat {
  role: string;
  count: number;
}

// Normalized by the frontend hook from either AdminDashboardStatsResponse
// (Administrator/SuperAdministrator/Registrar) or PrincipalDashboardResponse
// (Principal) — the two raw backend shapes differ, but this app serves both
// roles from the one dashboard page, so the hook reconciles them into one shape.
export interface AdminDashboardOverview {
  totalStudents: number;
  activeStudents: number;
  totalEmployees: number;
  activeEmployees: number;
  totalSections: number;
  totalSubjects: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  employeesByRole: RoleCountStat[];
  activeAcademicYear: string | null;
}

export interface AdminStudent {
  id: number;
  studentNumber: string;
  lrn: string;
  fullName: string;
  email: string;
  isActive: boolean;
  temporaryPassword: string | null;
}

export interface StudentFormPayload {
  lrn: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  parentId: number | null;
}

export interface AdminEmployee {
  id: number;
  employeeNumber: string;
  fullName: string;
  position: string;
  department: string;
  role: string;
  email: string;
  phoneNumber: string;
  dateHired: string;
  isActive: boolean;
  temporaryPassword: string | null;
}

// Position drives Role + Department server-side (EmployeeService.GetRoleFromPosition) —
// only these five exact strings are recognized; anything else throws "Invalid employee position."
export type EmployeePosition = 'Administrator' | 'Principal' | 'Registrar' | 'Teacher' | 'Accountant';

export interface EmployeeFormPayload {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  position: EmployeePosition;
  dateHired: string;
}

export interface AdminSubject {
  id: number;
  subjectCode: string;
  subjectName: string;
  gradeLevelId: number;
  gradeLevel: string;
  isCoreSubject: boolean;
  units: number;
  isActive: boolean;
}

export interface SubjectFormPayload {
  subjectCode: string;
  subjectName: string;
  gradeLevelId: number;
  isCoreSubject: boolean;
  units: number;
  isActive?: boolean; // only meaningful on update — Create always activates server-side
}

export interface AdminGradeLevel {
  id: number;
  name: string;
  displayOrder: number;
  educationLevel: string;
  isActive: boolean;
}

export interface AdminGradeRecord {
  id: number;
  enrollmentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  teachingAssignmentId: number;
  teacherName: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  finalAverage: number | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  fullName: string; // backend bug: always equals email, no name fields on the User model
  email: string;
  role: string;
  isActive: boolean;
}

export interface SchoolSettings {
  id: number;
  schoolName: string;
  schoolLogoUrl: string | null;
  currentAcademicYearId: number | null;
  currentAcademicYearName: string | null;
  officialReceiptPrefix: string;
  studentNumberPrefix: string;
  studentNumberCounterLength: number;
  billNumberPrefix: string;
  paymentNumberPrefix: string;
  currency: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

export interface StudentSectionAssignment {
  id: number;
  studentId: number;
  studentName: string;
  sectionId: number;
  sectionName: string;
  academicYearId: number;
  academicYear: string;
  isActive: boolean;
  assignedAt: string;
}

// Finance / Accounting Module Entities (mirrors EduCore.API DTOs — AccountingController)
// Note: string status/type fields below are real backend enums (BillStatus, PaymentStatus,
// PaymentMethod, FeeType) serialized as PascalCase strings by the global JsonStringEnumConverter —
// they are unrelated to the numeric BillStatus/PaymentStatus consts defined earlier in this file,
// which remain in use only by StatusChip's legacy numeric fallback path.

export interface SchoolFee {
  id: number;
  feeName: string;
  feeType: string;
  amount: number;
  academicYearId: number;
  academicYearName: string;
  gradeLevelId: number | null;
  gradeLevelName: string | null;
  isMandatory: boolean;
  isActive: boolean;
}

export interface SchoolFeeFormPayload {
  feeName: string;
  feeType: string;
  amount: number;
  academicYearId: number;
  gradeLevelId: number | null;
  isMandatory: boolean;
  isActive?: boolean;
}

export interface StudentBillItem {
  id: number;
  schoolFeeId: number | null;
  feeName: string;
  amount: number;
  discountAmount: number;
  netAmount: number;
  notes: string | null;
}

export interface OfficialReceipt {
  id: number;
  paymentId: number;
  receiptNumber: string;
  totalAmountPaid: number;
  payerName: string;
  issuedAt: string;
  issuedByName: string;
  isCancelled: boolean;
  cancellationReason: string | null;
}

export interface FinancePayment {
  id: number;
  paymentNumber: string;
  studentBillId: number;
  billNumber: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  status: string;
  remarks: string | null;
  paymentDate: string;
  processedByEmployeeId: number;
  processedByName: string;
  receipt: OfficialReceipt | null;
}

export interface StudentBill {
  id: number;
  billNumber: string;
  enrollmentId: number;
  studentNumber: string;
  studentName: string;
  gradeLevelName: string;
  subTotal: number;
  discountAmount: number;
  discountRemarks: string | null;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string;
  createdAt: string;
  items: StudentBillItem[];
  payments: FinancePayment[];
}

export interface ProcessPaymentPayload {
  studentBillId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  remarks: string;
  processedByEmployeeId: number;
}

export interface AccountingDashboard {
  todayCollection: number;
  monthlyCollection: number;
  totalOutstandingBalances: number;
  paidStudentsCount: number;
  unpaidStudentsCount: number;
  pendingBillsCount: number;
  recentPayments: FinancePayment[];
}

export interface AccountingQueueItem {
  applicationId: number;
  applicationNumber: string;
  applicantName: string;
  gradeApplyingFor: string;
  schoolYear: string;
  verificationSlipNumber: string;
  dateVerified: string | null;
  assignedRegistrar: string;
  status: string;
  queueStage: 'ReadyForAssessment' | 'AssessmentInProgress' | 'Paid';
  financialClearanceStatus: string;
  billId: number | null;
  totalBilled: number;
  totalPaid: number;
  remainingBalance: number;
}

export interface GenerateAssessmentPayload {
  applicationId: number;
  tuitionFee: number;
  miscellaneousFee: number;
  laboratoryFee: number;
  booksFee: number;
  voucherAmount: number;
  discountAmount: number;
  discountRemarks?: string;
  dueDate?: string;
}

export interface PaymentAdjustmentPayload {
  paymentId: number;
  newAmount: number;
  reason: string;
  approvedByEmployeeId?: number;
}

// Student Portal Entities (mirrors EduCore.API DTOs — StudentDashboardController, StudentHistoryController)

export interface StudentPortalProfile {
  studentId: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
}

export interface StudentPortalSubject {
  subjectId: number;
  subjectName: string;
  teacher: string;
  section: string;
}

export interface StudentPortalGrade {
  subject: string;
  teacher: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  remarks: string;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  content: string;
  category: string;
  targetRoles: string;
  isPublished: boolean;
  publishedAt: string | null;
  isArchived: boolean;
  createdByEmployeeName?: string;
  createdAt?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  category: string;
  targetRoles: string;
  createdByEmployeeId?: number;
}

export interface AdminAuditLog {
  id: number;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export interface PagedAuditLogResponse {
  items: AdminAuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ReportsOverview {
  availableTemplatesCount: number;
  generatedThisMonthCount: number;
  totalActiveStudents: number;
  totalActiveEmployees: number;
  totalRevenueCollected: number;
  totalOutstandingBalance: number;
}

export interface StudentReportItem {
  studentId: number;
  studentNumber: string;
  fullName: string;
  gradeLevel: string;
  section: string;
  status: string;
}

export interface TeacherReportItem {
  employeeId: number;
  employeeNumber: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  isActive: boolean;
}

export interface FinanceReportItem {
  transactionId: number;
  referenceNumber: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}

export interface GradeReportItem {
  subjectCode: string;
  subjectName: string;
  averageGrade: number;
  passingRate: number;
  enrolledStudentsCount: number;
}

export interface SectionSubjectDetail {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  units: number;
  isCoreSubject?: boolean;
  teacherEmployeeId?: number;
  teacherName: string;
  hasTeacher: boolean;
}


export interface AvailableSection {
  sectionId: number;
  sectionName: string;
  recommended: boolean;
  recommendationSummary: string;
  recommendationReasons: string[];
  readinessStatus: 'Ready' | 'Warning' | 'Incomplete' | 'Full';
  sectionHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Configuration Required';
  remainingSlots: number;
  capacity: number;
  currentEnrollment: number;
  enrollmentPercentage: number;
  adviserName: string;
  adviserEmployeeId?: number;
  hasAdviser: boolean;
  assignedSubjects: number;
  requiredSubjects: number;
  assignedTeachers: number;
  requiredTeachers: number;
  isSubjectComplete: boolean;
  isTeacherComplete: boolean;
  schoolYear: string;
  gradeLevelName: string;
  trackCode: string;
  strandCode: string;
  subjects: SectionSubjectDetail[];
  warnings: string[];
  reasonsNotSelectable: string[];
  isSelectable: boolean;
}

export interface SectionValidationResult {
  isValid: boolean;
  code: string;
  errors: string[];
}
