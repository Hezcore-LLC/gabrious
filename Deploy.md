# Gabrious Deployment Guide

This document provides instructions for deploying the Gabrious application using Docker and Docker Compose in both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- Git repository cloned to your local machine

## VM Setup (For Fresh Ubuntu/Debian Servers)

If you're setting up on a fresh VM, you can use our setup script to install all dependencies:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script will:

1. Update system packages
2. Install and configure PostgreSQL
3. Install Docker and Docker Compose
4. Install Caddy for HTTPS
5. Install Node.js and Yarn
6. Set up environment variables
7. Configure domain (optional)
8. Start the application (optional)

Alternatively, you can perform these steps manually as described below:

## Environment Variables

Before deploying, you need to set up environment variables. Create a `.env` file in the root directory of the project with the following variables:

### Required Environment Variables

```
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT_ID=your_deployment_id
OPENAI_API_VERSION=2024-02-01
AZURE_DEPLOYMENT_NAME=your_deployment_name

# Server Configuration
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development  # or production

# Stripe Configuration (for payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_PRO_MONTHLY=your_pro_monthly_price_id
STRIPE_PRICE_PRO_YEARLY=your_pro_yearly_price_id
STRIPE_PRICE_CHURCH_MONTHLY=your_church_monthly_price_id
STRIPE_PRICE_CHURCH_YEARLY=your_church_yearly_price_id
```

You can find an example in the `server/.env.example` file.

## Development Deployment

For development, you can run the application with hot-reloading enabled for both the frontend and backend.

### Starting the Development Environment

1. Make sure your `.env` file is set up with the required variables
2. Run the following command from the project root:

```bash
docker-compose up
```

This will start all services defined in the `docker-compose.yml` file:
- PostgreSQL database on port 5432
- Redis on port 6379
- Backend API server on port 8000
- Celery worker for background tasks
- Flower monitoring dashboard on port 5555
- Frontend client on port 3000

### Accessing Development Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Flower Dashboard**: http://localhost:5555

### Stopping the Development Environment

To stop all services, press `Ctrl+C` in the terminal where docker-compose is running, or run:

```bash
docker-compose down
```

To remove volumes (database data, etc.) when stopping:

```bash
docker-compose down -v
```

## Production Deployment

For production deployment, additional configuration is recommended for security and performance.

### Production Environment Variables

Update your `.env` file with production values:

```
ENVIRONMENT=production
```

Consider using a proper secrets management solution for production rather than a `.env` file.

### Starting Production Environment

1. Build and start the containers in detached mode:

```bash
docker-compose up -d --build
```

2. Verify all services are running:

```bash
docker-compose ps
```

### Production Security Considerations

1. **Reverse Proxy**: In production, you should use a reverse proxy like Nginx or Traefik in front of your services with proper SSL/TLS configuration.

2. **CORS Configuration**: Update the CORS settings in `server/main.py` to only allow requests from your production domain:

```python
allow_origins=["https://your-production-domain.com"]
```

3. **Database Security**: Consider using a managed database service instead of the containerized PostgreSQL for production workloads.

4. **Environment Variables**: Never commit sensitive environment variables to your repository. Use a secure method to manage secrets in production.

## Scaling and Monitoring

### Scaling Services

To scale specific services (e.g., celery workers):

```bash
docker-compose up -d --scale celery_worker=3
```

### Monitoring

- **Logs**: View logs for a specific service:

```bash
docker-compose logs -f server
```

- **Celery Tasks**: Monitor Celery tasks using the Flower dashboard at http://localhost:5555

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Ensure PostgreSQL is running: `docker-compose ps postgres`
   - Check database logs: `docker-compose logs postgres`
   - Verify DATABASE_URL environment variable is correct

2. **Redis Connection Issues**:
   - Ensure Redis is running: `docker-compose ps redis`
   - Check Redis logs: `docker-compose logs redis`
   - Verify REDIS_URL environment variable is correct

3. **Celery Worker Issues**:
   - Check Celery logs: `docker-compose logs celery_worker`
   - Ensure Redis is running properly
   - Verify task registration in `celery_app.py`

4. **Container Build Failures**:
   - Rebuild a specific service: `docker-compose build server`
   - Check for errors in Dockerfile or requirements

### Restarting Services

To restart a specific service:

```bash
docker-compose restart server
```

## Backup and Restore

### Database Backup

```bash
docker-compose exec postgres pg_dump -U postgres gabrious_production > backup.sql
```

### Database Restore

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres gabrious_production
```

## Updating the Application

1. Pull the latest code changes
2. Rebuild and restart the containers:

```bash
docker-compose down
docker-compose up -d --build
```

## Container Architecture

The Gabrious application consists of the following containers:

- **postgres**: PostgreSQL database for storing application data
- **redis**: Redis for Celery task queue and caching
- **server**: FastAPI backend server
- **celery_worker**: Celery worker for processing background tasks
- **flower**: Monitoring dashboard for Celery tasks
- **client**: Next.js frontend client

Each container is configured in the `docker-compose.yml` file with appropriate dependencies, volumes, and environment variables.

## Git Repository Setup

The Gabrious application code is hosted in a private Git repository. Follow these instructions to access and work with the repository.

### Obtaining Access Credentials

1. **Request Repository Access**: Contact your team lead or system administrator to request access to the private repository.

2. **Receive Credentials**: You will be provided with either:
   - Username and password/personal access token for HTTPS access
   - SSH key setup instructions for SSH access

### Cloning the Repository

#### Using HTTPS (with username and password/token)

```bash
# Replace with the actual repository URL provided by your team
git clone https://[GIT_HOSTING_SERVICE]/[ORGANIZATION]/gabrious.git

# You will be prompted for your username and password/token
```

#### Using SSH (recommended for developers)

1. If you haven't set up SSH keys yet:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start the SSH agent
eval "$(ssh-agent -s)"

# Add your SSH key to the agent
ssh-add ~/.ssh/id_ed25519

# Copy your public key to clipboard (Mac)
pbcopy < ~/.ssh/id_ed25519.pub
# For Linux: cat ~/.ssh/id_ed25519.pub
# For Windows: clip < ~/.ssh/id_ed25519.pub
```

2. Add the copied public key to your Git hosting service (GitHub, GitLab, Bitbucket, etc.)

3. Clone the repository using SSH:

```bash
# Replace with the actual SSH repository URL provided by your team
git clone git@[GIT_HOSTING_SERVICE]:[ORGANIZATION]/gabrious.git
```

### Basic Git Operations

#### Pulling Latest Changes

```bash
# Navigate to the project directory
cd gabrious

# Fetch and merge changes from the remote repository
git pull
```

#### Creating a Branch for Your Changes

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

#### Committing and Pushing Changes

```bash
# Add your changes to staging
git add .

# Commit your changes with a descriptive message
git commit -m "Add feature: description of your changes"

# Push your branch to the remote repository
git push origin feature/your-feature-name
```

#### Creating a Pull/Merge Request

After pushing your changes, go to the Git hosting service's web interface to create a pull request (GitHub) or merge request (GitLab) to have your changes reviewed and merged into the main branch.

### Git Configuration for the Project

It's recommended to configure your Git identity for this project:

```bash
# Set your name and email for this repository
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Git Documentation](https://git-scm.com/doc)