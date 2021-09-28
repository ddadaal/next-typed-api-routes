# next-typed-api-routes

Write a `Schema` interface in your API route file, and you get

- route parameters validation and type completion
- typed API clients
- faster JSON response serialization

all at one command!

# Get Started

1. Install the package in your Next.js TypeScript project

```bash
npm install --save next-typed-api-routes
```

2. Create a API route `src/pages/api/testapi.ts` with the following content

```ts
import { route } from "next-typed-api-routes";

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
    403: { testA: string; }
  }
}

export default route<TestApiSchema>("TestApiSchema", async (req) => {
  const { a } = req.query;
  const { test } = req.body;

  return { 200: { test: test + "" + a } };
});
```

3. Add the following into the `scripts` section of your `package.json` to run `ntar schema` after `npm install`

```json
"postinstall": "ntar schema"
```

4. Run `npx ntar schema && npx ntar client`

a `src/apis/api.ts` file will be generated at `src/apis`.

5. Import the `realApis` variable from `src/apis/api.ts` to use the client.

```ts
import { realApis } from "src/apis";

realApis.testApi({ query: {}, body: { test: "123" } })
  .then(({ test }) => { console.log(test)});
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
// The name of the schema must be unique across the whole project
interface TestSchema {
  // Required. Must be a valid CAPITALIZED string literal type of HTTP method (GET, POST, PATCH)
  method: "POST";

  // Optional. Define the path param and query (to align with next.js)
  query: {
    // Supports most type constructs
    property?: string | number | AnotherInterface | Pick<{ number: string }, "number">;
    
    /**
     * You can also use jsdoc for more specific limits
     * @format email
     * @length 50
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
    200: {
      // Supports most type constructs
      property?: string | number | AnotherInterface | Pick<{ number: string }, "number">;
    };
    
    // If the code has no payload, set the type to null
    404: null;
  }
}
```

# Thanks

- [`Ajv`](https://ajv.js.org/) for JSON Schema validation
- [`vega/ts-json-schema-generator`](https://github.com/vega/ts-json-schema-generator) for generating json schema from typescript
- [`fast-json-stringify`](https://github.com/fastify/fast-json-stringify) for faster JSON response serialization
- [`fastify`](https://github.com/fastify/fastify) for inspiration or unified validation and serialization using JSON schema

# Roadmap

- [] More configurations

# License

MIT

