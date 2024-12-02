FROM solidproject/community-server
RUN npm install mashlib

WORKDIR /community-server

# Copy configuration
COPY ./config/config.json /config/config.json

# Copy entrypoint
COPY ./entrypoint.sh /community-server/entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["sh", "./entrypoint.sh"]
