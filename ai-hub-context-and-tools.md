# AI Hub: client context and client tools (beta)

The `<ai-hub-chat>` element has a `bridge` to give the agent context about the page and tools that run in the browser. This is currently an experimental beta, so be aware that things might not run completely smooth yet.

## Establish the bridge 

The bridge is the connection between the AI Hub and the host website.

```js
await customElements.whenDefined("ai-hub-chat");
const { bridge } = document.querySelector("ai-hub-chat");
```

## Context

You can send context to the AI Hub webcomponent, so the model knows what the user is currently looking at. For example:

```js
bridge.setContext({ url: location.href, page: "Rooms", filters: "view: lake, guests: 2" });
```

If you call it again, the previous context is overwritten. The model sees the context of the current message only.

Currently, the webcomponent doesn't display the context (since it's in experimental beta). Ask the model about the context and you will see that it arrives.

## Tools

Tools allow the model to interact with your page. The model can trigger the execution of a tool and it will be executed within the host website.

```js
bridge.registerHostTools([
    {
        name: "navigateTo",
        description: "Opens a page of the website, e.g. /rooms or /booking.",
        inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
        readOnlyHint: true,
        handler: async ({ path }) => {
            navigate(path);
            return { url: location.href };
        },
    },
]);
```

- Only these fields are allowed. A tool with any other field is skipped. At most 100 tools.
- `readOnlyHint: true` runs the tool without user approval. Otherwise, the user has to explicitly approve each call.
- The model gets the return value as JSON. A thrown error is shown to the model as `failed: <message>`, so write errors that say how to fix the call.

## Gotcha: tools and context are fixed for a whole answer

The AI Hub uses the tools and context from the start of the answer. If you, for example, navigate to another page while the generation is still in process, the model won't know that. It will only know once you send the next message.
