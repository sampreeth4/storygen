#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Deployment method: docker-compose or kubernetes
DEPLOY_METHOD="${1:-kubernetes}"  # Default to kubernetes

print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Story Generator - DevOps Deployment                ║
║                                                           ║
║  Terraform | Ansible | Docker | Kubernetes | Jenkins     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if API keys are set
check_api_keys() {
    print_section "Checking Environment Variables"
    
    if [ -z "$NEBIUS_API_KEY" ]; then
        print_error "NEBIUS_API_KEY is not set"
        read -sp "Enter your Nebius API Key: " NEBIUS_API_KEY
        export NEBIUS_API_KEY
        echo
    else
        print_success "NEBIUS_API_KEY is set"
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_info "OPENAI_API_KEY not set (optional)"
        read -sp "Enter your OpenAI API Key: " OPENAI_API_KEY
        export OPENAI_API_KEY
        echo
    else
        print_success "OPENAI_API_KEY is set"
    fi
}

# Deploy infrastructure
deploy_infrastructure() {
    print_section "Deploying Infrastructure with Terraform"
    
    cd terraform
    
    terraform init
    terraform plan -out=tfplan
    terraform apply tfplan
    
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    print_success "Infrastructure deployed"
    print_info "Instance IP: $INSTANCE_IP"
    
    # Update Ansible inventory
    cat > ../ansible/hosts << EOF
[app_servers]
app_server ansible_host=${INSTANCE_IP} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3

[app_servers:vars]
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF
    
    print_success "Ansible inventory updated"
    cd ..
}

# Wait for instance
wait_for_instance() {
    print_section "Waiting for Instance to be Ready"
    
    INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip)
    
    for i in {1..60}; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@${INSTANCE_IP} "echo 'ready'" &> /dev/null; then
            print_success "Instance is ready"
            return 0
        fi
        echo -ne "\r${YELLOW}Attempt $i/60: Waiting for SSH...${NC}"
        sleep 5
    done
    
    echo ""
    print_error "Failed to connect to instance"
    exit 1
}

# Setup server
# setup_server() {
#     print_section "Setting up Server (Docker + K8s + Jenkins)"
    
#     cd ansible
#     print_info "This will take 5-10 minutes..."
    
#     if ansible-playbook -i hosts playbooks/setup-server.yml; then
#         print_success "Server setup completed"
#     else
#         print_error "Server setup failed"
#         exit 1
#     fi
    
#     cd ..
# }
setup_server() {
    cd ansible
    
    # Automatically choose setup based on deployment method
    if [ "$DEPLOY_METHOD" == "kubernetes" ]; then
        print_section "Setting up Server (Docker + K8s + Jenkins)"
        print_warning "Full setup requires at least t3.medium (4GB RAM)"
        print_info "This will take 5-10 minutes..."
        
        if ansible-playbook -i hosts playbooks/setup-server.yml; then
            print_success "Full server setup completed"
        else
            print_error "Server setup failed"
            exit 1
        fi
    else
        print_section "Setting up Server (Docker Only - Optimized for t3.small)"
        print_info "Lightweight setup for Docker Compose deployment"
        print_info "This will take 3-5 minutes..."
        
        if ansible-playbook -i hosts playbooks/setup-docker-only.yml; then
            print_success "Docker-only setup completed"
        else
            print_error "Server setup failed"
            exit 1
        fi
    fi
    
    cd ..
}
# Deploy application
deploy_application() {
    cd ansible
    
    if [ "$DEPLOY_METHOD" == "kubernetes" ]; then
        print_section "Deploying to Kubernetes"
        
        if ansible-playbook -i hosts playbooks/deploy-to-k8s.yml; then
            print_success "Deployed to Kubernetes"
        else
            print_error "Kubernetes deployment failed"
            exit 1
        fi
    else
        print_section "Deploying with Docker Compose"
        
        if ansible-playbook -i hosts playbooks/deploy-app.yml; then
            print_success "Deployed with Docker Compose"
        else
            print_error "Docker Compose deployment failed"
            exit 1
        fi
    fi
    
    cd ..
}

