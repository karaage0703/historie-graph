<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { Clock, Pencil, Settings, Menu, X } from 'lucide-vue-next'
import { useSettings } from '@/composables/useSettings'
import { useAffiliateLink } from '@/composables/useAffiliateLink'

const isMenuOpen = ref(false)
const route = useRoute()
const { loadSettings } = useSettings()
const { loadAffiliateTag } = useAffiliateLink()

function closeMenu() {
  isMenuOpen.value = false
}

onMounted(() => {
  loadSettings()
  loadAffiliateTag()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex h-14 items-center justify-between sm:h-16">
          <div class="flex items-center gap-2">
            <Clock class="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            <span class="text-base font-bold text-gray-900 sm:text-lg">Historie Graph</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden items-center gap-1 sm:flex">
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

          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="rounded-md p-2 text-gray-700 hover:bg-gray-100 sm:hidden"
            @click="isMenuOpen = !isMenuOpen"
          >
            <X v-if="isMenuOpen" class="h-6 w-6" />
            <Menu v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div
        v-if="isMenuOpen"
        class="border-t border-gray-200 bg-white sm:hidden"
      >
        <div class="space-y-1 px-4 py-3">
          <RouterLink
            to="/"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium"
            :class="route.path === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            @click="closeMenu"
          >
            <Clock class="h-5 w-5" />
            タイムライン
          </RouterLink>
          <RouterLink
            to="/admin"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium"
            :class="route.path === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            @click="closeMenu"
          >
            <Pencil class="h-5 w-5" />
            管理
          </RouterLink>
          <RouterLink
            to="/settings"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium"
            :class="route.path === '/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            @click="closeMenu"
          >
            <Settings class="h-5 w-5" />
            設定
          </RouterLink>
        </div>
      </div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>
