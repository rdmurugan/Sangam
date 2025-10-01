FROM coturn/coturn:latest

# Copy configuration
COPY turnserver.conf /etc/coturn/turnserver.conf

# Expose ports
# 3478 for TURN/STUN
EXPOSE 3478/tcp
EXPOSE 3478/udp

# Port range for media relay
EXPOSE 49152-65535/udp

CMD ["turnserver", "-c", "/etc/coturn/turnserver.conf"]
