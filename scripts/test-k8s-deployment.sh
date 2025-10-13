#!/bin/bash

INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip 2>/dev/null)

echo "Testing Kubernetes Deployment..."
echo "================================="
echo ""

ssh -i ~/.ssh/story-generator-key ubuntu@$INSTANCE_IP << 'ENDSSH'

echo "1. Checking if all pods are running..."
kubectl get pods -n story-generator

echo ""
echo "2. Checking pod logs (frontend)..."
kubectl logs -n story-generator -l app=frontend --tail=20

echo ""
echo "3. Checking pod logs (backend)..."
kubectl logs -n story-generator -l app=backend --tail=20

echo ""
echo "4. Checking services..."
kubectl get svc -n story-generator

echo ""
echo "5. Checking endpoints..."
kubectl get endpoints -n story-generator

echo ""
echo "6. Describing pods (if any issues)..."
kubectl describe pods -n story-generator | grep -A 5 "Events:"

ENDSSH

echo ""
echo "Testing application endpoints..."
echo "================================="

echo "Frontend (should show HTML):"
curl -s "http://$INSTANCE_IP:30080" | head -5

echo ""
echo "Backend health:"
curl -s "http://$INSTANCE_IP:5000/health"

echo ""