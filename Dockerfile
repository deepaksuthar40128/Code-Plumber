FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
RUN apt-get install python3.10
RUN apt install -y openjdk-11-jdk

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./ 

RUN npm install
RUN npm install -g typescript

COPY . .

EXPOSE 400

CMD ["npm", "run", "dev"]