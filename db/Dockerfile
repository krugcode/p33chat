FROM alpine:latest

RUN apk add --no-cache ca-certificates wget unzip && \
    wget https://github.com/pocketbase/pocketbase/releases/download/v0.28.3/pocketbase_0.28.3_linux_amd64.zip -O pb.zip && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase && \
    mv pocketbase /usr/local/bin/

# Create a non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -s /bin/sh -u 1000 -G appuser appuser

WORKDIR /app
RUN chown appuser:appuser /app

USER appuser
EXPOSE 8090

RUN mkdir -p /app/pb_data
COPY --chown=appuser:appuser schema.json /app/
COPY --chown=appuser:appuser start.sh /app/
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
