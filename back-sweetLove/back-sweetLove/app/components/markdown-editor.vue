<script setup lang="ts">
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconStrikethrough,
} from '@tabler/icons-vue'
import type { Component, ComponentPublicInstance } from 'vue'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

const props = withDefaults(defineProps<{
  modelValue: string
  inputId?: string
  rows?: number
  placeholder?: string
  required?: boolean
}>(), {
  inputId: undefined,
  rows: 8,
  placeholder: '',
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const textareaComponent = ref<ComponentPublicInstance | null>(null)

const textareaElement = () => {
  const rootElement = textareaComponent.value?.$el
  return rootElement instanceof HTMLTextAreaElement ? rootElement : null
}

const applySelection = (updatedValue: string, selectionStart: number, selectionEnd: number) => {
  emit('update:modelValue', updatedValue)
  nextTick(() => {
    const textarea = textareaElement()
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(selectionStart, selectionEnd)
  })
}

// Wraps the current selection (or a placeholder) with inline markdown marks.
const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
  const textarea = textareaElement()
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = props.modelValue.slice(start, end) || placeholder
  const updatedValue = props.modelValue.slice(0, start) + prefix + selectedText + suffix + props.modelValue.slice(end)
  applySelection(updatedValue, start + prefix.length, start + prefix.length + selectedText.length)
}

// Prefixes every line touched by the selection (headings, lists, quotes).
const prefixSelectedLines = (buildPrefix: (lineIndex: number) => string) => {
  const textarea = textareaElement()
  if (!textarea) return
  const value = props.modelValue
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const blockStart = value.lastIndexOf('\n', start - 1) + 1
  const blockEndIndex = value.indexOf('\n', end)
  const blockEnd = blockEndIndex === -1 ? value.length : blockEndIndex
  const block = value.slice(blockStart, blockEnd)
  const prefixedBlock = block
    .split('\n')
    .map((line, lineIndex) => `${buildPrefix(lineIndex)}${line}`)
    .join('\n')
  const updatedValue = value.slice(0, blockStart) + prefixedBlock + value.slice(blockEnd)
  applySelection(updatedValue, blockStart, blockStart + prefixedBlock.length)
}

interface ToolbarAction {
  label: string
  icon: Component
  run: () => void
}

const toolbarActions: ToolbarAction[][] = [
  [
    { label: 'Negrita', icon: IconBold, run: () => wrapSelection('**', '**', 'texto en negrita') },
    { label: 'Cursiva', icon: IconItalic, run: () => wrapSelection('*', '*', 'texto en cursiva') },
    { label: 'Tachado', icon: IconStrikethrough, run: () => wrapSelection('~~', '~~', 'texto tachado') },
  ],
  [
    { label: 'Título', icon: IconH2, run: () => prefixSelectedLines(() => '## ') },
    { label: 'Subtítulo', icon: IconH3, run: () => prefixSelectedLines(() => '### ') },
  ],
  [
    { label: 'Lista', icon: IconList, run: () => prefixSelectedLines(() => '- ') },
    { label: 'Lista numerada', icon: IconListNumbers, run: () => prefixSelectedLines((lineIndex) => `${lineIndex + 1}. `) },
    { label: 'Cita', icon: IconBlockquote, run: () => prefixSelectedLines(() => '> ') },
  ],
  [
    { label: 'Código', icon: IconCode, run: () => wrapSelection('`', '`', 'código') },
    { label: 'Enlace', icon: IconLink, run: () => wrapSelection('[', '](https://)', 'texto del enlace') },
  ],
]
</script>

<template>
  <Tabs default-value="write">
    <TabsList>
      <TabsTrigger value="write">Escribir</TabsTrigger>
      <TabsTrigger value="preview">Vista previa</TabsTrigger>
    </TabsList>
    <TabsContent value="write">
      <div class="flex flex-col">
        <div class="bg-muted/60 flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 px-1.5 py-1">
          <template v-for="(group, groupIndex) in toolbarActions" :key="groupIndex">
            <span v-if="groupIndex > 0" class="bg-border mx-1 h-4 w-px" />
            <Button
              v-for="action in group"
              :key="action.label"
              type="button"
              variant="ghost"
              size="icon"
              class="size-7"
              :title="action.label"
              :aria-label="action.label"
              @click="action.run"
            >
              <component :is="action.icon" class="size-4" />
            </Button>
          </template>
        </div>
        <Textarea
          :id="inputId"
          ref="textareaComponent"
          :model-value="modelValue"
          :rows="rows"
          :placeholder="placeholder"
          :required="required"
          class="rounded-t-none font-mono text-sm"
          @update:model-value="(value) => emit('update:modelValue', String(value))"
        />
      </div>
    </TabsContent>
    <TabsContent value="preview">
      <div class="bg-muted/40 max-h-64 min-h-32 overflow-y-auto rounded-lg border p-3">
        <MarkdownPreview v-if="modelValue" :markdown="modelValue" />
        <p v-else class="text-muted-foreground text-sm">Nada que previsualizar todavía.</p>
      </div>
    </TabsContent>
  </Tabs>
</template>
