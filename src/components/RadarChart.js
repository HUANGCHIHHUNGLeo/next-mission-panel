'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarChart({ skills }) {
  const chartRef = useRef(null);

  const skillNames = {
    calc: '運算能力',
    geom: '幾何圖形',
    algebra: '代數運用',
    apply: '解題應用'
  };

  // 確保技能順序一致，並處理數據
  const skillOrder = ['calc', 'geom', 'algebra', 'apply'];
  const labels = skillOrder.map(key => skillNames[key]);
  const skillData = skillOrder.map(key => {
    const skill = skills[key];
    return skill ? skill.lvl || 1 : 1;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: '技能等級',
        data: skillData,
        backgroundColor: 'rgba(98, 200, 255, 0.2)',
        borderColor: 'rgba(98, 200, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(98, 200, 255, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(98, 200, 255, 1)',
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(11, 36, 51, 0.9)',
        titleColor: '#eaffff',
        bodyColor: '#eaffff',
        borderColor: 'rgba(98, 200, 255, 0.4)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: Lv.${context.raw}`;
          }
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 10,
        angleLines: {
          color: 'rgba(98, 200, 255, 0.3)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(98, 200, 255, 0.3)',
          lineWidth: 1,
        },
        pointLabels: {
          color: '#eaffff',
          font: {
            family: 'Orbitron, Share Tech Mono, monospace',
            size: 11,
          },
          padding: 10,
        },
        ticks: {
          color: 'rgba(234, 255, 255, 0.6)',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
          stepSize: 1,
          showLabelBackdrop: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
      point: {
        radius: 4,
      },
    },
  };

  return (
    <div className="radarPanel">
      <h3>能力雷達圖</h3>
      <div style={{ height: '220px', width: '100%' }}>
        <Radar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}


即時
