<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12">
    <Loader2 class="h-8 w-8 animate-spin text-blue-600" />
    <p v-if="message" class="text-sm text-gray-600">{{ message }}</p>
  </div>
</template>
