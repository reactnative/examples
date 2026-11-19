# Examples

Complete, tested Expo projects behind the code-backed articles on [www.reactnative.com](https://www.reactnative.com).

| Example | Article |
|---|---|
| [`searchable-list`](searchable-list) | [Build a searchable list with FlatList and TextInput](https://www.reactnative.com/build-a-searchable-list-with-flatlist) |
| [`flashlist-feed`](flashlist-feed) | [Render a long list with FlashList](https://www.reactnative.com/render-a-long-list-with-flashlist) |
| [`router-tabs`](router-tabs) | [Build tabs and a detail screen with Expo Router](https://www.reactnative.com/build-tabs-and-a-detail-screen-with-expo-router) |

## Run an example

You need [Bun](https://bun.sh). In the example's folder:

```sh
bun install
bun run test        # Jest with React Native Testing Library
bun run typecheck
bun run start       # Expo: open it in Expo Go, a simulator or the browser
```

`bun install` checks each package with [Socket's security scanner](https://github.com/SocketDev/bun-security-scanner) (`bunfig.toml`) before installing it. It needs no account. To install without it, remove the `[install.security]` section.

Each example is type-checked, tested and exported for the web in CI before it is copied here. Changes are made in the site's own repository and copied here automatically, so pull requests here are not merged.

## License

[MIT No Attribution](LICENSE): copy the code into your own projects without keeping a notice.
