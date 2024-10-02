 
FROM gcc:latest
 
RUN useradd -m sandboxuser
 
USER sandboxuser
 
WORKDIR /home/sandboxuser 
 
RUN chown -R sandboxuser:sandboxuser /home/sandboxuser
 
RUN mkdir -p /home/sandboxuser/runEnv && chown -R sandboxuser:sandboxuser /home/sandboxuser/runEnv
VOLUME ["/home/sandboxuser/runEnv"]

ENV HOME /home/sandboxuser

CMD ["tail", "-f", "/dev/null"]
