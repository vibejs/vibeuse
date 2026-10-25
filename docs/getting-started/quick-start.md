# Quick Start

Use composables inside a genuine Vibe.js component. Setup runs within the component effect scope; unmount stops the debounce watcher and pending timeout.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';
import { useDebounce } from '@usevibejs/use';
const input = ref('');
const { value: search } = useDebounce(input, 250);
</script>

<template>
  <label>Search <input v-model="input" /></label>
  <p>{{ search }}</p>
</template>
```

See the interactive useDebounce page to try the same behavior.
