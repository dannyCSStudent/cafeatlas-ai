# AGENTS.md

# CafeAtlas AI Development Constitution

Version: 1.1

---

# Project Overview

CafeAtlas AI is an AI-powered coffee discovery platform focused on premium Mexican coffee.

This is NOT simply an ecommerce website.

The long-term vision is to become the world's most intelligent marketplace for discovering Mexican coffee and eventually authentic regional Mexican products.

The first product is coffee.

The real product is discovery.

Every engineering decision should move the platform toward that vision.

---

# Primary Mission

Produce production-quality software.

Every change should improve the project.

Never introduce technical debt when a better architecture is practical.

Every feature should be designed as though millions of users may eventually use it.

---

# Core Philosophy

Think like:

• Senior Software Architect
• Product Designer
• AI Engineer
• UX Designer
• Performance Engineer

Do not simply complete tasks.

Improve the project.

When there are multiple good solutions:

Choose the one that creates the best long-term architecture.

---

# Golden Rule

NEVER destroy working functionality.

Improvement is preferred over replacement.

Refactoring is preferred over rewriting.

Always preserve existing functionality unless explicitly instructed otherwise.

---

# Absolutely Forbidden

Never delete files because they appear unused.

Never replace an entire feature when only one component needs modification.

Never rename directories unless requested.

Never change APIs without updating all consumers.

Never leave the repository in a broken state.

Never commit placeholder implementations if a reasonable implementation can be produced.

Never remove comments that document architecture.

Never remove tests.

---

# Repository Architecture

This repository uses a Turborepo monorepo.

Current structure:

apps/

    api/      FastAPI backend

    web/      Next.js web app

    mobile/   Expo / React Native app

packages/

    ui/

    eslint-config/

    typescript-config/

Future shared packages may include:

packages/

    api-client/

    ai/

    coffee-engine/

    maps/

    payments/

    subscriptions/

    analytics/

Shared business logic belongs in packages whenever it can be reused across apps.

Backend domain logic belongs in `apps/api` and should be organized into clear modules for settings, routes, services, repositories, and schemas.

Avoid duplicate logic.

---

# Technology Stack

Frontend

- Next.js
- React
- TypeScript
- TailwindCSS

Mobile

- React Native
- Expo

Backend

- FastAPI
- Python
- Pydantic
- Pytest
- Uvicorn

Database

- PostgreSQL
- Supabase

Authentication

- Supabase Auth

Storage

- Supabase Storage

Payments

- Stripe

Maps

- Leaflet or Mapbox

AI

- OpenAI APIs
- Local LLMs where practical

# Backend Rules

Keep the API explicit and versioned.

Prefer thin route handlers and move business rules into services.

Keep request and response schemas typed.

Treat the database as an implementation detail behind the backend boundary.

Add new backend capabilities as modules, not ad hoc route code.

---

# Architecture Rules

Keep components small.

Keep functions pure whenever possible.

Prefer composition over inheritance.

Prefer reusable packages.

Avoid duplicated code.

Write readable code before clever code.

---

# UI Philosophy

The website should feel premium.

Think:

Apple

Airbnb

Linear

Stripe

Not Amazon.

Minimal.

Elegant.

Fast.

Whitespace is valuable.

Animations should feel natural.

---

# Product Vision

Version 1

A premium online coffee marketplace.

Version 2

Coffee discovery platform.

Version 3

AI Coffee Sommelier.

Version 4

Coffee Passport.

Version 5

Coffee Genome.

Version 6

Mexico's marketplace for regional products.

---

# User Experience Rules

Every page should answer:

What can I do here?

Why should I care?

What should I click next?

Avoid dead ends.

---

# Images

Optimize images.

Lazy load.

Use responsive formats.

Never ship oversized images.

---

# Performance

Performance is a feature.

Optimize:

Bundle size

Database queries

Image loading

Caching

Rendering

Avoid unnecessary re-renders.

---

# Accessibility

Keyboard navigation.

Screen reader support.

Semantic HTML.

Proper contrast.

Accessible forms.

---

# API Rules

REST first.

Consistent naming.

Typed responses.

Proper status codes.

Validation on every endpoint.

Never trust client input.

---

# Database Rules

Prefer normalized schema.

Use indexes.

Never duplicate data unnecessarily.

Always use migrations.

Never manually edit production schema.

---

# Security

Validate all inputs.

Escape output.

Never expose secrets.

Never hardcode API keys.

Protect admin routes.

Use least privilege.

---

# Git Rules

Small commits.

Meaningful commit messages.

Keep history readable.

Never force push unless instructed.

---

# Coding Style

Strict TypeScript.

Type hints in Python.

Meaningful variable names.

Avoid magic numbers.

Document complex logic.

---

# AI Features

AI should assist users.

AI should never block core functionality.

The platform must remain fully usable if AI services are unavailable.

---

# Feature Development Workflow

For every requested feature:

1.

Understand the problem.

2.

Inspect existing code.

3.

Design the smallest clean solution.

4.

Implement.

5.

Test.

6.

Verify nothing else broke.

7.

Suggest improvements if appropriate.

---

# Decision Priority

1 Architecture

2 Reliability

3 User Experience

4 Performance

5 Developer Experience

6 Nice-to-have features

---

# If Unsure

Do not guess.

Inspect the repository.

Read surrounding code.

Follow existing conventions.

Ask for clarification only when absolutely necessary.

---

# End Goal

The finished product should become the best online destination for discovering and purchasing premium Mexican coffee.

Every pull request should move the project closer to that vision.
