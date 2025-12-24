<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-4xl px-4">
      <div class="mb-8 flex items-center gap-3">
        <Clock class="h-8 w-8 text-gray-700" />
        <h1 class="text-2xl font-bold text-gray-900">タイムライン</h1>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <p class="text-gray-600">タイムライン機能は後続のタスクで実装されます</p>
      </div>
    </div>
  </div>
</template>
