# -----Base-----
FROM node:14 AS base

RUN apt update

RUN apt install -yyq ca-certificates

RUN apt install -yyq libappindicator1 libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6

RUN apt install -yyq gconf-service lsb-release wget xdg-utils

RUN apt install -yyq fonts-liberation

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder

COPY package*.json  ./

USER node

# Install all dependencies, both production and development
RUN npm install

# Copy the source files
COPY --chown=node:node ./src ./src

# Copy the scripts
COPY --chown=node:node ./scripts ./scripts

# Copy the database
COPY --chown=node:node ./imagegram.db ./imagegram.db

# Build the app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ---------- Release ----------
FROM base AS release

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled app
COPY --from=builder /app/dist ./dist

# Copy package.json for config usages
COPY --from=builder /app/package.json ./

# Copy shell script to root
COPY --from=builder /app/scripts/init_db.sh ./

EXPOSE 3000

CMD ["node", "./dist/index.js"]
