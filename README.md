# Compass Program

AI Answer Verification & Hallucination Detection Engine.

## Stack

- **Backend:** FastAPI (Python)
- **Frontend:** Next.js + React + Tailwind CSS

## Development workflow (6 steps)

This project is delivered in parts using `main` + feature branches and pull requests:

| Step | Branch / PR | What it adds |
|------|-------------|--------------|
| 1 | `main` | Project scaffold (README, `.gitignore`) |
| 2 | `feature/backend-core` | Backend config, models, dependencies |
| 3 | `feature/auth` | Auth service and user data store |
| 4 | `feature/verification-pipeline` | API, verification services, ground-truth data |
| 5 | `feature/frontend` | Next.js UI and visualizations |
| 6 | `feature/tests` | Backend unit tests |

Merge pull requests in order: **2 → 3 → 4 → 5 → 6**.

## Getting started

Setup details are added as each step is merged.
