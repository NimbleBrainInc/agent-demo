FROM node:20-alpine 

ARG API_URL
ARG AGENT_ID
ARG API_KEY

# Build args are set in fly.toml configs
ENV VITE_API_URL=${API_URL}
ENV VITE_AGENT_ID=${AGENT_ID}
ENV VITE_API_KEY=${API_KEY}

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "4000"]

# Expose the port.
EXPOSE 4000