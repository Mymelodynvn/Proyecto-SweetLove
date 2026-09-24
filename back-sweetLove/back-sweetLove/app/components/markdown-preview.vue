<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const props = defineProps<{ markdown: string }>()

// DOMPurify needs a browser DOM; this component always renders inside
// client-only contexts (dialogs, editor preview), so SSR returns empty.
const renderedHtml = computed(() => {
  if (!import.meta.client) return ''
  const parsedHtml = marked.parse(props.markdown ?? '', { async: false })
  return DOMPurify.sanitize(parsedHtml)
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html — sanitized with DOMPurify above -->
  <div class="markdown-body text-sm leading-relaxed" v-html="renderedHtml" />
</template>

<style scoped>
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--foreground);
  margin-block: 1rem 0.5rem;
}

.markdown-body :deep(h1) {
  font-size: 1.35rem;
}

.markdown-body :deep(h2) {
  font-size: 1.2rem;
}

.markdown-body :deep(h3) {
  font-size: 1.05rem;
}

.markdown-body :deep(p) {
  margin-block: 0.5rem;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-block: 0.5rem;
  padding-inline-start: 1.4rem;
}

.markdown-body :deep(ul) {
  list-style: disc;
}

.markdown-body :deep(ol) {
  list-style: decimal;
}

.markdown-body :deep(li) {
  margin-block: 0.2rem;
}

.markdown-body :deep(a) {
  color: var(--primary);
  text-decoration: underline;
}

.markdown-body :deep(blockquote) {
  border-inline-start: 3px solid var(--secondary);
  padding-inline-start: 0.75rem;
  margin-block: 0.75rem;
  color: var(--muted-foreground);
  font-style: italic;
}

.markdown-body :deep(code) {
  background: var(--muted);
  border-radius: 0.25rem;
  padding: 0.1rem 0.35rem;
  font-size: 0.85em;
}

.markdown-body :deep(pre) {
  background: var(--muted);
  border-radius: 0.5rem;
  padding: 0.75rem;
  overflow-x: auto;
  margin-block: 0.75rem;
}

.markdown-body :deep(hr) {
  border-color: var(--border);
  margin-block: 1rem;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--foreground);
}
</style>
