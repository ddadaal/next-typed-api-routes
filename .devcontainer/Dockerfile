FROM mcr.microsoft.com/devcontainers/typescript-node:20

RUN corepack enable

# Install browsers
RUN pnpm dlx playwright install && sudo pnpm dlx playwright install-deps
