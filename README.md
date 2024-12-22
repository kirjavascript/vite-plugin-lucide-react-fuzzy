# vite-plugin-lucide-react-fuzzy

Import hallucinated lucide-react icons that don't exist

## Install

```bash
npm i vite-plugin-lucide-react-fuzzy -D
```

## Usage

```ts
import { defineConfig } from 'vite';
import lucideReactFuzzy from './plugin';

export default defineConfig({
  plugins: [
    lucideReactFuzzy()
  ],
});
```

#### Importing icons

```ts
import { Clock, Foobar } from 'lucide-react';

<div>
    <Clock />
    <Foobar />
</div>
```

