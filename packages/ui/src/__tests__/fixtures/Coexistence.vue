<template>
  <div class="coexist">
    <!-- 模拟 Element Plus 的组件名与类名，验证两套库互不干扰 -->
    <el-button class="el-button">Element</el-button>
    <kf-button variant="primary">KnowFlow</kf-button>
    <el-input class="el-input" model-value="x" />
    <kf-input model-value="y" label="KnowFlow 输入" />
  </div>
</template>

<script setup lang="ts">
/* 无逻辑：仅用于共存渲染测试 */
</script>
