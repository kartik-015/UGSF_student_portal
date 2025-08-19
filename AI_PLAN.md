# AI_PLAN.md

## 1. Error & Issue Scan
- Will run `npm run check` (typecheck + lint + build) and list all errors/warnings by file.
- Will run ESLint with next/core-web-vitals and Prettier, listing all issues.
- Will check for existing tests and failures; add Playwright e2e smoke tests if missing.

## 2. API Routes Audit
- Will enumerate all routes in `src/app/api/` and compare to intended endpoints in README.
- Will highlight missing endpoints, incorrect methods, or mismatched request/response shapes.

## 3. Mongoose Models Audit
- Will list all models in `src/models/` and compare fields/types/indexes to README schema.
- Will note missing fields, type mismatches, missing indexes/refs.

## 4. App Router & Component Audit
- Will map `src/app/` for route segments, layouts, and client/server component usage.
- Will check for missing "use client" directives, server action safety, and role-based access.

## 5. Auth & RBAC Audit
- Will review provider config, session/JWT callbacks, role handling, and college email validation.
- Will check `middleware.ts` for route protection and matcher correctness.
- Will verify or add a central `hasAccess` utility.

## 6. Real-Time & Uploads Audit
- Will check for singleton Socket.io server, client hook, and event usage.
- Will check for signed upload route, file type/size validation, and secure URL storage.

## 7. Frontend/UI Audit
- Will check that frontend fetches match backend API and DB truth.
- Will verify presence and consistency of loading/error/empty states.
- Will check for access guards in components/routes.

## 8. PDF Generation Audit
- Will check for reusable PDF component and correct data rendering.

## 9. Security & Env Audit
- Will create `env.example` and add startup guard in `lib/env.ts`.
- Will check for domain enforcement, input sanitization, rate limiting, secure cookies.

## 10. Testing & QA
- Will enable TypeScript strict and fix types.
- Will fix all ESLint/Prettier lints.
- Will add Playwright e2e smoke tests for all roles.
- Will add `scripts/seed.ts` for sample data.

## 11. Deliverables
- AI_PLAN.md (this file)
- All code fixes with clear commit messages
- CHANGELOG.md summarizing changes
- env.example complete
- scripts/seed.ts and README instructions
- QA_CHECKLIST.md for manual role-based QA
- All checks/tests passing
