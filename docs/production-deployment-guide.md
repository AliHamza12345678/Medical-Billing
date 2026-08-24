# MediBill Pro — Production Deployment & Release Engineering Guide

## 1. Secrets Management & Environment Security
- **Strict Prohibition**: Secrets (JWT keys, DB credentials, API keys, S3 keys) must **NEVER** be committed into git repositories or baked into Docker container images.
- **Production Management**: Use secret management vaults (e.g. AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets).
- **Environment Isolation**: Separate development, staging, and production infrastructure environments with distinct credentials and network VPCs.

---

## 2. Containerization Architecture
- **Web / API Container (`Dockerfile`)**: Multi-stage Node.js build outputting optimized standalone static Next.js assets.
- **Worker Container (`Dockerfile.worker`)**: Dedicated process executing background BullMQ queues (`claims`, `edi`, `era`, `exports`, `notifications`).
- **Compose Orchestration (`docker-compose.yml`)**: Connects Web, Worker, PostgreSQL, and Redis containers over isolated Docker networks.

---

## 3. Database Backup & Disaster Recovery
- **Automated Backups**: Daily PostgreSQL WAL archiving and pg_dump snapshots stored in encrypted, offsite S3 buckets.
- **Migration Strategy**: Execute `npx prisma migrate deploy` in isolated deployment pre-hooks before starting Web/API processes.
- **Rollback Procedure**: In the event of a deployment failure, roll back Web/API image tags while preserving historical transactional data in PostgreSQL.

---

## 4. Final End-to-End Workflow Verification
The complete production workflow from Admin Login through Claim Scrubbing, EDI 837/835, Financial Ledger, and Patient Portal payments has been verified:

1. **Admin Login** -> Session Cookie Issued
2. **Create Patient** -> PostgreSQL Record Created
3. **Add Insurance** -> Priority & Active Policy Set
4. **Eligibility Verification** -> Real 270/271 Clearinghouse Response
5. **Authorization** -> Usage & Tracking Validated
6. **Charge Entry** -> Coding Engine Active CPT/ICD Verified
7. **Claim Creation** -> Atomic `Claim` + `ClaimLine` Created
8. **Claim Scrubbing** -> 10-Point Pre-Submission Inspection Passed
9. **837 Generation** -> ASC X12 837P Transaction Generated
10. **Claim Submission** -> Clearinghouse Event Logged
11. **835 / ERA** -> Remittance Auto-Reconciled
12. **Payment Allocation** -> Over-Allocation Prevented
13. **Adjustments** -> Reversal/Adjustment Ledger Entry Created
14. **Invoices** -> Line Item Totals Calculated Server-Side
15. **Patient Portal** -> IDOR-Protected Patient View
16. **Patient Payment** -> Credit Card Masked & Ledger Credited
17. **Reports** -> Revenue & Aging Buckets Aggregated
18. **Notifications** -> Real-time Socket & Queue Dispatch
19. **Audit Log** -> Immutable Immutable Audit Entry Recorded
