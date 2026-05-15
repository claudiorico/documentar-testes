FROM alpine:latest

RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.23/main" > /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.23/community" >> /etc/apk/repositories && \
    apk add --no-cache unzip

COPY pocketbase_0.28.2_linux_amd64.zip /tmp/pb.zip

RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8091

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8091", "--dir=/pb_data"]
