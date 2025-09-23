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

  const data = {
    labels: Object.keys(skills).map(key => skillNames[key] || skills[key].name?.zh || key),
    datasets: [
      {
        label: '技能等級',
        data: Object.values(skills).map(skill => skill.lvl || 1),
        backgroundColor: 'rgba(98, 200, 255, 0.2)',
        borderColor: 'rgba(98, 200, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(98, 200, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(98, 200, 255, 1)',
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
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(98, 200, 255, 0.3)',
        },
        grid: {
          color: 'rgba(98, 200, 255, 0.3)',
        },
        pointLabels: {
          color: '#eaffff',
          font: {
            family: 'Orbitron, Share Tech Mono, monospace',
            size: 11,
          },
        },
        ticks: {
          color: 'rgba(234, 255, 255, 0.6)',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
          stepSize: 1,
          min: 0,
          max: 10,
        },
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
