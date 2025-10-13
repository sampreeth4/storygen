output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app_server.id
}

output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_eip.app_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name"
  value       = aws_instance.app_server.public_dns
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_eip.public_ip}"
}