#!/bin/bash
# Build script for StoryGenApp Docker image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="storygen-app"
IMAGE_TAG="latest"
REGISTRY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--name)
      IMAGE_NAME="$2"
      shift 2
      ;;
    -t|--tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    -r|--registry)
      REGISTRY="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -n, --name      Image name (default: storygen-app)"
      echo "  -t, --tag       Image tag (default: latest)"
      echo "  -r, --registry  Registry URL (optional, e.g., ghcr.io/username)"
      echo "  -h, --help      Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build full image name
if [ -z "$REGISTRY" ]; then
  FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
else
  FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
fi

echo -e "${BLUE}Building Docker image: ${FULL_IMAGE_NAME}${NC}"

# Run docker build
if docker build -t "$FULL_IMAGE_NAME" .; then
  echo -e "${GREEN}✓ Docker image built successfully!${NC}"
  echo ""
  echo "To run the image:"
  echo "  docker run -d -p 3005:3005 -p 5180:5180 ${FULL_IMAGE_NAME}"
  echo ""
  echo "To push the image to registry:"
  echo "  docker push ${FULL_IMAGE_NAME}"
else
  echo -e "${RED}✗ Docker build failed!${NC}"
  exit 1
fi
