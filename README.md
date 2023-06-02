# @ddadaal/next-typed-api-routes

![cli](https://img.shields.io/npm/v/@ddadaal/next-typed-api-routes-runtime?label=runtime)
![cli](https://img.shields.io/npm/v/@ddadaal/next-typed-api-routes-cli?label=cli)

Write a `Schema` interface in your API route file, and you get

- route parameters validation and type completion
- typed API clients
- faster JSON response serialization

all at one command!

Migrate from v0.2? See the [migration guide](#migrate-from-v02)!

# Requirement for the target Next.js Project

1. Use [TypeScript](https://nextjs.org/docs/basic-features/typescript)
2. Set `"baseUrl": "."` in `tsconfig.json` `compilerOptions` part

```json
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```
3. All codes should live in `src` dir [next.js src directory](https://nextjs.org/docs/advanced-features/src-directory)

# Get Started

1. Install the packages in your Next.js TypeScript project

```bash
npm install --save @ddadaal/next-typed-api-routes-runtime
npm install -D @ddadaal/next-typed-api-routes-cli
```

2. Create a API route `src/pages/api/test.ts` with the following content

```ts
import { route } from "@ddadaal/next-typed-api-routes-runtime";

interface Value {
  articleId: number;
}

export interface TestApiSchema {
  method: "POST";

  query: {
    a?: string | number;
  };

  body: {
    test: string;
  };

  responses: {
    200: { test: string; }
    403: { message: string; }
  }
}

export default route<TestApiSchema>("TestApiSchema", async (req) => {
  const { a } = req.query;
  const { test } = req.body;

  return { 200: { test: test + "" + a } };
});
```

3. Create `apiClient` object

Create `src/apis/client.ts` with the following content

```ts
import { createApiClient } from "@ddadaal/next-typed-api-routes-runtime/lib/client";

// Pass custom client config here
export const apiClient = createApiClient({});
```

4. Run `npx ntar schema && npx ntar client`

`api-routes-schemas.json` will be generated at cwd. You should never edit it directly. The project cannot start without this file.

`src/apis/api.ts` will be generated at `src/apis`.

5. Import the `api` variable from `src/apis/api.ts` to use the client.

```ts
import { api } from "src/apis/api";

api.testApi({ query: {}, body: { test: "123" } })
  .httpError(403, ({ message }) => { console.log(403, message); })
  .then(({ test }) => { console.log(test); });
```

# Updating existing API Routes

To convert a normal API Routes to a type checked one, all you need to do is

1. Write a valid `Schema` interface
2. Wrap the handler function with `route` function, specify the name of Schema interface as the type argument and first argument

The Get Started part provides an example of a correctly formatted API route file. `ntar` will report errors if Incorrect route file is found.

Run `ntar schema` when the `Schema` interface is changed.

Run `ntar client` when the HTTP method or URL or the name of schema is changed.

# Schema Interface Specification

The shape of Schema interface is defined as follows:

```ts
// The name of the schema must end with "Schema"
// and must be unique across the whole project
interface TestSchema {
  // Required. Must be a valid CAPITALIZED string literal type of HTTP method (GET, POST, PATCH)
  method: "POST";

  // Optional. Define the path param and query (to align with next.js)
  query: {
    // Supports most type constructs
    property?: string | number | AnotherInterface | Pick<{ number: string }, "number">;
    
    /**
     * You can also use jsdoc for more specific limits
     * You can use keywords and values from JSON Schema Draft-07
     * @format email
     * @maxLength 50
     */
    anotherProperty: string;
  }

  // Optional. Define the body
  body: {
    // Supports most type constructs
    property?: string | number | AnotherInterface | Pick<{ number: string }, "number">;
  } 

  // Required. Define the responses
  responses: {
    // Key as response code. 
    // Only one [200, 300) response should exist. It will be considered by clients as the success response
    // If the success response has no payload, the status code must be 204.
    200: {
      // Supports most type constructs
      property?: string | number | AnotherInterface | Pick<{ number: string }, "number">;
    };

    // If the code has no payload, set the type to null
    404: null;
  }
}
```

# Tips

- All schemas and used models must have globally unique name
- Return a `{ [statusCode]: payload }` object in a route to take advantages of response body type check and faster JSON serialization
- To ensure that client bundle doesn't include unnecessary packages (e.g. `ajv`, `fast-json-stringify`, which are only used in server side), 
    - import packages only from `@ddadaal/next-typed-api-routes-runtime/lib/client` in client files, 
    - import types with `import type` clause

# Thanks

- [`Ajv`](https://ajv.js.org/) for JSON Schema validation
- [`vega/ts-json-schema-generator`](https://github.com/vega/ts-json-schema-generator) for generating json schema from typescript
- [`fast-json-stringify`](https://github.com/fastify/fast-json-stringify) for faster JSON response serialization
- [`fastify`](https://github.com/fastify/fastify) for inspiration or unified validation and serialization using JSON schema


# Migrate from v0.2

Since 0.3, this package is separated to [cli](packages/cli) and [runtime](packages/runtime) and organized as a monorepo. To migrate existing codebase, 

1. Delete previous dependency

```bash
npm uninstall --save @ddadaal/next-typed-api-routes
```

2. Install current packages

```bash
npm install --save @ddadaal/next-typed-api-routes-runtime
npm install -D @ddadaal/next-typed-api-routes-cli
```

3. Replace all imports from `@ddadaal/next-typed-api-routes` to `@ddadaal/next-typed-api-routes-runtime`. Editors and IDE can be of great help.

4. Regenerate API clients and schema

```bash
npx ntar schema && npx ntar client
```

# Roadmap

- [ ] More configurations

# License

MIT

