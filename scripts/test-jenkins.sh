#!/bin/bash

INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip 2>/dev/null)

echo "Testing Jenkins..."
echo "=================="
echo ""

ssh -i ~/.ssh/story-generator-key ubuntu@$INSTANCE_IP << 'ENDSSH'

echo "1. Jenkins service status:"
systemctl status jenkins --no-pager

echo ""
echo "2. Jenkins is listening on port 8080:"
netstat -tuln | grep 8080 || ss -tuln | grep 8080

echo ""
echo "3. Jenkins initial password:"
if [ -f /home/ubuntu/jenkins-initial-password.txt ]; then
    cat /home/ubuntu/jenkins-initial-password.txt
else
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
fi

echo ""
echo "4. Jenkins log (last 20 lines):"
sudo journalctl -u jenkins -n 20 --no-pager

ENDSSH

echo ""
echo "5. Testing Jenkins web interface:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$INSTANCE_IP:8080")
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "403" ]; then
    echo "✓ Jenkins is accessible at http://$INSTANCE_IP:8080"
else
    echo "✗ Jenkins web interface returned HTTP $HTTP_CODE"
fi

echo ""