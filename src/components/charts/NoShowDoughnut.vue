<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { Report } from '@/types'

const props = defineProps<{ report: Report }>()

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Attended', 'No-Show'],
  datasets: [
    {
      data: [props.report.checkInCount, props.report.noShowCount],
      backgroundColor: ['#34d399', '#f87171'],
      borderWidth: 2,
    },
  ],
}))

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label(context) {
          const total = context.dataset.data.reduce((a: number, b) => a + (b as number), 0)
          const value = context.parsed
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return ` ${context.label}: ${value} (${pct}%)`
        },
      },
    },
  },
}
</script>

<template>
  <div class="doughnut-wrapper">
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div class="center-label">
      <span class="rate">{{ Math.round(report.attendanceRate * 100) }}%</span>
      <span class="rate-label">attended</span>
    </div>
  </div>
</template>

<style scoped>
.doughnut-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.center-label {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.rate {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1;
}

.rate-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  opacity: 0.6;
}
</style>
