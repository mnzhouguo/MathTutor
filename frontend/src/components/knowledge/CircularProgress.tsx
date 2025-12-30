import './CircularProgress.css';

interface CircularProgressProps {
  progress: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  label,
  size = 'medium',
}) => {
  const radius = size === 'small' ? 30 : size === 'medium' ? 40 : 50;
  const strokeWidth = size === 'small' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`circular-progress circular-progress--${size}`}>
      <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
        <circle
          className="circular-progress__bg"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-progress__progress"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1A56DB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="circular-progress__label">
        {label || `${Math.round(progress)}%`}
      </div>
    </div>
  );
};

export default CircularProgress;
