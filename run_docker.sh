#!/bin/bash
# Run script for StoryGenApp Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="storygen-app:latest"
CONTAINER_NAME="storygen-app"
BACKEND_PORT=3005
FRONTEND_PORT=5180
REMOVE_EXISTING=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--image)
      IMAGE_NAME="$2"
      shift 2
      ;;
    -c|--container-name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="$2"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="$2"
      shift 2
      ;;
    --rm)
      REMOVE_EXISTING=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -i, --image              Image name (default: storygen-app:latest)"
      echo "  -c, --container-name     Container name (default: storygen-app)"
      echo "  --backend-port           Backend port (default: 3005)"
      echo "  --frontend-port          Frontend port (default: 5180)"
      echo "  --rm                     Remove existing container with same name"
      echo "  -h, --help               Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Remove existing container if requested
if [ "$REMOVE_EXISTING" = true ]; then
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${BLUE}Removing existing container: ${CONTAINER_NAME}${NC}"
    docker rm -f "$CONTAINER_NAME"
  fi
fi

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${RED}✗ Container '${CONTAINER_NAME}' already exists!${NC}"
  echo "Use --rm flag to remove it, or use 'docker start ${CONTAINER_NAME}'"
  exit 1
fi

echo -e "${BLUE}Starting Docker container...${NC}"
echo "Image: ${IMAGE_NAME}"
echo "Container: ${CONTAINER_NAME}"
echo "Ports: ${BACKEND_PORT}:3005 (Backend), ${FRONTEND_PORT}:5180 (Frontend)"
echo ""

# Run container
if docker run -d \
  -p "${BACKEND_PORT}:3005" \
  -p "${FRONTEND_PORT}:5180" \
  --name "$CONTAINER_NAME" \
  "$IMAGE_NAME"; then
  
  echo -e "${GREEN}✓ Container started successfully!${NC}"
  echo ""
  echo "Access the application:"
  echo "  Frontend: http://localhost:${FRONTEND_PORT}"
  echo "  Backend:  http://localhost:${BACKEND_PORT}"
  echo ""
  echo "Useful commands:"
  echo "  View logs:     docker logs -f ${CONTAINER_NAME}"
  echo "  Stop:          docker stop ${CONTAINER_NAME}"
  echo "  Start:         docker start ${CONTAINER_NAME}"
  echo "  Remove:        docker rm -f ${CONTAINER_NAME}"
  echo ""
  
  # Wait and show initial logs
  sleep 2
  echo -e "${BLUE}Initial logs:${NC}"
  docker logs "$CONTAINER_NAME" || true
else
  echo -e "${RED}✗ Failed to start container!${NC}"
  exit 1
fi
