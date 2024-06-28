FROM ubuntu:latest

# Install dependencies
RUN apt-get update && apt-get install -y wget build-essential python3.10 openjdk-11-jdk

# Install Go
RUN wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz \
    && rm -rf /usr/local/go && tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
 
ENV PATH="/usr/local/go/bin:${PATH}"
 
WORKDIR /app
 
COPY go.mod ./
 
RUN go mod download
 
COPY . .

COPY wait-for-it.sh .

RUN chmod +x ./wait-for-it.sh

RUN go build -o main .

# Set the entry point
ENTRYPOINT [ "./wait-for-it.sh","-t","1200","api-service:4320","--"]
CMD ["./main"]