# Verify deployment
verify_deployment() {
    print_section "Verifying Deployment"
    
    INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip)
    
    ssh ubuntu@${INSTANCE_IP} << 'ENDSSH'
echo "=== Docker Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

if command -v kubectl &> /dev/null; then
    echo "=== Kubernetes Status ==="
    kubectl get nodes 2>/dev/null || echo "K8s not available"
    kubectl get pods -n story-generator 2>/dev/null || echo "K8s pods not deployed"
    echo ""
fi

if systemctl list-units --type=service | grep -q jenkins; then
    echo "=== Jenkins Status ==="
    systemctl is-active jenkins && echo "✓ Jenkins is running" || echo "✗ Jenkins not running"
    echo ""
fi

echo "=== Container Health ==="
for container in $(docker ps -q); do
  name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
  health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no healthcheck")
  echo "$name: $health"
done
echo ""
ENDSSH
}

# Display results
display_results() {
    INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip)
    
    print_section "🎉 Deployment Completed!"
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}     Access Your Services${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    
    if [ "$DEPLOY_METHOD" == "kubernetes" ]; then
        echo -e "${CYAN}☸️  Kubernetes Deployment:${NC}"
        echo -e "   Frontend: ${YELLOW}http://${INSTANCE_IP}:30080${NC}"
        echo -e "   Backend:  ${YELLOW}http://${INSTANCE_IP}:5000${NC}"
        echo ""
        echo -e "${CYAN}   Check pods:${NC}"
        echo -e "   ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'kubectl get pods -n story-generator'${NC}"
        echo ""
        echo -e "${CYAN}🔧 Jenkins:${NC}"
        echo -e "   URL: ${YELLOW}http://${INSTANCE_IP}:8080${NC}"
        echo -e "   Get password: ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'cat ~/jenkins-password.txt'${NC}"
        echo ""
    else
        echo -e "${CYAN}🐳 Docker Compose Deployment:${NC}"
        echo -e "   Frontend: ${YELLOW}http://${INSTANCE_IP}${NC}"
        echo -e "   Backend:  ${YELLOW}http://${INSTANCE_IP}:5000${NC}"
        echo -e "${CYAN}📊 Useful Commands:${NC}"
        echo -e "   View logs:      ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'cd /opt/story-generator && docker-compose logs -f'${NC}"
        echo -e "   Check status:   ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'docker ps'${NC}"
        echo -e "   Monitor memory: ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'free -h && docker stats --no-stream'${NC}"
        echo -e "   Restart app:    ${YELLOW}ssh ubuntu@${INSTANCE_IP} 'cd /opt/story-generator && docker-compose restart'${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Running on t3.small (2GB RAM + 2GB swap)${NC}"
        echo -e "${YELLOW}   Monitor resources regularly to avoid OOM issues${NC}"
        
    fi
    echo ""
    echo -e "${CYAN}🔗 SSH Access:${NC}"
    echo -e "   ${YELLOW}ssh ubuntu@${INSTANCE_IP}${NC}"
    echo ""


}

# Main execution
main() {
    clear
    print_banner
    
    if [ "$1" == "kubernetes" ]; then
        DEPLOY_METHOD="kubernetes"
        print_info "Deployment method: Kubernetes"
        print_info "Setup: Full (Docker + K8s + Jenkins)"
    else
        DEPLOY_METHOD="docker-compose"
        print_info "Deployment method: Docker Compose (default)"
        print_info "Setup: Lightweight (Docker only - optimized for t3.small)"
    fi
    
    check_api_keys
    deploy_infrastructure
    wait_for_instance
    setup_server
    deploy_application
    verify_deployment
    display_results
    
    print_success "Done! 🚀"
}

main "$@"