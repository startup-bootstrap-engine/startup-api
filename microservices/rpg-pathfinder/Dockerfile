# Start with a Go base image
FROM golang:1.20-alpine

# Install necessary tools
RUN apk add --no-cache git

# Set up working directory
WORKDIR /app

# Install Air for hot reloading
RUN go install github.com/cosmtrek/air@v1.29.0

# Copy the source code
COPY . .

# Run the application using Air
CMD ["air"]
