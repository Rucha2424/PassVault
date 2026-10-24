# PassVault — Secure Cloud-Based Password Manager

![PassVault Banner](https://img.shields.io/badge/PassVault-Ultra%20Violet%20%C3%97%20Soft%20Apricot-6C3CE9?style=for-the-badge&logo=shield&logoColor=FFC9A9)
![Architecture](https://img.shields.io/badge/Architecture-Zero--Knowledge%20AES--256--GCM-24856B?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB-4923A6?style=for-the-badge)
![DevOps](https://img.shields.io/badge/DevOps-Docker%20%7C%20GitHub%20Actions-FFC9A9?style=for-the-badge&labelColor=2E2142)

PassVault is a production-grade, secure cloud-based password management web application designed for the **Cloud Computing and DevOps (CCD)** curriculum. It showcases a modern **Zero-Knowledge Architecture** featuring client-side cryptographic key derivation and symmetric encryption, coupled with containerized microservices and automated CI/CD pipelines.

---

## Table of Contents

1. [Design Vision & Tokens](#1-design-vision--tokens)
2. [Key Features](#2-key-features)
3. [Zero-Knowledge Encryption Architecture](#3-zero-knowledge-encryption-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Local Development Setup](#6-local-development-setup)
7. [Environment Variables](#7-environment-variables)
8. [Docker & Container Orchestration](#8-docker--container-orchestration)
9. [REST API Specification](#9-rest-api-specification)
10. [Automated Testing](#10-automated-testing)
11. [GitHub Actions CI/CD Pipeline](#11-github-actions-cicd-pipeline)
12. [Cloud Computing & DevOps (CCD) Concepts](#12-cloud-computing--devops-ccd-concepts)
13. [Security Considerations & Limitations](#13-security-considerations--limitations)

---

## 1. Design Vision & Tokens

PassVault is styled with a bespoke **Ultra Violet × Soft Apricot** palette. Rather than generic templates or dark neon dashboards, it presents a light-first, warm ivory surface with intentional visual hierarchy and strict button design constraints:

- **Ultra Violet (`#6C3CE9`)**: Signature brand color for primary actions, active navigation, and high-priority states.
- **Deep Violet (`#4923A6`)**: High-contrast brand accent for badges, icons, and text.
- **Soft Apricot (`#FFC9A9`)**: Warm complementary accent for highlights, indicators, and micro-illustrations.
- **Light Apricot (`#FFE4D3`)**: Gentle background tint for warning badges and callouts.
- **Warm Ivory (`#FFF9F5`)**: Natural light background across all pages.
- **Soft Lavender (`#EEE7FF`)**: Subtle card and secondary button backgrounds.
- **Deep Plum (`#2E2142`)**: High-contrast, readable typography.
- **Muted Text (`#776B83`)**: Subtitles, helper text, and secondary details.
- **Border (`#E9DFEE`)**: Fine dividers and card borders.
- **Success (`#24856B`)**, **Warning (`#B76A20`)**, **Error (`#C43D57`)**: Semantic indicators.

### Strict Button Guidelines
- Rectangular geometry with moderate 8–12px border radius (`rounded-lg`).
- **Zero pill-shaped / capsule buttons** (`rounded-full` is disallowed for buttons).
- **Zero transparent primary buttons** or floating glassmorphic buttons.
- Solid Ultra Violet backgrounds for primary buttons; solid white/lavender with fine borders for secondary buttons.

### Mandatory Top Navigation Bar
- A persistent, shared horizontal navigation bar is rendered at the top of **every single page**.
- **No persistent left or right sidebars**.
- Mobile navigation expands cleanly into a collapsible panel positioned directly below the top bar.

---

## 2. Key Features

- **End-to-End Client-Side Encryption**: Passwords and secure notes are encrypted using AES-256-GCM before leaving the client browser.
- **Zero-Knowledge Cloud Persistence**: The server and MongoDB database store only ciphertext, initialization vectors (IVs), and authentication tags. Even in the event of a full database leak, zero secrets can be read without the Master Password.
- **Shared Top Navigation on Every Page**: Home, Vault, Generator, Health Auditor, and Settings are easily accessible without sidebar drawers.
- **Cryptographic Password Generator**: Uses hardware-backed `crypto.getRandomValues()` (never `Math.random()`) with length sliders (8–64), symbol exclusions, and ambiguity prevention.
- **Local Password Health Auditor**: Evaluates overall vault security score (0–100%), detects weak and reused passwords across services, and flags stale credentials (>90 days) purely in client memory.
- **Automatic Inactivity Lock Safeguard**: Purges the AES-256 decryption key from client memory after configurable inactivity timeouts (5m, 15m, 30m, 1h, or manual).
- **Protected Multi-Tenant Isolation**: Enforces user ownership checks on every database operation. Users cannot read, modify, or delete credentials belonging to other tenants.
- **Docker Compose Orchestration**: Multi-container stack (React/Vite with Nginx, Node.js Express, MongoDB) with persistent volumes, network isolation, and healthchecks.
- **Automated CI/CD**: GitHub Actions workflow running automated linting, unit tests, integration tests, frontend builds, and Docker build verifications.

---

## 3. Zero-Knowledge Encryption Architecture

PassVault implements a true zero-knowledge encryption model where the Master Password is never transmitted to or stored on the server:

```
[User Input: Master Password]
             │
             ├─────────────────────────────────────────────────┐
             ▼                                                 ▼
[PBKDF2 SHA-256 (100k iterations)]               [Bcrypt Master Password Hash]
             │                                                 │
             │ (Client-side with user vaultSalt)               │ (Sent over HTTPS for auth)
             ▼                                                 ▼
[In-Memory CryptoKey (AES-256-GCM)]            [Server Session Verification]
             │                                                 │
             ├─ Encrypts Passwords & Notes                     └─ Issues httpOnly JWT Cookie
             ├─ Decrypts Ciphertext in Memory
             └─ PURGED on Lock / Timeout / Logout
```

### Technical Specification
1. **Per-User Vault Salt**: During registration, the client generates a cryptographically secure 16-byte random salt (`vaultSalt`). This salt is stored alongside the user account.
2. **Key Derivation (PBKDF2)**:
   - Algorithm: PBKDF2
   - Hash Function: SHA-256
   - Iterations: 100,000
   - Output: 256-bit AES-GCM `CryptoKey`
3. **Payload Encryption (AES-256-GCM)**:
   - Mode: Galois/Counter Mode (GCM)
   - IV (Nonce): Fresh 12-byte (96-bit) cryptographically random IV per field
   - Authentication Tag: 128-bit integrity tag
4. **Tamper Detection**: If any bit of the ciphertext, IV, or tag is altered, Web Crypto's `subtle.decrypt()` automatically rejects the payload with an integrity check failure.
5. **Memory Protection**: The derived `CryptoKey` is held strictly in volatile React context memory (`VaultContext`). It is **never** written to `localStorage`, `sessionStorage`, or cookies.

---

## 4. Technology Stack

- **Frontend**:
  - React 19 + Vite
  - JavaScript (ES Modules)
  - Tailwind CSS + PostCSS
  - React Router 7
  - Lucide React
  - Axios (withCredentials for httpOnly cookies)
  - Vitest + React Testing Library + jsdom
- **Backend**:
  - Node.js 22 + Express 4 (ES Modules)
  - MongoDB 7 + Mongoose 8
  - bcryptjs (salted password hashing)
  - jsonwebtoken (httpOnly JWT sessions)
  - helmet (security headers)
  - cors (strictly configured origins)
  - cookie-parser
  - express-rate-limit (brute-force mitigation)
  - Jest 29 + Supertest + mongodb-memory-server
- **DevOps & Infrastructure**:
  - Docker & Docker Compose
  - Nginx (multi-stage static serving & reverse proxy)
  - GitHub Actions CI

---

## 5. Project Structure

```
c:\Users\deshp\CCND/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Shared TopNavbar, PrimaryButton, etc.
│   │   │   └── vault/            # CredentialRow, CredentialModal, etc.
│   │   ├── constants/            # Theme tokens (Ultra Violet x Soft Apricot)
│   │   ├── context/              # AuthContext, VaultContext, ToastContext
│   │   ├── crypto/               # Web Crypto AES-256-GCM & PBKDF2 logic
│   │   ├── pages/                # Landing, Login, Register, Vault, Generator, Health, Settings, 404
│   │   ├── services/             # Axios API client
│   │   ├── tests/                # Vitest unit tests (crypto, health, buttons)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile                # Multi-stage production image with Nginx
│   ├── nginx.conf                # Nginx reverse proxy and SPA configuration
│   ├── tailwind.config.js        # Design tokens
│   ├── vite.config.js            # Vite bundler & API proxy configuration
│   └── package.json
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # Database connection
│   │   ├── controllers/          # Auth, Credential, Dashboard controllers
│   │   ├── middleware/           # Auth, RateLimiter, Validation, ErrorHandler
│   │   ├── models/               # Mongoose User and Credential schemas
│   │   ├── routes/               # API endpoints
│   │   ├── tests/                # Jest integration, isolation, and CRUD tests
│   │   └── app.js                # Express app definition
│   ├── Dockerfile                # Non-root Node.js Alpine container
│   ├── jest.config.js
│   ├── server.js                 # Server entrypoint
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated GitHub Actions pipeline
├── docker-compose.yml            # Multi-service stack (frontend, backend, mongo)
├── .dockerignore
├── .gitignore
├── .env.example
└── README.md
```

---

## 6. Local Development Setup

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)
- MongoDB (or Docker)

### 1. Clone & Configure Environment
```bash
git clone <repository-url>
cd CCND
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend API starts on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server opens on `http://localhost:3000`.

---

## 7. Environment Variables

Configure these variables in your `.env` file:

| Variable | Description | Default (Local Dev) |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `CLIENT_URL` | Allowed CORS frontend URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/passvault` |
| `JWT_SECRET` | Secret key for JWT session tokens | Minimum 32-character secure secret |
| `COOKIE_SECRET` | Secret key for signed cookies | Secure secret string |
| `MONGO_INITDB_ROOT_USERNAME` | Root admin username for MongoDB container | `vaultadmin` |
| `MONGO_INITDB_ROOT_PASSWORD` | Root admin password for MongoDB container | `vaultsecret` |
| `MONGO_INITDB_DATABASE` | Default MongoDB database name | `passvault` |

---

## 8. Docker & Container Orchestration

To run the complete production-grade application stack (Frontend, Backend, and MongoDB) with persistent volumes and healthchecks:

```bash
# Build and start all containers in detached mode
docker compose up --build -d

# View real-time logs from all services
docker compose logs -f

# Check container health status
docker compose ps

# Gracefully stop the application
docker compose down

# Stop and wipe database volume (warning: deletes data)
docker compose down -v
```

### Container Endpoints:
- **Frontend Web UI**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api`
- **MongoDB**: `localhost:27017`

---

## 9. REST API Specification

All credential endpoints enforce authentication via httpOnly JWT cookies (`passvault_session`) or `Authorization: Bearer <token>`.

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user account with `email`, `masterPassword`, and `vaultSalt`.
- `POST /api/auth/login` — Authenticate user and receive session cookie and `vaultSalt`.
- `POST /api/auth/logout` — Terminate session and clear authentication cookie.
- `GET /api/auth/me` — Retrieve current user profile and vault settings.
- `PUT /api/auth/settings` — Update auto-lock timeout and user preferences.
- `DELETE /api/auth/account` — Permanently delete user account and all vault data (requires master password verification).

### Credential Endpoints (Multi-Tenant Isolated)
- `GET /api/credentials` — List all encrypted credentials for the authenticated user (supports `?category=`, `?favorite=`, `?search=`).
- `POST /api/credentials` — Save a new encrypted credential payload.
- `GET /api/credentials/:id` — Retrieve a specific credential by ID (returns 404 if not owned).
- `PUT /api/credentials/:id` — Update an existing credential (restricted to owner).
- `DELETE /api/credentials/:id` — Delete a credential (restricted to owner).

### System & Metrics Endpoints
- `GET /api/dashboard` — Retrieve vault statistics, category counts, and recent entries.
- `GET /api/health` — System healthcheck returning service status, uptime, and database state.

---

## 10. Automated Testing

PassVault includes automated test suites covering both frontend and backend logic.

### Running Frontend Tests
```bash
cd frontend
npm test
```
**Tests Covered (16 tests across 4 test suites)**:
- `crypto.test.js`: Web Crypto PBKDF2 key derivation, AES-256-GCM encryption/decryption, tampered ciphertext rejection, and key separation.
- `generator.test.js`: Hardware-backed random generation, length compliance, character set inclusion, and ambiguous character filtering.
- `health.test.js`: Local password health metrics, weak credential detection, reuse detection, and actionable suggestions.
- `buttons.test.jsx`: Design compliance verification (asserts rectangular `rounded-lg` geometry, prevents pill-shaped buttons, ensures solid Ultra Violet backgrounds).

### Running Backend Tests
```bash
cd backend
npm test
```
**Tests Covered (18 tests across 3 test suites)**:
- `auth.test.js`: Registration, duplicate rejection (409), password length validation, authentication, httpOnly cookie issuance, `/api/auth/me` validation, and logout.
- `credentials.test.js`: Encrypted credential creation, payload validation, listing, updates, deletion, and healthcheck.
- `isolation.test.js`: Strict multi-tenant security verification ensuring User B receives 404 when attempting to query, update, or delete User A's credentials.

---

## 11. GitHub Actions CI/CD Pipeline

The `.github/workflows/ci.yml` workflow automatically runs on every push and pull request to the `main` branch.

### Pipeline Stages:
1. **Frontend Lint, Test & Build**:
   - Sets up Node.js 22 with dependency caching.
   - Runs static lint checks (`oxlint`).
   - Executes Vitest unit tests for cryptographic algorithms and UI components.
   - Compiles Vite production bundle (`npm run build`).
2. **Backend Test & Verification**:
   - Sets up Node.js 22.
   - Runs Jest integration tests using an in-memory MongoDB server.
   - Verifies authentication flows, ownership checks, and API validation.
3. **Docker Image Build Validation**:
   - Builds `passvault-backend` and `passvault-frontend` Docker images using Docker Buildx to guarantee image reproducibility.

---

## 12. Cloud Computing & DevOps (CCD) Concepts

This project demonstrates core Cloud Computing and DevOps principles:

1. **Microservices Architecture**: Separation of concerns between static single-page frontend, REST API services, and persistent data layer.
2. **Containerization**: Multi-stage Docker builds minimizing production image sizes and attack surfaces.
3. **Infrastructure as Code (IaC)**: Reproducible environment definitions in `docker-compose.yml`.
4. **Automated Testing & CI/CD**: Immediate automated feedback on pull requests via GitHub Actions.
5. **Observability & Health Checks**: Native Docker and Nginx container health probes coupled with `/api/health` endpoints.
6. **Security-First Architecture (DevSecOps)**:
   - Zero-knowledge encryption.
   - Rate limiting against brute-force attacks.
   - HTTP security headers via Helmet and Nginx.
   - Non-root container execution (`USER node`).
   - httpOnly, sameSite, secure cookie handling.

---

## 13. Security Considerations & Limitations

- **Master Password Recovery**: Because PassVault operates on a zero-knowledge architecture, there is no back door or master password reset mechanism. If a user loses their master password, their encrypted credentials cannot be decrypted.
- **Client Workstation Security**: Client-side encryption protects data in transit and at rest in the cloud database. However, it assumes the user's host operating system and browser runtime are free of active keyloggers or malware.
- **Production TLS**: In local development, cookies use `secure: false` over HTTP. In production environments, HTTPS/TLS must be terminated at the reverse proxy or cloud load balancer with `secure: true`.

---

## License

This project was developed for educational and academic purposes as part of the Cloud Computing and DevOps coursework.
