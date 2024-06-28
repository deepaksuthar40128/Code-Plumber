FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
RUN apt-get install python3.10
RUN apt install -y openjdk-11-jdk 

WORKDIR /app

COPY . .  
RUN npm install

RUN npm install -g typescript

RUN tsc 

COPY wait-for-it.sh .

RUN chmod +x ./wait-for-it.sh

# Set the entry point
ENTRYPOINT [ "./wait-for-it.sh","-t","1200","api-service:4320","--"]

CMD [ "npm","start" ]