import "./chart.html";
// Import Chart.js
import { Chart } from "chart.js";
Template.chartPie.onRendered(function () {
  // Define sliceSize function
  const sliceSize = (dataNum, dataTotal) => {
    return (dataNum / dataTotal) * 360;
  };

  // Define addSlice function
  const addSlice = (sliceSize, pieElement, offset, sliceID, color) => {
    $(pieElement).append(`<div class='slice ${sliceID}'><span></span></div>`);
    offset = offset - 1;
    const sizeRotation = -179 + sliceSize;
    $(`.${sliceID}`).css({
      transform: `rotate(${offset}deg) translate3d(0,0,0)`,
    });
    $(`.${sliceID} span`).css({
      transform: `rotate(${sizeRotation}deg) translate3d(0,0,0)`,
      "background-color": color,
    });
  };

  // Define iterateSlices function
  const iterateSlices = (
    sliceSize,
    pieElement,
    offset,
    dataCount,
    sliceCount,
    color
  ) => {
    const sliceID = `s${dataCount}-${sliceCount}`;
    const maxSize = 179;
    if (sliceSize <= maxSize) {
      addSlice(sliceSize, pieElement, offset, sliceID, color);
    } else {
      addSlice(maxSize, pieElement, offset, sliceID, color);
      iterateSlices(
        sliceSize - maxSize,
        pieElement,
        offset + maxSize,
        dataCount,
        sliceCount + 1,
        color
      );
    }
  };

  // Define createPie function
  const createPie = (dataElement, pieElement) => {
    const listData = [];
    $(`${dataElement} span`).each(function () {
      listData.push(Number($(this).html()));
    });
    let listTotal = 0;
    for (let i = 0; i < listData.length; i++) {
      listTotal += listData[i];
    }
    let offset = 0;
    const color = [
      "cornflowerblue",
      "olivedrab",
      "orange",
      "tomato",
      "crimson",
      "purple",
      "turquoise",
      "forestgreen",
      "navy",
      "gray",
    ];
    for (let i = 0; i < listData.length; i++) {
      const size = sliceSize(listData[i], listTotal);
      iterateSlices(size, pieElement, offset, i, 0, color[i]);
      $(`${dataElement} li:nth-child(${i + 1})`).css("border-color", color[i]);
      offset += size;
    }
  };

  // Call createPie function
  setTimeout(() => {
    createPie(".pieID.legend", ".pieID.pie");
  }, 1000);
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
  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});
