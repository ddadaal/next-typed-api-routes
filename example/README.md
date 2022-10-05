# next-typed-api-routes project example

Run the commands in the root of the project, not `example` folder.

```bash
# Install dependencies
pnpm i

# Build the libraries
pnpm build

# Enter example project
cd example

# Reinstall to generate library binaries after the build is complete
pnpm i

# Generate schema files
npx ntar schema

# Generate api client
npx ntar client

# Start next dev server
pnpm dev

# Build next project
pnpm build
```