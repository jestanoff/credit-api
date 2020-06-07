# using 10-slim from now, would be good if we find the best base image to load from
# Dockerfile should always start with FROM instruction, that specifies the partent image
FROM arm32v7/node:lts

WORKDIR /usr/src/app

# Use --no-cache and rm ... cache to keep the container slimmer
# Use tini to make sure no zombie processes are left
# Add the necessary build and runtime dependencies
RUN apt-get update && \
    apt-get install -y make gcc g++ python udev

 #ENTRYPOINT ["/sbin/tini", "--"]

COPY package.json yarn.lock /usr/src/app/

# Install dependencies
RUN ["yarn", "--production"]

# Install serialport, forcing it to compile
RUN yarn add serialport --build-from-source

COPY ./src /usr/src/app/src

RUN ["yarn", "start"]
