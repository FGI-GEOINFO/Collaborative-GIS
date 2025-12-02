# Official node image
FROM node:18.19.0

# Working directory for hslayers-server
RUN mkdir /hslayers_server
WORKDIR /hslayers_server

# Clone Hslayers-Server 2.0.0 from NPM repository
RUN npm i hslayers-server@2.0.0

# Run the app
CMD ["npx", "hslayers-server", "-p", "-s", "-l"]
