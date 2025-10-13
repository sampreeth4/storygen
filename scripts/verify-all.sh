#!/bin/bash

INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip 2>/dev/null)

if [ -z "$INSTANCE_IP" ]; then
    echo "Error: No instance found. Run deploy.sh first."
    exit 1
fi

echo "Connecting to $INSTANCE_IP..."
echo "======================================"
echo ""

ssh -i ~/.ssh/story-generator-key ubuntu@$INSTANCE_IP << 'ENDSSH'

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== DOCKER VERIFICATION ===${NC}"
docker --version
echo ""
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
echo ""

echo -e "${BLUE}=== KUBERNETES VERIFICATION ===${NC}"
kubectl version --short 2>/dev/null
echo ""
echo "Cluster info:"
kubectl cluster-info
echo ""
echo "Nodes:"
kubectl get nodes -o wide
echo ""
echo "Namespaces:"
kubectl get namespaces
echo ""
echo "Pods in story-generator namespace:"
kubectl get pods -n story-generator -o wide
echo ""
echo "Services in story-generator namespace:"
kubectl get svc -n story-generator
echo ""

echo -e "${BLUE}=== JENKINS VERIFICATION ===${NC}"
systemctl status jenkins --no-pager | grep -E "(Active|Main PID)"
echo ""
if [ -f ~/jenkins-initial-password.txt ]; then
    echo "Jenkins Initial Password:"
    cat ~/jenkins-initial-password.txt
fi
echo ""

echo -e "${BLUE}=== APPLICATION HEALTH ===${NC}"
echo "Checking backend health endpoint..."
curl -s http://localhost:5000/health || echo "Backend not responding on port 5000"
echo ""

echo -e "${BLUE}=== SYSTEM RESOURCES ===${NC}"
echo "Memory:"
free -h | grep -E "(Mem|Swap)"
echo ""
echo "Disk:"
df -h / | tail -1
echo ""
echo "CPU Load:"
uptime
echo ""

ENDSSH