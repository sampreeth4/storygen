#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install basic tools
apt-get install -y curl wget git vim net-tools

# Install Python for Ansible
apt-get install -y python3 python3-pip

# Create app directory
mkdir -p /opt/story-generator
chown ubuntu:ubuntu /opt/story-generator

echo "Server initialized successfully!" > /tmp/userdata.log