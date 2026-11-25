# Next.js Client Template

Template for a Next.js (App Router) client consuming the [`spring-template`](https://github.com/UdL-EPS-SoftArch/spring-template) Spring Data REST (HAL+JSON) backend, with shadcn/ui, `react-hook-form`, and Cucumber + Playwright E2E BDD testing.

[![Open Issues](https://img.shields.io/github/issues-raw/UdL-EPS-SoftArch/react-template?logo=github)](https://github.com/UdL-EPS-SoftArch/react-template/issues)
[![CI/CD](https://github.com/UdL-EPS-SoftArch/react-template/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/UdL-EPS-SoftArch/react-template/actions)
[![Cucumber Reports](https://img.shields.io/badge/cucumber-reports-brightgreen)](https://UdL-EPS-SoftArch.github.io/react-template/reports/results.html)
[![Deployment status](https://img.shields.io/github/deployments/UdL-EPS-SoftArch/react-template/github-pages?label=deployment)](https://react-template-sage.vercel.app)

## Vision

**For** students learning full-stack web engineering with Next.js and Spring Data REST
**who** want to practice modern React Server/Client Components and hypermedia-driven API consumption
**the project** is a frontend template project
**that** provides user registration, Basic authentication, and secured record management integrated with a HAL+JSON backend
**Unlike** other templates, this one is designed for iterative feature building with E2E BDD (Cucumber + Playwright) tests driving the development

## Getting Started

1. Start the Spring Boot backend ([`spring-template`](https://github.com/UdL-EPS-SoftArch/frivlegion-api)) on `http://127.0.0.1:8080`.
2. Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running E2E BDD Tests

With both the backend (`http://127.0.0.1:8080`) and frontend (`http://localhost:3000`) running:

```bash
npm run test:e2e
# or concise CI output:
npm run test:e2e:ci
```

Reports are generated in `playwright-report/results.html` and `playwright-report/results.json`.

## AI-Assisted Spec-Driven Development (SDD)

This repository serves as a starter template for **AI-Assisted Spec-Driven Development (SDD)** with **Next.js (App Router)**, **Spring Data REST (HAL)**, and **Cucumber + Playwright BDD**.

It is pre-configured with agent skills (`skills/`), repository instructions (`AGENTS.md`, `CONVENTIONS.md`), and Aider configuration (`.aider.conf.yml`) to support both:
1. **Full-Capability AI Agents** (OpenCode, Claude Code, Cursor, GitHub Copilot, Windsurf).
2. **Token-Constrained APIs** (Aider paired with Groq free tier - 8K token limits).

For complete stage-by-stage instructions and command workflows, see **[AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md)**.

### SDD Agent Skills (`skills/`)
- **`skills/sdd-feature-designer/SKILL.md`**: Draft concise Cucumber E2E `.feature` specs in `tests/e2e/`.
- **`skills/sdd-cucumber-steps/SKILL.md`**: Implement Cucumber + Playwright step definitions in `tests/e2e/steps/*.steps.ts`.
- **`skills/nextjs-hal-api/SKILL.md`**: Create TypeScript HAL entity types (`src/types/`) and Spring Data REST API service classes (`src/api/`).
- **`skills/nextjs-ui-pages/SKILL.md`**: Create Next.js App Router Server/Client pages and `react-hook-form` + shadcn/ui forms (`src/app/`).
- **`skills/sdd-bdd-verifier/SKILL.md`**: Run `npm run test:e2e:ci` and `npm run build` and diagnose test failures.
