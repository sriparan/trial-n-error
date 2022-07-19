#!/bin/bash -xe
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1


yum update -y
yum install -y git
git clone https://github.com/sriparan/trial-n-error /home/ec2-user/trial-n-error

cd trial-n-error/srctop/simple-webapp/echo-express/standalone

# echo "FROM node
# COPY . /usr/src/app
# WORKDIR /usr/src/app
# RUN npm install
# #RUN npm install typescript
# RUN npm install -D
# RUN npm run build
# cmd ["ls -la"]
# " >> ~/Dockerfile





#yum install docker -y
# usermod -a -G docker ec2-user
# service docker start

amazon-linux-extras install docker
usermod -a -G docker ec2-user
service docker start
systemctl enable docker
usermod -a -G docker ec2-user



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

minikube start




#lets get cloudwatch agent, no lets do this from the Cloudformation SSM configuration :)
# wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
# sudo yum install amazon-cloudwatch-agent
# Adding the configuration for the 
# sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:./trial-n-error/vpc-iac/infra_src_code/cw-config.json


export NVM_DIR="/home/ec2-user/.nvm"

wget  https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh -O /home/ec2-user/install.sh -o /home/ec2-user/install-output.sh
#bash ./install.sh
curl  -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
echo 'export NVM_DIR="/home/ec2-user/.nvm"' >> /home/ec2-usr/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ec2-user/.bashrc



# Dot source the files to ensure that variables are available within the current shell
echo ". /home/ec2-user/.nvm/nvm.sh"
source /home/ec2-user/.nvm/nvm.sh

echo ". /home/ec2-user/.bashrc"
source /home/ec2-user/.bashrc

echo "Completed souring the files install node lts"
nvm install --lts node
node -e "console.log('Running Node.js ' + process.version)"

cd trial-n-error/srctop/simple-webapp/echo-express/standalone/
npm install
nmp run build
npm run server
