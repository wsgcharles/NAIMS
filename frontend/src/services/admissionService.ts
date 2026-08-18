import apiClient from './apiClient';

export interface CreateEnrollmentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthDate: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  parentName: string;
  parentContact: string;
  parentEmail?: string;
  relationship: string;

  previousSchool: string;
  gradeApplyingFor: string;
  track?: string;
  strand?: string;
}


export interface ApplicationDocumentItem {
  id: number;
  admissionDocumentTypeId?: number;
  documentName: string;
  status: 'Missing' | 'Uploaded' | 'Verified' | 'Rejected';
  digitalStatus?: 'PendingUpload' | 'Uploaded' | 'Verified' | 'Rejected';
  originalStatus?: 'NotSubmitted' | 'Submitted' | 'Verified' | 'Rejected';
  remarks?: string;
  originalRemarks?: string;
  originalFilename?: string;
  contentType?: string;
  fileSize?: number;
  uploadedAt?: string;
  verifiedAt?: string;
  originalSubmittedAt?: string;
  originalVerifiedAt?: string;
  version: number;
  isActive: boolean;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface UploadDocumentResponse {
  id: number;
  enrollmentApplicationId: number;
  admissionDocumentTypeId?: number;
  documentName: string;
  originalFilename: string;
  storedFilename: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
  version: number;
  downloadUrl: string;
  previewUrl: string;
}

export interface VerifyDocumentPayload {
  documentId: number;
  status: 'Verified' | 'Rejected' | 'Missing';
  remarks?: string;
}

export interface StatusHistoryItem {
  fromStatus: string;
  toStatus: string;
  remarks?: string;
  timestamp: string;
}

export interface TrackApplicationResponse {
  id: number;
  applicationNumber: string;
  fullName: string;
  email: string;
  gradeApplyingFor: string;
  status: string;
  stageIndex: number;
  currentStageTitle: string;
  estimatedNextStep: string;
  applicantRemarks?: string;
  createdAt: string;
  updatedAt?: string;
  hasRegistrarVerificationSlip?: boolean;
  verificationSlipNumber?: string;
  verificationSlipGeneratedAt?: string;
  appointment?: AppointmentItem;
  documents: ApplicationDocumentItem[];
  statusHistory: StatusHistoryItem[];
}

export interface AppointmentItem {
  id: number;
  enrollmentApplicationId: number;
  applicationNumber: string;
  applicantName: string;
  gradeApplyingFor: string;
  email: string;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Missed' | 'Cancelled' | 'Rescheduled';
  remarks?: string;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  appointmentDate: string;
  appointmentTime: string;
  remarks?: string;
}

export interface VerificationSlipItem {
  applicationNumber: string;
  applicantName: string;
  gradeLevel: string;
  schoolYear: string;
  verificationDate: string;
  verificationSlipNumber: string;
  qrCodeContent: string;
  verifiedByRegistrarName: string;
  verifiedDocuments: string[];
}

export interface UpdateStagePayload {
  status: string;
  applicantRemarks?: string;
  internalNotes?: string;
  documents?: {
    documentId: number;
    status: 'Missing' | 'Uploaded' | 'Verified' | 'Rejected';
    remarks?: string;
  }[];
}

export interface AssignSectionPayload {
  academicYearId: number;
  gradeLevelId: number;
  sectionId: number;
  adviserEmployeeId?: number;
  homeroom?: string;
}

export interface RegistrarAnalytics {
  submittedToday: number;
  submittedThisWeek: number;
  underReview: number;
  documentsPending: number;
  assessmentsPending: number;
  enrolledStudents: number;
  rejectedApplications: number;
  averageProcessingTimeHours: number;
  conversionRatePercentage: number;
}

export interface StudentEnrollmentStatus {
  schoolYear: string;
  isEnrollmentOpen: boolean;
  enrollmentPeriodText: string;
  status: string;
  canEnrollNow: boolean;
  assessmentStatus: string;
  paymentStatus: string;
  sectionStatus: string;
  sectionName?: string;
}

export interface AdmissionDocumentType {
  id: number;
  name: string;
  isRequired: boolean;
  applicableEducationLevel: string;
  displayOrder: number;
  isActive: boolean;
}

export const admissionService = {
  submitApplication: async (payload: CreateEnrollmentPayload) => {
    const response = await apiClient.post('/Enrollment', payload);
    return response.data;
  },

  trackApplication: async (applicationNumber: string, email: string): Promise<TrackApplicationResponse> => {
    const response = await apiClient.get<TrackApplicationResponse>('/Enrollment/track', {
      params: { applicationNumber, email },
    });
    return response.data;
  },

  getDocumentTypes: async (): Promise<AdmissionDocumentType[]> => {
    const response = await apiClient.get<AdmissionDocumentType[]>('/Enrollment/document-types');
    return response.data;
  },

  uploadDocument: async (applicationId: number, documentTypeId: number, file: File): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UploadDocumentResponse>(
      `/Enrollment/${applicationId}/documents/${documentTypeId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  verifyDocumentStatus: async (documentId: number, status: 'Verified' | 'Rejected' | 'Missing', remarks?: string): Promise<ApplicationDocumentItem> => {
    const response = await apiClient.put<ApplicationDocumentItem>(`/Enrollment/documents/${documentId}/status`, {
      documentId,
      status,
      remarks,
    });
    return response.data;
  },

  verifyOriginalDocumentStatus: async (documentId: number, status: 'NotSubmitted' | 'Submitted' | 'Verified' | 'Rejected', remarks?: string): Promise<ApplicationDocumentItem> => {
    const response = await apiClient.put<ApplicationDocumentItem>(`/Enrollment/documents/${documentId}/original-status`, {
      documentId,
      status,
      remarks,
    });
    return response.data;
  },

  getDocumentHistory: async (documentId: number): Promise<ApplicationDocumentItem[]> => {
    const response = await apiClient.get<ApplicationDocumentItem[]>(`/Enrollment/documents/${documentId}/history`);
    return response.data;
  },

  previewDocumentBlob: async (documentId: number): Promise<{ blobUrl: string; contentType: string }> => {
    const response = await apiClient.get(`/Enrollment/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
    const contentType = (response.headers['content-type'] as string) || 'application/pdf';
    const blob = new Blob([response.data], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, contentType };
  },

  downloadDocumentBlob: async (documentId: number, originalFilename: string): Promise<void> => {
    const response = await apiClient.get(`/Enrollment/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = originalFilename || `document-${documentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  },

  updateStage: async (id: number, payload: UpdateStagePayload) => {
    const response = await apiClient.put(`/Enrollment/${id}/stage`, payload);
    return response.data;
  },

  assignSectionAndEnroll: async (id: number, payload: AssignSectionPayload) => {
    const response = await apiClient.put(`/Enrollment/${id}/assign-section`, payload);
    return response.data;
  },

  getRegistrarAnalytics: async (): Promise<RegistrarAnalytics> => {
    const response = await apiClient.get<RegistrarAnalytics>('/Enrollment/analytics/registrar');
    return response.data;
  },

  getStudentEnrollmentStatus: async (): Promise<StudentEnrollmentStatus> => {
    const response = await apiClient.get<StudentEnrollmentStatus>('/Enrollment/student-status');
    return response.data;
  },

  confirmStudentReEnrollment: async () => {
    const response = await apiClient.post('/Enrollment/confirm-re-enrollment');
    return response.data;
  },

  // Appointment & Verification Slip API Methods
  scheduleAppointment: async (applicationId: number, payload: CreateAppointmentPayload): Promise<AppointmentItem> => {
    const response = await apiClient.post<AppointmentItem>(`/Enrollment/${applicationId}/appointment`, payload);
    return response.data;
  },

  getAppointment: async (applicationId: number): Promise<AppointmentItem> => {
    const response = await apiClient.get<AppointmentItem>(`/Enrollment/${applicationId}/appointment`);
    return response.data;
  },

  getAppointmentQueue: async (status?: string, date?: string): Promise<AppointmentItem[]> => {
    const response = await apiClient.get<AppointmentItem[]>('/Appointments/queue', {
      params: { status, date },
    });
    return response.data;
  },

  confirmAppointment: async (appointmentId: number): Promise<AppointmentItem> => {
    const response = await apiClient.put<AppointmentItem>(`/Appointments/${appointmentId}/confirm`);
    return response.data;
  },

  completeAppointment: async (appointmentId: number): Promise<AppointmentItem> => {
    const response = await apiClient.put<AppointmentItem>(`/Appointments/${appointmentId}/complete`);
    return response.data;
  },

  rescheduleAppointment: async (appointmentId: number, date: string, time: string): Promise<AppointmentItem> => {
    const response = await apiClient.put<AppointmentItem>(`/Appointments/${appointmentId}/reschedule`, {
      appointmentDate: date,
      appointmentTime: time,
    });
    return response.data;
  },

  cancelAppointment: async (appointmentId: number): Promise<AppointmentItem> => {
    const response = await apiClient.put<AppointmentItem>(`/Appointments/${appointmentId}/cancel`);
    return response.data;
  },

  generateVerificationSlip: async (applicationId: number): Promise<VerificationSlipItem> => {
    const response = await apiClient.post<VerificationSlipItem>(`/Enrollment/${applicationId}/verification-slip`);
    return response.data;
  },

  getVerificationSlip: async (applicationId: number): Promise<VerificationSlipItem> => {
    const response = await apiClient.get<VerificationSlipItem>(`/Enrollment/${applicationId}/verification-slip`);
    return response.data;
  },

  getPrograms: async (): Promise<{ id: number; code: string; name: string; isActive: boolean }[]> => {
    const response = await apiClient.get('/AcademicPrograms');
    return response.data;
  },
};
