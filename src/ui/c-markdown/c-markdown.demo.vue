<script setup lang="ts">
const md = `
# Web Tools

## About
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl quis
mollis blandit, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.

- Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Sed euismod, nisl quis mollis blandit, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.

[web-tools](https://github.com/acaylor/web-tools)
`;
</script>

<template>
  <c-markdown :markdown="md" />
</template>
