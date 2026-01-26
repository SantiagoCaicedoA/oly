# Oly

Oly is an AI-powered training app for Olympic weightlifting, designed to help athletes train with intention, adapt to daily readiness, and progress long-term without overtraining.

The app combines structured weightlifting methodology with athlete feedback and intelligent adjustments to deliver a calm, focused coaching experience.

---

## Purpose

Oly is built for:

- Olympic weightlifters
- Strength-focused athletes
- Coaches and training groups

The goal is not to replace coaching, but to **support better training decisions** through clear structure, feedback, and adaptive logic.

---

## Core Principles

- Athlete-first design
- Long-term development over short-term peaks
- Clear structure, minimal distraction
- Intelligent adaptation based on readiness and soreness
- Calm, supportive coaching tone — never aggressive or overwhelming

---

## MVP Scope (Testing Version)

The first version of Oly will focus on:

- Athlete onboarding (profile, experience, equipment, weaknesses)
- Daily readiness & soreness check-ins
- Structured training sessions (sets, reps, load, RPE)
- Post-lift feedback input
- Basic AI-driven adjustments (volume / intensity guidance)
- Clean, minimal UI aligned with provided Figma designs

**Out of scope for MVP:**

- Payments
- Public launch features
- Advanced analytics
- Full social/community features

---

## Design

Designs are provided in Figma and should be treated as the source of truth.

- Minimal, modern, athlete-focused
- iOS-first thinking

Figma link will be shared separately.

---

## Tech Stack (Initial)

> Final stack may evolve during development.

Planned direction:
**Frontend**

- React Native (Expo)
- Routing: `expo-router`
- State Management: Redux
- API Handling: RTK Query

**Backend**

- Node.js / Express
- Database: MongoDB
- Storage: AWS S3
- Deployment: AWS ECS
