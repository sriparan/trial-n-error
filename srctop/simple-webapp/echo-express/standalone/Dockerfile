FROM node
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install
#RUN npm install typescript
RUN npm install -D
RUN npm run build
RUN chmod 755 ./startup.sh
EXPOSE 80
EXPOSE 443
CMD ["/bin/bash","./startup.sh"]


# sudo rm -rf trial-n-error
# git clone https://github.com/sriparan/trial-n-error /home/ec2-user/trial-n-error
# cd trial-n-error/srctop/simple-webapp/echo-express/standalone/
# docker container prune
# docker image rm mynode
# docker build -t mynode .
# docker run -p8080:8080 -p 443:443 -p 4430:4430  --rm -it mynode /bin/bash


#git clone https://github.com/sriparan/trial-n-error /home/ec2-user/trial-n-error
#cd trial-n-error/srctop/simple-webapp/echo-express/standalone/
#openssl rsa -in private_key.txt -out decrypted_private_key.txt
#docker build -t mynode .
# echo "#NO VULUMES docker run -p8080:8080 -p 443:443 -p 4430:4430  --rm -it mynode /bin/bash" >> /home/ec2-usr/.bashrc
# echo "#WITH VOLUME docker run --rm -it -v ${PWD}:/usr/src/app -w /usr/src/app mynode /bin/bash" >> /home/ec2-usr/.bashrc
# echo "expose port with -p" >> /home/ec2-user/.bashrc
#aws apigateway get-integration -—rest-api-id sbb3pkhp7j -—resource-id y28cl1 -—http-method GET -—region us-west-2