FROM node
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
#RUN npm install typescript
RUN npm install -D
RUN npm run build
cmd ["ls -la"]