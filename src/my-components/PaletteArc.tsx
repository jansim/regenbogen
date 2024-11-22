import React, { useState, useEffect } from "react";

const PaletteArc = ({ width = 50, arcWidth = 10 }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [cycleComplete, setCycleComplete] = useState(false);

  const colors = [
    "#2A363BFF",
    "#019875FF",
    "#99B898FF",
    "#FECEA8FF",
    "#FF847CFF",
    "#E84A5FFF",
    "#C0392BFF",
    "#96281BFF",
  ];

  // SVG dimensions
  const height = width / 2;
  const centerX = width / 2;
  const centerY = height;
  const radius = Math.min(width, height) - 5;

  // Animation offset for hover effect
  const hoverOffset = 5;

  useEffect(() => {
    let intervalId;
    if (isHovering && !cycleComplete) {
      let currentIndex = 0;

      // Start the wave animation
      intervalId = setInterval(() => {
        if (currentIndex <= colors.length) {
          setActiveIndex(currentIndex === colors.length ? null : currentIndex);
          currentIndex++;
          if (currentIndex > colors.length) {
            clearInterval(intervalId);
            setCycleComplete(true);
          }
        }
      }, 150); // Adjust timing between each segment animation
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovering, cycleComplete, colors.length]);

  // Calculate the angles for each color segment
  const anglePerSegment = Math.PI / colors.length;

  // Generate the arc paths
  const generateArcPath = (index, isActive = false) => {
    const startAngle = Math.PI - index * anglePerSegment;
    const endAngle = startAngle - anglePerSegment;

    // Calculate the hover offset direction
    const midAngle = (startAngle + endAngle) / 2;
    const offsetX = isActive ? hoverOffset * Math.cos(midAngle) : 0;
    const offsetY = isActive ? -hoverOffset * Math.sin(midAngle) : 0;

    const innerRadius = radius - arcWidth;
    const outerRadius = radius;

    // Calculate points with hover offset
    const startOuterX = centerX + offsetX + outerRadius * Math.cos(startAngle);
    const startOuterY = centerY + offsetY - outerRadius * Math.sin(startAngle);
    const endOuterX = centerX + offsetX + outerRadius * Math.cos(endAngle);
    const endOuterY = centerY + offsetY - outerRadius * Math.sin(endAngle);

    const startInnerX = centerX + offsetX + innerRadius * Math.cos(startAngle);
    const startInnerY = centerY + offsetY - innerRadius * Math.sin(startAngle);
    const endInnerX = centerX + offsetX + innerRadius * Math.cos(endAngle);
    const endInnerY = centerY + offsetY - innerRadius * Math.sin(endAngle);

    // Create the arc path
    const largeArcFlag = 0;
    const sweepFlag = 1;

    return `
      M ${startOuterX} ${startOuterY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endOuterX} ${endOuterY}
      L ${endInnerX} ${endInnerY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
      Z
    `;
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setCycleComplete(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveIndex(null);
    setCycleComplete(false);
  };

  return (
    <svg
      width={width}
      height={height}
      className="select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {colors.map((color, index) => (
        <g
          key={color}
          style={{
            transition: "transform 0.2s ease-out",
            filter:
              activeIndex === index
                ? "drop-shadow(0 0 3px rgba(0,0,0,0.3))"
                : "none",
          }}
        >
          <path
            d={generateArcPath(index, activeIndex === index)}
            fill={color}
            style={{
              transition: "all 0.2s ease-out",
            }}
          />
        </g>
      ))}
    </svg>
  );
};

export default PaletteArc;
