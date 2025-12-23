# Docker Setup for StoryGenApp

This document explains how to build and run StoryGenApp using Docker.

## Building the Docker Image

### Using Docker Directly

To build the Docker image locally:

```bash
docker build -t storygen-app:latest .
```

### Using Docker Compose

To build and run with Docker Compose:

```bash
docker-compose up --build
```

## Running the Docker Container

### Basic Run (Port Mapping)

```bash
docker run -d \
  -p 3005:3005 \
  -p 5180:5180 \
  --name storygen-app \
  storygen-app:latest
```

### With Environment Variables

```bash
docker run -d \
  -p 3005:3005 \
  -p 5180:5180 \
  -e GOOGLE_API_KEY=your_api_key \
  -e NODE_ENV=production \
  --name storygen-app \
  storygen-app:latest
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## GitHub Actions Docker Build

The project includes automated Docker builds via GitHub Actions. The workflow:

- **Triggers**: Push to main/develop branches, pull requests, and version tags
- **Builds**: Multi-stage build optimizing for size and performance
- **Pushes**: To GitHub Container Registry (ghcr.io) for authenticated users
- **Caching**: Uses GitHub Actions cache for faster builds

### Configuration

To enable Docker image pushing to GitHub Container Registry:

1. The workflow automatically uses `GITHUB_TOKEN` for authentication
2. Built images are available at: `ghcr.io/your-username/storygen-app:tag`

## Image Details

- **Base Image**: Node.js 18 Alpine (lightweight)
- **Frontend**: Built with Vite and included in the image
- **Backend**: Express.js server serving frontend + API
- **Dependencies**: Includes ffmpeg and build tools for native modules
- **Ports Exposed**: 
  - 3005 (Backend API)
  - 5180 (Frontend via backend)

## Environment Variables

Key environment variables:

- `NODE_ENV`: Set to `production` (default)
- `PORT`: Backend port (default: 3005)
- `GOOGLE_API_KEY`: Required for Google Gemini API
- `DATABASE_PATH`: Path to SQLite database (optional)

See `backend/.env.example` for all available options.

## Healthcheck

The Docker image includes a healthcheck that verifies the backend is responding on port 3005. Failed healthchecks will mark the container as unhealthy.

## Image Optimization

The Dockerfile uses a multi-stage build to:

1. Build the frontend in one stage
2. Copy only production dependencies and built assets to the final image
3. Reduce final image size significantly

## Troubleshooting

### Container exits immediately
- Check logs: `docker logs storygen-app`
- Ensure required environment variables are set

### Port already in use
- Use different ports: `docker run -p 8080:3005 ...`
- Kill existing container: `docker rm -f storygen-app`

### Database issues
- Mount a volume for persistent data: `-v /path/to/data:/app/backend/data`

## Pushing to Other Registries

To push to Docker Hub or another registry:

```bash
docker build -t yourusername/storygen-app:latest .
docker push yourusername/storygen-app:latest
```

Update the GitHub Actions workflow's `REGISTRY` and `IMAGE_NAME` to use your preferred registry.
