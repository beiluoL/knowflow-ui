<template>
  <div class="global-fixture">
    <kf-button variant="primary" @click="$emit('hit')">全局按钮</kf-button>
    <kf-input v-model="text" label="全局输入" />
    <kf-checkbox v-model="agree">记住我</kf-checkbox>
    <kf-icon name="check" />
    <!-- PascalCase 形式同时验证：注册 KfButton 后两种写法都能解析 -->
    <KfButton data-probe="pascal">Pascal</KfButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{ hit: [] }>()

const text = ref('')
const agree = ref(false)

defineExpose({ text, agree })
</script>
