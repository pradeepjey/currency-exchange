import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';

export const exchangeRateChartConfig: ChartConfiguration<'line'> = {
  type: 'line',
  data: {
    datasets: [
      {
        label: '',
        data: [], // Empty by default; fill dynamically
        borderColor: 'blue',
        tension: 0.1,
        fill: false,
      },
      {
        label: '',
        data: [], // Empty by default; fill dynamically
        borderColor: 'red',
        tension: 0.1,
        fill: false,
      },
      {
        label: '',
        data: [], // Empty by default; fill dynamically
        borderColor: 'green',
        tension: 0.1,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'PP'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Rate'
        }
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  }
};
