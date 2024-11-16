const ArcColorPalette = () => {
  const colors = [
    "#2A363BFF", "#019875FF", "#99B898FF", "#FECEA8FF",
    "#FF847CFF", "#E84A5FFF", "#C0392BFF", "#96281BFF"
  ];

  // SVG dimensions
  const width = 50;
  const height = 25;
  const centerX = width / 2;
  const centerY = height;
  const arcWidth = 9;
  const radius = Math.min(width, height) - 5;

  // Calculate the angles for each color segment
  const anglePerSegment = Math.PI / colors.length;

  // Generate the arc paths
  const generateArcPath = (index) => {
    const startAngle = Math.PI - (index * anglePerSegment);
    const endAngle = startAngle - anglePerSegment;

    const innerRadius = radius - arcWidth;
    const outerRadius = radius;

    // Calculate points
    const startOuterX = centerX + outerRadius * Math.cos(startAngle);
    const startOuterY = centerY - outerRadius * Math.sin(startAngle);
    const endOuterX = centerX + outerRadius * Math.cos(endAngle);
    const endOuterY = centerY - outerRadius * Math.sin(endAngle);

    const startInnerX = centerX + innerRadius * Math.cos(startAngle);
    const startInnerY = centerY - innerRadius * Math.sin(startAngle);
    const endInnerX = centerX + innerRadius * Math.cos(endAngle);
    const endInnerY = centerY - innerRadius * Math.sin(endAngle);

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

  return (
    <svg width={width} height={height}>
      {colors.map((color, index) => (
        <g key={color}>
          <path
            d={generateArcPath(index)}
            fill={color}
          />
        </g>
      ))}
    </svg>
  );
};

export default ArcColorPalette;
