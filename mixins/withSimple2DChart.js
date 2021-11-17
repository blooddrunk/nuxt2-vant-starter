import { merge } from 'lodash-es';

import withChart from '@/mixins/withChart.js';
import { toPercentage } from '@/utils/math';

export default {
  mixins: [withChart()],

  props: {
    categoryDim: {
      type: String,
      default: 'name',
      required: true,
    },

    data: {
      type: Array,
      default: () => [],
    },

    grid: {
      type: Object,
      default: undefined,
    },

    legend: {
      type: [Boolean, Object, String],
      default: true,
      validator: (val) => {
        if (typeof val === 'string') {
          return val === 'auto';
        }
        return true;
      },
    },

    markLine: {
      type: Object,
      default: undefined,
    },

    min: {
      type: [String, Number, Function],
      default: undefined,
    },

    max: {
      type: [String, Number, Function],
      default: undefined,
    },

    percent: {
      type: [Boolean, Object],
      default: undefined,
    },

    series: {
      type: [Array, Function],
      default: undefined,
    },

    simpleTooltip: {
      type: Boolean,
      default: false,
    },

    tooltip: {
      type: [Boolean, Object, Function],
      default: true,
    },

    tooltipTitleFormatter: {
      type: Function,
      default: undefined,
    },

    tooltipSeriesNameFormatter: {
      type: Function,
      default: undefined,
    },

    tooltipMarkerColor: {
      type: Object,
      default: undefined,
    },

    valueDim: {
      type: Array,
      required: true,
    },

    xAxis: {
      type: [Boolean, Object, Function],
      default: true,
    },

    yAxis: {
      type: [Boolean, Object, Function],
      default: true,
    },
  },

  computed: {
    chartDims() {
      return [this.categoryDim].concat(this.valueDim);
    },

    valueDimLength() {
      return this.valueDim ? this.valueDim.length : 0;
    },

    tooltipFormatter() {
      return this.getTooltipFormatter({
        type: this.simpleTooltip ? 'simple' : 'normal',
        valueFormatter: ({ data, seriesName }) => {
          const dim = this.dimLookup[seriesName];
          if (!dim) {
            console.warn(`Unable to find property name for ${seriesName} in data`);
            return '';
          }

          let value = data[dim.name];

          if (typeof dim.valueFormatter === 'function') {
            value = dim.valueFormatter({ value, data, seriesName, dim });
          } else {
            const percent = dim.percent || this.percent;
            if (percent === true) {
              value = toPercentage(value);
            } else if (percent) {
              value = toPercentage(value, percent);
            }
          }

          return value;
        },
        markerColor: this.tooltipMarkerColor,
        titleFormatter: this.tooltipTitleFormatter,
        seriesNameFormatter: this.tooltipSeriesNameFormatter,
      });
    },

    chartToolTip() {
      const defaultTooltipConfig = {
        confine: true,
        show: !!this.tooltip,
        // * center tooltip
        // position: (point, params, dom, rect, size) => {
        //     const { viewSize, contentSize } = size;
        //     return [(viewSize[0] - contentSize[0]) / 2, (viewSize[1] - contentSize[1]) / 2];
        // },
        trigger: 'axis',
        formatter: this.tooltipFormatter,
      };

      if (typeof this.tooltip === 'function') {
        return this.tooltip(defaultTooltipConfig);
      }

      return merge(defaultTooltipConfig, this.tooltip);
    },

    chartYAxis() {
      const defaultYAxisConfig = {
        type: 'value',
        show: !!this.yAxis,
        nameTextStyle: {
          color: '#38b2ac',
        },
        min: this.min,
        max: this.max,
      };

      if (typeof this.yAxis === 'function') {
        return this.yAxis(defaultYAxisConfig);
      }

      return merge(defaultYAxisConfig, this.yAxis);
    },

    chartGrid() {
      const defaultGridConfig = {
        left: '5%',
        right: '5%',
        top: this.title ? 70 : 50,
        bottom: 90,
      };

      return merge(defaultGridConfig, this.grid);
    },

    chartLegend() {
      const defaultLegendConfig = {
        show: this.legend === 'auto' ? this.valueDimLength > 1 : !!this.legend,
        top: 5,
      };

      return merge(defaultLegendConfig, this.legend);
    },

    chartOptions() {
      const baseOption = {
        grid: this.chartGrid,

        legend: this.chartLegend,

        tooltip: this.chartToolTip,

        xAxis: this.chartXAxis,

        yAxis: this.chartYAxis,
      };

      if (this.color) {
        baseOption.color = typeof this.color === 'string' ? [this.color] : this.color;
      }

      return this.getOption(baseOption);
    },
  },
};
