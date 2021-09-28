# next-typed-api-routes

Write a `Schema` interface in your API route file, and the library gives you

- route parameters type check, completion and validation
- typed API clients

all at one command!

# Get Started

1. Install the package in your Next.js TypeScript project

```bash
npm install --save next-typed-api-routes
```

2. Create a API route `src/pages/api/tscheck.ts` with the following content

```ts
```

3. Run `npx ntar sync`

Several files will be generated at `src/apis`. Make sure removing the dir if it already exists.

# Updating existing API Routes

To convert a normal API Routes to a type checked one, do the following:

1. Write a `Schema` interface
2. Wrap the handle with `route` function and specify the name of Schema interface as the type argument and first argument

The Get Started part provides an example of a correctly formatted API route file. `ntar` will report errors if Incorrect route file is found.

# Schema Interface Specification

The shape of Schema interface is defined as follows:

```ts
// The name of the schema must be unique across the whole project
interface TestSchema {
  // Required. Must be a valid string literal type of HTTP method
  method: "POST";

  // Optional. Define the querystring
  querystring: {
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

# Roadmap

- [] Configurations for output dirs etc
- [] Faster JSON Stringify using [`fastify/fast-json-stringify`](https://github.com/fastify/fast-json-stringify)

# License

MIT

