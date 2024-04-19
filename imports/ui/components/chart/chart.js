import "./chart.html";
// Import Chart.js
import Highcharts from "highcharts";
import "highcharts/modules/drilldown";
import "highcharts/highcharts-more";
// import 'highcharts/es-modules/variable-pie';
import "highcharts/modules/cylinder";
// import 'highcharts/es-modules/cylinder';
import "highcharts/highcharts-3d";

import Exporting from "highcharts/modules/exporting";
Exporting(Highcharts);

export const myChart = function (categories, seriesData, template) {};
Template.chartPie.onRendered(function () {
  // Define sliceSize function

  const categories = this.data.items.map((item) => {
    return {
      ...item,
      y: item.total,
      name: item.label,
    };
  });

  Highcharts.chart(this.data.name, {
    chart: {
      type: "pie",
    },
    title: {
      text: this.data.name,
    },
    tooltip: {
      valueSuffix: "",
    },
    subtitle: {
      text: "",
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: [
          {
            enabled: true,
            distance: 20,
          },
          {
            enabled: true,
            distance: -40,
            format: "{point.percentage:.1f}%",
            style: {
              fontSize: "1.2em",
              textOutline: "none",
              opacity: 0.7,
            },
            filter: {
              operator: ">",
              property: "percentage",
              value: 10,
            },
          },
        ],
      },
    },
    series: [
      {
        name: "Pegawai",
        colorByPoint: true,
        data: categories,
      },
    ],
  });
});

Template.chartPie.helpers({
  listItem() {
    return [
      { label: "Pegawai Tetap Yayasan (PTY)", amount: 10 },
      { label: "Pegawai Tetap Perwakilan (PTP)", amount: 10 },
      { label: "Pegawai Tidak Tetap (PTT)", amount: 10 },
      { label: "Resign", amount: 10 },
      { label: "Pensiun", amount: 10 },
      { label: "Salah Unit Kerja", amount: 10 },
    ];
  },
});

Template.chartBatang.onRendered(function () {
  const title = this.data.title;
  if (this.data.items) {
    const categories = this.data.items.map((item) => {
      return item.label;
    });
    const values = this.data.items.map((item) => {
      return item.total;
    });
    Highcharts.chart(this.data.name, {
      chart: {
        type: "column",
      },
      title: {
        text: title,
        align: "left",
      },
      // subtitle: {
      //   text:
      //     'Source: <a target="_blank" ' +
      //     'href="https://www.indexmundi.com/agriculture/?commodity=corn">indexmundi</a>',
      //   align: "left",
      // },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: title,
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: "",
        },
      },
      tooltip: {
        // valueSuffix: " (1000 MT)",
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: "{point.y:f}",
          },
        },
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: [
        {
          name: "Pegawai",
          data: values,
        },
      ],
    });
  }
});
