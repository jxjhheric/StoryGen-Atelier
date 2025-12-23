# GitHub Actions Docker Build Setup

This document explains the automated Docker build and push workflow configured for StoryGenApp.

## Overview

The project now includes a complete GitHub Actions workflow that automatically builds Docker images and pushes them to GitHub Container Registry (GHCR) on every push and pull request.

## Workflow Configuration

**File**: `.github/workflows/docker-build.yml`

### Trigger Events

The workflow is triggered on:

1. **Push to branches**:
   - `main` - Always builds and pushes
   - `develop` - Always builds and pushes
   - `ci/*` - Feature branches with `ci/` prefix (builds and pushes)

2. **Pull Requests**:
   - To `main` or `develop` - Builds for verification (no push)

3. **Tags**:
   - `v*` - Version tags (e.g., `v1.0.0`) trigger full build and push with semantic versioning

4. **Manual Trigger**:
   - Supports `workflow_dispatch` for manual runs

### Image Tagging Strategy

The workflow automatically generates multiple tags for each image:

- **Branch tags**: `branch-name`, `latest` (for main)
- **Semantic version tags**: `v1.0.0`, `1.0`, `1` (from git tags)
- **Commit SHA**: `branch-sha-xxxxx` for tracking exact commits
- **Latest**: Applied to main branch builds

Example tags generated:
```
ghcr.io/your-username/storygen-app:main
ghcr.io/your-username/storygen-app:main-abc123def
ghcr.io/your-username/storygen-app:latest
ghcr.io/your-username/storygen-app:v1.0.0
ghcr.io/your-username/storygen-app:1.0
```

### Registry Configuration

- **Registry**: GitHub Container Registry (ghcr.io)
- **Image Path**: `ghcr.io/your-username/storygen-app`
- **Authentication**: Uses `GITHUB_TOKEN` (automatically provided)

## Build Details

### Docker Buildx

Uses `docker/setup-buildx-action` for enhanced building capabilities:
- Multi-platform support (x86_64, ARM64)
- Advanced caching with GitHub Actions cache backend
- Parallel layer building for faster builds

### Caching Strategy

- **From**: GitHub Actions cache (`type=gha`)
- **To**: GitHub Actions cache with max compression (`mode=max`)
- **Benefits**: Subsequent builds are significantly faster by reusing layers

### Build Context

- **Dockerfile**: `/Dockerfile` (multi-stage build)
- **Context**: Repository root
- **Registry**: GHCR (ghcr.io)

## Permissions

The workflow requires these GitHub permissions:

```yaml
permissions:
  contents: read        # To read repository contents
  packages: write       # To write to GitHub Packages (GHCR)
  id-token: write       # For OIDC token generation (if needed)
```

## Image Contents

The Docker image includes:

1. **Frontend**: Pre-built React + Vite application
2. **Backend**: Node.js Express API server
3. **Dependencies**: All npm dependencies (production-only)
4. **System Tools**: ffmpeg, build tools for native modules
5. **Database**: SQLite support

See [Dockerfile](Dockerfile) for build stages and details.

## How to Use Built Images

### Pull from GHCR

```bash
# Log in to GHCR
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u username --password-stdin

# Pull latest image
docker pull ghcr.io/your-username/storygen-app:latest

# Pull specific version
docker pull ghcr.io/your-username/storygen-app:v1.0.0

# Run the image
docker run -d -p 3005:3005 -p 5180:5180 ghcr.io/your-username/storygen-app:latest
```

### Access Credentials

To pull images from GHCR in CI/CD or local environments:

1. **GitHub Personal Access Token** (PAT):
   ```bash
   export GITHUB_TOKEN=your_pat_here
   echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin
   ```

2. **GitHub Actions** (automatic):
   The workflow uses `GITHUB_TOKEN` which is automatically provided

## Monitoring Builds

### View Workflow Runs

1. Go to GitHub repository
2. Click **Actions** tab
3. Select **"Build and Push Docker Image"** workflow
4. View build logs and artifacts

### View Published Images

1. Go to repository **Packages** section
2. Find `storygen-app` package
3. View available tags and pull commands

## Build Optimization

### Multi-stage Build

The Dockerfile uses multi-stage build to reduce image size:

1. **Stage 1**: Build frontend assets
2. **Stage 2**: Final image with backend + frontend

This approach:
- Excludes dev dependencies from final image
- Reduces layer count
- Optimizes for deployment

### Layer Caching

The GitHub Actions cache backend caches Docker layers:
- First build: ~2-5 minutes
- Subsequent builds: ~30-60 seconds (with cache)
- Pushes only new layers to GHCR

## Environment Variables in Container

When running the image, set required environment variables:

```bash
docker run -d \
  -p 3005:3005 \
  -p 5180:5180 \
  -e GOOGLE_API_KEY=your_key \
  -e VERTEX_PROJECT_ID=your_project \
  ghcr.io/your-username/storygen-app:latest
```

See `backend/.env.example` for all available options.

## Troubleshooting

### Build Fails

1. **Check logs**: GitHub Actions > Workflow run > Build and push Docker image step
2. **Common issues**:
   - Missing dependencies in Dockerfile
   - Node module compilation failures
   - Insufficient disk space in GitHub Runner

### Authentication Issues

1. Ensure workflow has `packages: write` permission
2. Check that `GITHUB_TOKEN` is available (GitHub provides this automatically)
3. Verify GHCR login step succeeds

### Image Push Fails

1. Verify GHCR permissions in repository settings
2. Check GitHub Actions workflow permissions
3. Ensure image name is lowercase (Docker Registry requirement)

## Manual Building Locally

```bash
# Build with same configuration
./build_docker.sh -n storygen-app -t latest

# Tag for GHCR
docker tag storygen-app:latest ghcr.io/your-username/storygen-app:latest

# Log in and push
echo $TOKEN | docker login ghcr.io -u username --password-stdin
docker push ghcr.io/your-username/storygen-app:latest
```

## CI/CD Integration

The workflow seamlessly integrates with:

- **GitHub Pages**: Deployment from GHCR images
- **Container Registry**: Automatic image push on merge
- **Version Management**: Semantic versioning from git tags
- **Release Automation**: Can trigger container deployment on release

## Security Considerations

1. **Registry Access**: Only authorized users can push to GHCR
2. **Token Rotation**: GitHub tokens are short-lived (valid only during workflow)
3. **Image Scanning**: GitHub provides vulnerability scanning for GHCR images
4. **Secrets Management**: Store sensitive data in GitHub Secrets, not in Dockerfile

## Next Steps

1. **Enable branch protection**: Require successful Actions checks before merge
2. **Add image scanning**: Enable Dependabot for container image scanning
3. **Set up deployments**: Use GHCR images for container deployment
4. **Monitor builds**: Set up notifications for failed builds

## Additional Resources

- [Dockerfile](Dockerfile) - Container build configuration
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Local Docker usage
- [GitHub Actions Docs](https://docs.github.com/actions)
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
