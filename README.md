# yaschema-api-fetcher

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Fetch support for yaschema-api.

## Basic Example

```typescript
// You'll typically define this in a separate library shared by your server and clients
export const postPing = makeHttpApi({
  method: 'POST',
  routeType: 'rest',
  url: '/ping',
  isSafeToRetry: true,
  schemas: {
    request: {
      body: schema.object({
        echo: schema.string().allowEmptyString().optional()
      })
    },
    successResponse: {
      status: schema.number(StatusCodes.OK),
      body: schema.string()
    }
  }
});
```

```typescript
// Use the API via fetch to post the specified string
const doPing = async (echo?: string) => {
  const pingRes = await apiFetch(postPing, { body: { echo } });
  if (!pingRes.ok) {
    console.error('Something went wrong', pingRes)
    return;
  }

  console.log(pingRes.body);
}
```

The above example demonstrates compile-time, type-safe use of a yaschema-api, which also performs runtime validation.  With yaschema-api, both the client and server can use the same API definitions.  However, it's also fine for the API definitions to be used in a one-sided way, for example, when integrating with third-party REST APIs.

With yaschema-api, types can be defined for:

- request headers, params, query, and body
- success response status, headers, and body
- expected failure response status, headers, and body

## Thanks

Thanks for checking it out.  Feel free to create issues or otherwise provide feedback.

[API Docs](https://passfolio.github.io/yaschema-api-fetcher/)

Be sure to check out our other [Open Source @ Passfolio](https://github.com/Passfolio) projects as well.

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/yaschema-api-fetcher.svg

[downloads]: https://www.npmjs.com/package/yaschema-api-fetcher

[size-badge]: https://img.shields.io/bundlephobia/minzip/yaschema-api-fetcher.svg

[size]: https://bundlephobia.com/result?p=yaschema-api-fetcher
