#!/bin/bash -xe
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

yum update -y
yum install docker -y
usermod -a -G docker ec2-user
service docker start


#kuce ctl install
export TEMP_DIR=/tmp
export TARGET_DIR=/usr/bin
curl -o ${TEMP_DIR}/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.22.6/2022-03-09/bin/linux/amd64/kubectl
chmod +x ${TEMP_DIR}/kubectl
cp ${TEMP_DIR}/kubectl ${TARGET_DIR}/kubectl 



#Lets install mini cube and start the times
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
install minikube-linux-amd64 /usr/local/bin/minikube
minikube config set driver docker
#apt install conntrack
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod +x get_helm.sh
./get_helm.sh
helm repo add bitnami https://charts.bitnami.com/bitnami

#minikube start

yum intall -y git
git clone https://github.com/sriparan/trial-n-error

#lets get cloudwatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo yum install amazon-cloudwatch-agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:./trial-n-error/vpc-iac/infra_src_code/cw-config.json
