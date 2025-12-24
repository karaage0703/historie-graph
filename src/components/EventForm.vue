<script setup lang="ts">
import { ref, watch } from 'vue'
import { Save, X, Plus, Trash2 } from 'lucide-vue-next'
import type { HistoryEvent, MediaItem, MediaType, Region } from '@/types'

const props = defineProps<{
  event?: HistoryEvent
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [event: Omit<HistoryEvent, 'id'> | Partial<HistoryEvent>]
  cancel: []
}>()

const formData = ref({
  title: '',
  year: 0,
  yearDisplay: '',
  era: '',
  region: 'japan' as Region,
  description: '',
  links: [] as string[],
  media: [] as MediaItem[],
})

const newLink = ref('')
const newMedia = ref<MediaItem>({
  title: '',
  type: 'manga',
  remark: '',
})

const errors = ref<Record<string, string>>({})

const regionOptions: { value: Region; label: string }[] = [
  { value: 'japan', label: '日本' },
  { value: 'china', label: '中国' },
  { value: 'europe', label: 'ヨーロッパ' },
  { value: 'middle_east', label: '中東' },
  { value: 'other', label: 'その他' },
]

const mediaTypeOptions: { value: MediaType; label: string }[] = [
  { value: 'manga', label: '漫画' },
  { value: 'novel', label: '小説' },
  { value: 'movie', label: '映画' },
  { value: 'anime', label: 'アニメ' },
]

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      formData.value = {
        title: newEvent.title,
        year: newEvent.year,
        yearDisplay: newEvent.yearDisplay,
        era: newEvent.era,
        region: newEvent.region,
        description: newEvent.description,
        links: [...newEvent.links],
        media: newEvent.media.map((m) => ({ ...m })),
      }
    }
  },
  { immediate: true }
)

function validate(): boolean {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'タイトルは必須です'
  }
  if (!formData.value.yearDisplay.trim()) {
    errors.value.yearDisplay = '年号表示は必須です'
  }
  if (!formData.value.era.trim()) {
    errors.value.era = '時代は必須です'
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', { ...formData.value })
}

function addLink() {
  if (newLink.value.trim()) {
    formData.value.links.push(newLink.value.trim())
    newLink.value = ''
  }
}

function removeLink(index: number) {
  formData.value.links.splice(index, 1)
}

function addMedia() {
  if (newMedia.value.title.trim()) {
    formData.value.media.push({ ...newMedia.value })
    newMedia.value = { title: '', type: 'manga', remark: '' }
  }
}

function removeMedia(index: number) {
  formData.value.media.splice(index, 1)
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
          タイトル <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          class="w-full rounded-md border px-3 py-2"
          :class="errors.title ? 'border-red-500' : 'border-gray-300'"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
      </div>

      <div>
        <label for="era" class="mb-1 block text-sm font-medium text-gray-700">
          時代 <span class="text-red-500">*</span>
        </label>
        <input
          id="era"
          v-model="formData.era"
          type="text"
          class="w-full rounded-md border px-3 py-2"
          :class="errors.era ? 'border-red-500' : 'border-gray-300'"
          placeholder="例: 戦国時代"
        />
        <p v-if="errors.era" class="mt-1 text-sm text-red-500">{{ errors.era }}</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div>
        <label for="year" class="mb-1 block text-sm font-medium text-gray-700">
          年（数値）
        </label>
        <input
          id="year"
          v-model.number="formData.year"
          type="number"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="紀元前は負数"
        />
      </div>

      <div>
        <label for="yearDisplay" class="mb-1 block text-sm font-medium text-gray-700">
          年号表示 <span class="text-red-500">*</span>
        </label>
        <input
          id="yearDisplay"
          v-model="formData.yearDisplay"
          type="text"
          class="w-full rounded-md border px-3 py-2"
          :class="errors.yearDisplay ? 'border-red-500' : 'border-gray-300'"
          placeholder="例: 1560年, 前202年"
        />
        <p v-if="errors.yearDisplay" class="mt-1 text-sm text-red-500">
          {{ errors.yearDisplay }}
        </p>
      </div>

      <div>
        <label for="region" class="mb-1 block text-sm font-medium text-gray-700">
          地域
        </label>
        <select
          id="region"
          v-model="formData.region"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option v-for="opt in regionOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div>
      <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
        説明
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="4"
        class="w-full rounded-md border border-gray-300 px-3 py-2"
      />
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">リンク</label>
      <div class="mb-2 flex gap-2">
        <input
          v-model="newLink"
          type="url"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2"
          placeholder="https://..."
          @keydown.enter.prevent="addLink"
        />
        <button
          type="button"
          class="rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
          @click="addLink"
        >
          <Plus class="h-5 w-5" />
        </button>
      </div>
      <ul class="space-y-1">
        <li
          v-for="(link, index) in formData.links"
          :key="index"
          class="flex items-center gap-2"
        >
          <span class="flex-1 truncate text-sm text-gray-600">{{ link }}</span>
          <button
            type="button"
            class="text-red-500 hover:text-red-700"
            @click="removeLink(index)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">関連メディア</label>
      <div class="mb-2 grid gap-2 md:grid-cols-4">
        <input
          v-model="newMedia.title"
          type="text"
          class="rounded-md border border-gray-300 px-3 py-2"
          placeholder="タイトル"
        />
        <select
          v-model="newMedia.type"
          class="rounded-md border border-gray-300 px-3 py-2"
        >
          <option v-for="opt in mediaTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <input
          v-model="newMedia.remark"
          type="text"
          class="rounded-md border border-gray-300 px-3 py-2"
          placeholder="備考"
        />
        <button
          type="button"
          class="rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
          @click="addMedia"
        >
          <Plus class="h-5 w-5" />
        </button>
      </div>
      <ul class="space-y-1">
        <li
          v-for="(media, index) in formData.media"
          :key="index"
          class="flex items-center gap-2 rounded-md bg-gray-50 p-2"
        >
          <span class="flex-1 text-sm">
            {{ media.title }} ({{ mediaTypeOptions.find((o) => o.value === media.type)?.label }})
            <span v-if="media.remark" class="text-gray-500">- {{ media.remark }}</span>
          </span>
          <button
            type="button"
            class="text-red-500 hover:text-red-700"
            @click="removeMedia(index)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </div>

    <div class="flex justify-end gap-3 border-t pt-4">
      <button
        type="button"
        class="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        @click="emit('cancel')"
      >
        <X class="h-4 w-4" />
        キャンセル
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Save class="h-4 w-4" />
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </div>
  </form>
</template>
