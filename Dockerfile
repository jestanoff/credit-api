# using 10-slim from now, would be good if we find the best base image to load from
# Dockerfile should always start with FROM instruction, that specifies the partent image
FROM mhart/alpine-node:12.18.0

WORKDIR /usr/src/app

# Use --no-cache and rm ... cache to keep the container slimmer
# Use tini to make sure no zombie processes are left
# Add the necessary build and runtime dependencies
RUN apk --no-cache update && \
    apk add --no-cache tini && \
    rm -rf /var/cache/apk && \
    apk add --no-cache make gcc g++ python linux-headers udev && \
    python --version && node --version

ENTRYPOINT ["/sbin/tini", "--"]

COPY package.json yarn.lock /usr/src/app/

# Install dependencies
RUN ["yarn", "--production"]

# Install serialport, forcing it to compile
RUN yarn add serialport --build-from-source

COPY ./src /usr/src/app/src

RUN ["yarn", "client"]