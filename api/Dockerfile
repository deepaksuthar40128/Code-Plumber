FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs


WORKDIR /app

COPY . . 

RUN tr -d '\r' < build.sh > build_unix.sh
RUN mv build_unix.sh build.sh
RUN chmod 777 build.sh
CMD ["./build.sh"]