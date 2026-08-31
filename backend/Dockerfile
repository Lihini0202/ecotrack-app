# node:20-slim: an active LTS line still receiving security patches, on a
# smaller base than the full node image.
FROM node:20-slim

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

# The build context is ./backend (see docker-compose.yml and the flyctl
# invocations in .github/workflows), so every path here is relative to the
# backend directory. Manifests are copied first so the dependency layer is
# reused whenever only application code changes.
COPY package.json package-lock.json ./

# npm ci installs exactly what package-lock.json pins and fails if the two
# files disagree; npm install would silently resolve newer versions.
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# node:20-slim ships an unprivileged `node` user (uid 1000). Give it ownership
# of the app directory so nothing in the running container needs root.
RUN chown -R node:node /app
USER node

EXPOSE 8080

# /health returns 503 while mongoose is disconnected, so an instance that
# cannot reach Atlas is reported unhealthy instead of merely "up". node is
# already in the image, which avoids installing curl just to probe a port.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||8080,path:'/health'},r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["npm", "start"]
