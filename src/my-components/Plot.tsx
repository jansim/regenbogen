import React from 'react';

const svgTemplates = {
  bar: `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="630.7" class="svglite" viewBox="0 0 570 473"><defs><style><![CDATA[
    .svglite line, .svglite polyline, .svglite polygon, .svglite path, .svglite rect, .svglite circle {
      fill: none;
      stroke: #000000;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-miterlimit: 10.00;
    }
    .svglite text {
      white-space: pre;
    }
  ]]></style></defs><rect width="100%" height="100%" style="stroke: none; fill: none;"/><defs><clipPath id="cpMC4wMHw1NzAuMDB8MC4wMHw0NzMuMDA="><path d="M0 0h570v473H0z"/></clipPath></defs><g clip-path="url(#cpMC4wMHw1NzAuMDB8MC4wMHw0NzMuMDA=)"><path d="M25.9 13.6h167.2v81.9H25.9z" style="stroke-width: 1.07; stroke: none; stroke-linecap: butt; stroke-linejoin: miter; fill: #0000F0;"/><path d="M25.9 104.6h234v81.9h-234z" style="stroke-width: 1.07; stroke: none; stroke-linecap: butt; stroke-linejoin: miter; fill: #00FF00;"/><path d="M25.9 195.6h518.2v81.9H25.9z" style="stroke-width: 1.07; stroke: none; stroke-linecap: butt; stroke-linejoin: miter; fill: #00F000;"/><path d="M25.9 286.5h250.7v81.9H25.9z" style="stroke-width: 1.07; stroke: none; stroke-linecap: butt; stroke-linejoin: miter; fill: #FF0000;"/><path d="M25.9 377.5h351v81.9h-351z" style="stroke-width: 1.07; stroke: none; stroke-linecap: butt; stroke-linejoin: miter; fill: #F00000;"/></g></svg>`
};

const Plot = ({
  colors = ['#0000F0', '#00FF00', '#00F000', '#FF0000', '#F00000'],
  type = 'bar'
}) => {
  if (!svgTemplates[type]) {
    console.warn(`Unsupported plot type: ${type}`);
    return null;
  }

  if (colors.length < 1) {
    console.warn('At least one color is required');
    return null
  }

  let effectiveColors = colors;
  while (effectiveColors.length < 5) {
    // Repeat colors if there are less than 5
    effectiveColors = colors.concat(colors.slice(0, 5 - colors.length));
  }

  const modifiedSvg = svgTemplates[type]
    .replace('#0000F0', effectiveColors[0])
    .replace('#00FF00', effectiveColors[1])
    .replace('#00F000', effectiveColors[2])
    .replace('#FF0000', effectiveColors[3])
    .replace('#F00000', effectiveColors[4]);

  return (
    <div className="svg-plot" dangerouslySetInnerHTML={{ __html: modifiedSvg }} />
  );
};

export default Plot;
