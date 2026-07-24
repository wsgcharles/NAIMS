export const ApplicationStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  UnderVerification: 'UnderVerification',
  WaitingForDocuments: 'WaitingForDocuments',
  InterviewScheduled: 'InterviewScheduled',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Waitlisted: 'Waitlisted',
  ConvertedToStudent: 'ConvertedToStudent',
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ApplicantType = {
  NewStudent: 'NewStudent',
  Transferee: 'Transferee',
  ReturningStudent: 'ReturningStudent',
} as const;

export type ApplicantType = (typeof ApplicantType)[keyof typeof ApplicantType];

export const DocumentVerificationStatus = {
  Pending: 'Pending',
  Verified: 'Verified',
  NeedsReplacement: 'NeedsReplacement',
  Rejected: 'Rejected',
} as const;

export type DocumentVerificationStatus = (typeof DocumentVerificationStatus)[keyof typeof DocumentVerificationStatus];

export interface ApplicantDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: DocumentVerificationStatus;
  remarks?: string;
}

export interface ApplicantRecord {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicantType: ApplicantType;
  gradeLevel: string;
  track?: string;
  previousSchool?: string;
  generalAverage?: number;
  submissionDate: string;
  status: ApplicationStatus;
  documents: ApplicantDocument[];
  assignedRegistrar?: string;
  interviewDate?: string;
  notes?: string[];
  studentNumberGenerated?: string;
}
