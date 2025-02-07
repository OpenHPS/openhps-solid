FROM solidproject/community-server

# Installing mashlib UI
RUN npm install mashlib

WORKDIR /community-server

# Copy configuration
COPY ./config/config.json /config/config.json
# Copy entrypoint
COPY ./entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

ENTRYPOINT ["sh", "./entrypoint.sh"]
