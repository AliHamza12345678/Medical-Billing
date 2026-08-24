# MediBill Pro — API Contract Map & DTO Specifications

## Overview
This document defines the production API contract mapping between the existing Next.js frontend pages, Admin Panel workflows, and backend `/api/` and `/api/v1/` RESTful endpoints.

---

## 1. Response DTO Specification
All production API endpoints return standardized JSON response DTOs:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "version": "v1",
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

Error responses follow the standardized error payload:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payment payload",
    "details": {
      "amount": ["Payment amount must be greater than $0.00"]
    }
  }
}
```

---

## 2. Frontend Page to Backend API Mapping

| Frontend Page / Route | Primary Action | Target API Endpoint | Method | RBAC Permission |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | View practice analytics | `/api/dashboard/stats` | `GET` | `admin.view` |
| `/patients` | List patients | `/api/patients` | `GET` | `patients.view` |
| `/patients/[id]` | View patient detail & history | `/api/patients/[id]` | `GET` | `patients.view` |
| `/insurance/eligibility` | Verify 270/271 eligibility | `/api/insurance/eligibility` | `POST` | `insurance.edit` |
| `/insurance/authorizations` | Manage prior auths | `/api/insurance/authorizations` | `GET/POST` | `insurance.edit` |
| `/charges` | Charge entry drafting & submit | `/api/charges` | `GET/POST` | `charges.edit` |
| `/claims` | List claims & filter | `/api/v1/claims` | `GET` | `claims.view` |
| `/claims/new` | Create claim transaction | `/api/claims` | `POST` | `claims.edit` |
| `/claims/[id]` | View claim details & 837 EDI | `/api/claims/[id]` & `/edi837` | `GET` | `claims.view` |
| `/claims/[id]` | Submit claim | `/api/claims/[id]/submit` | `POST` | `claims.edit` |
| `/payments` | List payments | `/api/v1/payments` | `GET` | `payments.view` |
| `/payments/[id]` | Allocate payment to claim | `/api/payments/[id]/allocate` | `POST` | `payments.edit` |
| `/payments/adjustments` | Post financial adjustment | `/api/payments/adjustments` | `POST` | `payments.edit` |
| `/payments/refunds` | Process patient refund | `/api/payments/refunds` | `POST` | `payments.edit` |
| `/payments/invoices` | List patient invoices | `/api/payments/invoices` | `GET/POST` | `payments.view` |
| `/reports/revenue` | View revenue performance | `/api/reports/revenue` | `GET` | `reports.view` |
| `/reports/aging` | View AR aging breakdown | `/api/reports/aging` | `GET` | `reports.view` |
| `/reports/providers` | View provider performance | `/api/reports/providers` | `GET` | `reports.view` |
| `/reports/insurance` | View payer performance | `/api/reports/insurance` | `GET` | `reports.view` |
| `/notifications` | Notification center | `/api/notifications` | `GET/PATCH/DEL` | Auth Session |
| `/portal` | Patient self-service portal | `/api/portal/summary` | `GET` | Patient Auth |
| `/portal/pay` | Submit card payment | `/api/portal/pay` | `POST` | Patient Auth |
| `/api/health` | Liveness check | `/api/health` & `/api/v1/health` | `GET` | Public |
| `/api/readiness` | System readiness check | `/api/readiness` | `GET` | Public |
