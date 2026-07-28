import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

interface LineChartProps {
  labels: string[];
  data: number[];
  label: string;
  borderColor?: string;
  backgroundColor?: string;
}

export const ChartComponent: React.FC<LineChartProps> = ({
  labels,
  data,
  label,
  borderColor = '#22c55e',
  backgroundColor = 'rgba(34, 197, 94, 0.1)'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label,
        data,
        borderColor,
        backgroundColor,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: borderColor,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: {
            family: 'Outfit, sans-serif',
            weight: 500
          }
        }
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Outfit, sans-serif', size: 13 },
        bodyFont: { family: 'Outfit, sans-serif', size: 12 },
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#64748b' : '#64748b',
          font: { family: 'Outfit, sans-serif' }
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: isDark ? '#64748b' : '#64748b',
          font: { family: 'Outfit, sans-serif' }
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[220px]">
      <Line data={chartData} options={chartOptions as any} />
    </div>
  );
};

export default ChartComponent;
