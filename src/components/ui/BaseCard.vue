<template>
  <div class="base-card" :class="{ 'hoverable': hoverable }" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
        <div v-if="$slots.extra" class="card-extra">
          <slot name="extra"></slot>
        </div>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: String,
  hoverable: {
    type: Boolean,
    default: true
  }
});

const isHovered = ref(false);

const onMouseEnter = () => {
  isHovered.value = true;
};

const onMouseLeave = () => {
  isHovered.value = false;
};
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.base-card.hoverable:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  border-color: #ffccc7;
}

.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fffafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.card-extra {
  color: #595959;
}

.card-body {
  padding: 24px;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}
</style>