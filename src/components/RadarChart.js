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

  // 確保有預設值，避免數據問題
  const defaultSkills = {
    number_sense: { name: { zh: '數感力' }, lvl: 1 },
    calculation: { name: { zh: '運算力' }, lvl: 1 },
    geometry: { name: { zh: '幾何力' }, lvl: 1 },
    reasoning: { name: { zh: '推理力' }, lvl: 1 },
    chart_reading: { name: { zh: '圖解力' }, lvl: 1 },
    application: { name: { zh: '應用力' }, lvl: 1 }
  };

  // 合併技能數據，確保所有技能都存在
  const mergedSkills = { ...defaultSkills, ...skills };

  // 固定順序和標籤
  const skillOrder = ['number_sense', 'calculation', 'geometry', 'reasoning', 'chart_reading', 'application'];
  const labels = [
    '數感力',
    '運算力', 
    '幾何力',
    '推理力',
    '圖解力',
    '應用力'
  ];

  // 提取技能等級數據
  const skillLevels = skillOrder.map(key => {
    const skill = mergedSkills[key];
    return skill && skill.lvl ? skill.lvl : 1;
  });

  console.log('Radar Chart Data:', { labels, skillLevels }); // 調試用

  const data = {
    labels: labels,
    datasets: [
      {
        label: '技能等級',
        data: skillLevels,
        backgroundColor: 'rgba(98, 200, 255, 0.2)',
        borderColor: 'rgba(98, 200, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'transparent',
        pointBorderColor: 'transparent',
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverBackgroundColor: 'transparent',
        pointHoverBorderColor: 'transparent',
        pointHoverRadius: 0,
        fill: true,
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
            return `${context.label}: Lv.${context.parsed.r}`;
          }
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
          color: 'rgba(234, 255, 255, 0.6)',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
          showLabelBackdrop: false,
        },
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
          padding: 15,
        },
      },
    },
    elements: {
      line: {
        tension: 0,
      },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <div className="radarPanel">
      <h3>能力雷達圖</h3>
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        <Radar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}
