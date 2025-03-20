#!/bin/bash

# Gabrious Setup Script
# This script sets up the Gabrious application with all required dependencies

set -e  # Exit on error

echo "=== Gabrious Setup Script ==="
echo "This script will install all necessary dependencies and set up the environment."

# Update system
echo "\n[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
echo "\n[2/8] Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
  sudo apt install -y postgresql postgresql-contrib
  
  # Start and enable PostgreSQL service
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  
  # Create database and user
  sudo -u postgres psql -c "CREATE DATABASE gabrious_production;"
  sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
  
  # Configure PostgreSQL to allow connections from Docker containers
  sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf
  
  # Add entry to pg_hba.conf to allow connections from Docker
  echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
  
  # Restart PostgreSQL to apply changes
  sudo systemctl restart postgresql
  
  echo "PostgreSQL installed and configured."
else
  echo "PostgreSQL is already installed."
fi

# Install Docker and Docker Compose
echo "\n[3/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh
  
  # Add current user to docker group to avoid permission issues
  sudo usermod -aG docker $USER
  echo "Added user to docker group. You may need to log out and back in for this to take effect."
else
  echo "Docker is already installed."
fi

# Install Docker Compose
echo "\n[4/8] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
else
  echo "Docker Compose is already installed."
fi

# Install Caddy for HTTPS
echo "\n[5/8] Installing Caddy for HTTPS..."
if ! command -v caddy &> /dev/null; then
  sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt update
  sudo apt install -y caddy
else
  echo "Caddy is already installed."
fi

# Install Node.js and Yarn
echo "\n[6/8] Installing Node.js and Yarn..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js is already installed."
fi

if ! command -v yarn &> /dev/null; then
  sudo npm install -g yarn
else
  echo "Yarn is already installed."
fi

# Check if we're in the project directory
echo "\n[7/8] Checking project directory..."
if [ ! -d "./client" ] || [ ! -d "./server" ] || [ ! -f "./docker-compose.yml" ]; then
  echo "It seems you're not in the project directory or the project is not cloned yet."
  read -p "Do you want to clone the repository? (y/n): " clone_repo
  
  if [[ "$clone_repo" == "y" ]]; then
    read -p "Enter the repository URL: " repo_url
    git clone "$repo_url" .
  else
    echo "Please navigate to the project directory and run this script again."
    exit 1
  fi
fi

# Set up environment variables
echo "\n[8/8] Setting up environment variables..."

# Root environment setup
if [ ! -f "./.env" ]; then
  echo "Creating root .env file..."
  
  # Check if .env.example exists
  if [ -f "./.env.example" ]; then
    # Copy the example file
    cp ./.env.example ./.env
    
    # Generate a secure random key for SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    
    # Update the SECRET_KEY
    sed -i "s/SECRET_KEY=your_secret_key_here/SECRET_KEY=${SECRET_KEY}/g" ./.env
    
    echo "Root .env file created from example template. Please update with your actual API keys and credentials."
  else
    echo "Warning: .env.example not found at root level."
  fi
else
  echo "Root .env file already exists. Skipping creation."
fi

# Server environment setup
if [ ! -f "./server/.env" ]; then
  echo "Creating server .env file..."
  
  # Check if .env.example exists
  if [ -f "./server/.env.example" ]; then
    # Copy the example file
    cp ./server/.env.example ./server/.env
    
    # Generate a secure random key for SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    
    # Update the SECRET_KEY and set environment to production
    sed -i "s/SECRET_KEY=your_secret_key_here/SECRET_KEY=${SECRET_KEY}/g" ./server/.env
    sed -i "s/ENVIRONMENT=development/ENVIRONMENT=production/g" ./server/.env
    sed -i "s|DATABASE_URL=postgres://username:password@localhost/gabrious_development|DATABASE_URL=postgres://postgres:postgres@localhost/gabrious_production|g" ./server/.env
    sed -i "s|REDIS_URL=redis://localhost:6379/0|REDIS_URL=redis://redis:6379/0|g" ./server/.env
    sed -i "s/DEBUG=True/DEBUG=False/g" ./server/.env
    
    echo "Server .env file created from example template. Please update with your actual API keys and credentials."
  else
    echo "Warning: server/.env.example not found. Creating a basic .env file..."
    
    # Generate a secure random key for SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    
    cat << EOF > ./server/.env
# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost/gabrious_production

# Redis Configuration (for Celery)
REDIS_URL=redis://redis:6379/0

# Azure Speech Service Configuration
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT_ID=your_deployment_id
OPENAI_API_VERSION=2024-02-01

AZURE_DEPLOYMENT_NAME=your_deployment_name

# Server Configuration
DEBUG=False
SECRET_KEY=${SECRET_KEY}

# Environment
ENVIRONMENT=production

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=your_pro_monthly_price_id
STRIPE_PRICE_PRO_YEARLY=your_pro_yearly_price_id
STRIPE_PRICE_CHURCH_MONTHLY=your_church_monthly_price_id
STRIPE_PRICE_CHURCH_YEARLY=your_church_yearly_price_id
EOF
  fi

  echo "Server .env file created. Please update with your actual API keys and credentials."
else
  echo "Server .env file already exists. Skipping creation."
fi

# Client environment setup
if [ ! -f "./client/.env" ]; then
  echo "Creating client .env file..."
  
  # Check if .env.example exists
  if [ -f "./client/.env.example" ]; then
    # Copy the example file
    cp ./client/.env.example ./client/.env
    echo "Client .env file created from example template. Please update with your actual API keys and credentials."
  else
    echo "Warning: client/.env.example not found. Creating a basic .env file..."
    
    cat << EOF > ./client/.env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Configuration
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
EOF
  fi

  echo "Client .env file created. Please update with your actual API keys and credentials."
else
  echo "Client .env file already exists. Skipping creation."
fi

# Prompt for domain name (optional for production setup)
read -p "Do you want to set up a domain for production? (y/n): " setup_domain

if [[ "$setup_domain" == "y" ]]; then
  read -p "Enter your domain name: " domain_name
  
  # Create Caddyfile with user's domain
  cat << EOF | sudo tee /etc/caddy/Caddyfile
${domain_name} {
    # Add security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        # Disable FLoC tracking
        Permissions-Policy "interest-cohort=()"
        # XSS protection
        X-XSS-Protection "1; mode=block"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Disable MIME type sniffing
        X-Content-Type-Options "nosniff"
    }

    # Proxy to the Next.js frontend
    reverse_proxy localhost:3000 {
        header_up X-Forwarded-Proto "https"
        header_up X-Forwarded-For {remote_host}
        header_up Host {host}
    }
    
    # Proxy API requests to the backend
    handle /api/* {
        reverse_proxy localhost:8000 {
            header_up X-Forwarded-Proto "https"
            header_up X-Forwarded-For {remote_host}
            header_up Host {host}
        }
    }
}
EOF

  # Restart Caddy and check its status
  sudo systemctl restart caddy
  sudo systemctl status caddy
  
  echo "Domain configured: ${domain_name}"
  
  # Update client .env to use the domain for API URL
  sed -i "s|NEXT_PUBLIC_API_URL=http://localhost:8000|NEXT_PUBLIC_API_URL=https://${domain_name}/api|g" ./client/.env
else
  echo "Skipping domain configuration. Using local setup."
fi

# Ask if user wants to build and start the application
echo "\nDo you want to build and start the application now?"
read -p "(y/n): " start_app

if [[ "$start_app" == "y" ]]; then
  # Build and start all services
  docker-compose up -d
  
  echo "\nApplication is starting. You can access it at:"
  if [[ "$setup_domain" == "y" ]]; then
    echo "- Frontend and API: https://${domain_name}"
  else
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:8000"
  fi
  echo "- Flower dashboard: http://localhost:5555"
  echo "- PostgreSQL: running on host machine (localhost:5432)"
  echo "- Redis: localhost:6379"
  
  echo "\nTo view logs, run: docker-compose logs -f"
else
  echo "\nYou can start the application later by running: docker-compose up -d"
fi

# Make the script executable
chmod +x setup.sh

echo "\nSetup complete! If you added yourself to the docker group, please log out and log back in for the changes to take effect."
echo "IMPORTANT: Remember to update the .env files with your actual API keys and credentials before running the application."