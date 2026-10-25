<template>
  <div class="kebab-fixture">
    <!-- 未注册插件，仅靠 script setup 的导入绑定：验证 PascalCase 导入 + kebab 标签可匹配 -->
    <kf-button variant="primary">kebab 标签</kf-button>
    <kf-input v-model="text" label="kebab 输入" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { KfButton, KfInput } from '../../index'

const text = ref('')
defineExpose({ text })
</script>
