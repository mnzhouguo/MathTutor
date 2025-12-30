import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva';
import './HeroCanvas.css';

/**
 * HeroCanvas - 动态数学可视化画布
 * 展示数学函数曲线、坐标系统，体现"数学实验室"氛围
 */
const HeroCanvas = () => {
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [time, setTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 响应式调整画布大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(400, width * 0.6);
        setStageSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 动画循环
  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setTime((t) => t + 0.02);
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // 生成正弦波曲线点
  const generateSineWave = (offset: number) => {
    const points = [];
    for (let x = 0; x <= stageSize.width; x += 2) {
      const y = stageSize.height / 2 + Math.sin((x + offset) * 0.02) * 80;
      points.push(x, y);
    }
    return points;
  };

  // 生成余弦波曲线点
  const generateCosineWave = (offset: number) => {
    const points = [];
    for (let x = 0; x <= stageSize.width; x += 2) {
      const y = stageSize.height / 2 + Math.cos((x + offset) * 0.015) * 60;
      points.push(x, y);
    }
    return points;
  };

  // 生成坐标网格线
  const generateGridLines = () => {
    const lines = [];
    // 垂直线
    for (let x = 0; x <= stageSize.width; x += 50) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, stageSize.height]}
          stroke="#E5E5E5"
          strokeWidth={1}
          dash={[4, 4]}
        />
      );
    }
    // 水平线
    for (let y = 0; y <= stageSize.height; y += 50) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, stageSize.width, y]}
          stroke="#E5E5E5"
          strokeWidth={1}
          dash={[4, 4]}
        />
      );
    }
    return lines;
  };

  const wave1Offset = time * 50;
  const wave2Offset = time * 30 + 100;

  return (
    <div ref={containerRef} className="hero-canvas-container">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {/* 坐标网格 */}
          {generateGridLines()}

          {/* 坐标轴 */}
          <Line
            points={[0, stageSize.height / 2, stageSize.width, stageSize.height / 2]}
            stroke="#A3A3A3"
            strokeWidth={2}
          />
          <Line
            points={[stageSize.width / 2, 0, stageSize.width / 2, stageSize.height]}
            stroke="#A3A3A3"
            strokeWidth={2}
          />

          {/* 数学函数曲线 1 - 正弦波 */}
          <Line
            points={generateSineWave(wave1Offset)}
            stroke="#1A56DB"
            strokeWidth={3}
            lineCap="round"
            lineJoin="round"
            opacity={0.8}
          />

          {/* 数学函数曲线 2 - 余弦波 */}
          <Line
            points={generateCosineWave(wave2Offset)}
            stroke="#10B981"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
            opacity={0.6}
          />

          {/* 交点标记 */}
          <Circle
            x={stageSize.width / 2}
            y={stageSize.height / 2}
            radius={6}
            fill="#1A56DB"
            shadowColor="#1A56DB"
            shadowBlur={15}
            shadowOpacity={0.4}
          />

          {/* 动态移动的点 */}
          <Circle
            x={stageSize.width / 2 + Math.sin(wave1Offset * 0.02) * 100}
            y={stageSize.height / 2 + Math.sin((stageSize.width / 2 + wave1Offset * 0.02) * 0.02) * 80}
            radius={8}
            fill="#F59E0B"
            shadowColor="#F59E0B"
            shadowBlur={20}
            shadowOpacity={0.6}
          />

          {/* 坐标标签 */}
          <Text
            x={stageSize.width - 40}
            y={stageSize.height / 2 + 10}
            text="x"
            fontSize={18}
            fontFamily="Inter"
            fontStyle="italic"
            fill="#737373"
          />
          <Text
            x={stageSize.width / 2 + 10}
            y={15}
            text="y"
            fontSize={18}
            fontFamily="Inter"
            fontStyle="italic"
            fill="#737373"
          />

          {/* 原点 */}
          <Text
            x={stageSize.width / 2 + 10}
            y={stageSize.height / 2 + 5}
            text="O"
            fontSize={14}
            fontFamily="Inter"
            fill="#737373"
          />

          {/* 函数公式显示 */}
          <Group x={20} y={20}>
            <Text
              text="y = sin(x)"
              fontSize={16}
              fontFamily="Times New Roman"
              fontStyle="italic"
              fill="#1A56DB"
              opacity={0.8}
            />
            <Text
              text="y = cos(x)"
              fontSize={16}
              fontFamily="Times New Roman"
              fontStyle="italic"
              y={25}
              fill="#10B981"
              opacity={0.6}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default HeroCanvas;
