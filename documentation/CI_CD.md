# CI/CD Guide

This repository now includes GitHub Actions workflows for continuous integration and continuous delivery.

## Workflows

### CI

File: `.github/workflows/ci.yml`

Runs on pushes and pull requests targeting `main` or `master`.

It performs:

1. Backend restore, build, and test using `.NET 10`.
2. Frontend dependency install with `npm ci`.
3. Frontend lint.
4. Frontend unit tests.
5. Frontend production build.

### CD

File: `.github/workflows/cd.yml`

Runs on:

1. Pushes to `main` or `master`
2. Tags matching `v*`
3. Manual runs via `workflow_dispatch`

It performs:

1. Backend publish to a deployable folder.
2. Frontend production build.
3. Upload of backend and frontend build artifacts to the workflow run.
4. Creation of a GitHub Release with packaged backend and frontend archives when a version tag such as `v1.0.0` is pushed.

## Required Repository Setup

### Recommended Branch

Use `main` as the primary branch on GitHub. The workflows also support `master` to match the current local repository state.

### Optional Secret

Add this repository secret if your production frontend should call a deployed API:

- `VITE_API_URL`: for example `https://your-api-domain.example.com/api`

If this secret is not set, the frontend build falls back to `http://localhost:5000/api`, which is suitable for CI validation but not for production deployment.

## How To Use

### Run CI

Open a pull request or push changes to `main` or `master`.

### Produce Delivery Artifacts

Push to `main` or `master`, then download these workflow artifacts from the Actions run:

1. `etracker-backend-publish`
2. `etracker-frontend-dist`

### Create A Versioned Release

Push a Git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

That will create a GitHub Release containing:

1. `etracker-backend-v1.0.0.tar.gz`
2. `etracker-frontend-v1.0.0.tar.gz`

## Notes

1. This setup implements artifact-based delivery because the repository does not yet define a concrete production host for the backend.
2. If you want fully automated deployment to Azure, Render, Railway, IIS, or another target, the next step is to add a deployment-specific workflow and the required secrets.
