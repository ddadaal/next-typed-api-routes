FROM mcr.microsoft.com/devcontainers/typescript-node:18

RUN corepack enable

# Install browsers
RUN pnpm dlx playwright install && sudo pnpm dlx playwright install-deps
