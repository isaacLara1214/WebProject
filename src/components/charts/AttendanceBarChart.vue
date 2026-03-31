<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useEventsStore } from '@/stores/events'
import type { Report } from '@/types'

const props = defineProps<{ reports: Report[] }>()

const eventsStore = useEventsStore()

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.reports.map((r) => {
    const event = eventsStore.eventById(r.eventId)
    const title = event?.title ?? r.eventId
    return title.length > 20 ? title.slice(0, 20) + '…' : title
  }),
  datasets: [
    {
      label: 'Registered',
      data: props.reports.map((r) => r.registrationCount),
      backgroundColor: '#818cf8',
      borderRadius: 4,
    },
    {
      label: 'Checked In',
      data: props.reports.map((r) => r.checkInCount),
      backgroundColor: '#34d399',
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        afterLabel(context) {
          const report = props.reports[context.dataIndex]
          if (!report) return ''
          return `Attendance rate: ${Math.round(report.attendanceRate * 100)}%`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}))
</script>

<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 280px;
  width: 100%;
}
</style>
