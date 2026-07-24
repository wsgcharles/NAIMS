# EduCore Information Architecture & Master Module Map

```
[ EduCore Unified Platform ]
├── Public Institutional Website (PublicLayout)
│   ├── Home (/)
│   ├── About (/about)
│   ├── Academics (/academics)
│   ├── Admissions Overview (/admissions)
│   ├── Online Application Wizard (/admissions/apply)
│   ├── News (/news)
│   ├── Events (/events)
│   ├── Gallery (/gallery)
│   └── Contact (/contact)
│
├── Authentication Entry Points (PortalSelection & Single Login Pages)
│   ├── Portal Selection (/portal)
│   ├── Student Login (/student/login)
│   ├── Parent Login (/parent/login)
│   └── Employee SSO (/employee/login)
│
├── Applicant Portal Workspace (/applicant/dashboard)
│
└── Authenticated Enterprise Workspace (DashboardLayout + PBAC Guards)
    ├── Super Administrator Command Center (/admin/dashboard)
    │   ├── Student Roster (/admin/students)
    │   ├── Teacher Directory (/admin/teachers)
    │   ├── Employee Roster (/admin/employees)
    │   ├── Subject Catalog (/admin/subjects)
    │   ├── Grade Approvals (/admin/grades)
    │   ├── Finance & Accounting (/admin/accounting)
    │   ├── Executive Reports (/admin/reports)
    │   ├── Roles & PBAC Matrix (/admin/roles)
    │   ├── Security Audit Logs (/admin/audit-logs)
    │   ├── Announcements Broadcast (/admin/announcements)
    │   ├── System Settings (/admin/settings)
    │   └── Master Admission Settings (/admin/admissions-settings)
    │
    ├── Registrar Workspace (/registrar/dashboard)
    │   ├── Enrollment Queue (/registrar/enrollment)
    │   └── Applicant Workspace (/registrar/applicants)
    │
    ├── Faculty Teacher Workspace (/teacher/dashboard)
    │   └── Daily Attendance Tracker (/teacher/attendance)
    │
    ├── Student Workspace (/student/dashboard)
    │
    └── Parent Oversight Portal (/parent/dashboard)
```
