<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { Clock, Pencil, Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <Clock class="h-6 w-6 text-blue-600" />
            <span class="text-lg font-bold text-gray-900">Historie Graph</span>
          </div>
          <div class="flex items-center gap-1">
            <RouterLink
              to="/"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <Clock class="h-4 w-4" />
              タイムライン
            </RouterLink>
            <RouterLink
              to="/admin"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <Pencil class="h-4 w-4" />
              管理
            </RouterLink>
            <RouterLink
              to="/settings"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <Settings class="h-4 w-4" />
              設定
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>
