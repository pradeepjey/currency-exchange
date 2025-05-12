import { Component, AfterViewInit, ViewChild, ElementRef, input, effect } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { exchangeRateChartConfig } from "../../shared/chart-config";
import { ChartData } from '../../models/chart-data.model';
import { DateWiseRate } from '../../models/exchange-rate.model';
import { yyyyMmDdToDate } from '../../utils/date-utils';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  template: `<canvas #lineChartCanvas></canvas>`,
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('lineChartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  index = input<number>(0);
  label = input<string>();
  data = input<DateWiseRate | null>();
  chartViewUpdate = input<string>("14");
  chartData: ChartData[] = []; 
  config: any;
  dataSet: ChartData[][] = [];

  constructor() {
    effect(() => {
      this.updateChart(this.data());
    });

    effect(() => {
      this.updateDays(this.chartViewUpdate());
    });
  }

  ngAfterViewInit(): void {
    this.config = structuredClone(exchangeRateChartConfig);
    this.chart = new Chart(this.chartRef.nativeElement, this.config);
  }

  /**
   * Generate chart data set
   * @param data - An object with date wise rate
   * @returns Chart data array
   */
  generateChartData(data: DateWiseRate): ChartData[] {
    const mapped = Object.entries(data).map(([key, value]) => ({
      x: yyyyMmDdToDate(key).getTime(),
      y: value
    }));
    return mapped;
  }

  /**
   * Set and update
   * @param data - An object with date wise rate
   * @returns Chart data array
   */
  updateChart(data: DateWiseRate | null | undefined) {
    if(data !== null && data !== undefined) {
      const chartArray = this.generateChartData(data);
      this.dataSet[this.index() - 1] = chartArray;
      this.config.data.datasets[this.index() - 1].label = this.label();
      this.config.data.datasets[this.index() - 1].data = chartArray;
      this.chart.update();
    }
  }

  /**
   * Change number of days from chart
   * @param days - No. of days to be visible on the chart from today
   */
  updateDays(days: string) {
    const daysCount = Number(days);
    this.dataSet.forEach((item, index) => {
      const slicedArr = item.slice(-daysCount);
      this.config.data.datasets[index].data = slicedArr;
      this.chart.update();
    });
  }
}
