// visThreeScript.js
async function handleData() {
  let data = await d3.csv('../ttc-streetcar-delay-data-2022.csv');
  console.log(data);

  // Question 3: Can we see any seasonality in delay occurrences for top incident types?

  // filter values only for the 501 line and any null values for incident
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const incidents = [
    'Operations',
    'Mechanical',
    'Security',
    'Emergency Services',
    'Cleaning - Unsanitary',
    'Collision - TTC Involved'
  ];

  data = data.filter((row) => row.line === '501' && row.incident && row.date);
  console.log(data);

  
  // const totalIncidents = data.length; // already filtered for what we want + non-null

  const dataByIncident = [];
  incidents.map(type => {
    dataByIncident[type] = data.filter(row => row.incident === type);
  });

  console.log("dataByIncident");
  console.log(dataByIncident);

  // let month = "";

  // Split the data down into a monthly breakdown of each 
  
  const monthlyOccurrences = {};

  incidents.forEach((type) => {
    dataByIncident[type].forEach((row) => {
      const month = row.date.split("-")[1];

      if (!monthlyOccurrences[type]) {
        monthlyOccurrences[type] = {};
      }

      if (!monthlyOccurrences[type][month]) {
        monthlyOccurrences[type][month] = 1;
      } else {
        monthlyOccurrences[type][month] += 1;
      }
    });
  });

  console.log(monthlyOccurrences);

  data = incidents.map(type => {
    return Object.entries(monthlyOccurrences[type])
      .map(([month, value]) => ({ month, value: parseInt(value) }));
  });

  // d3 stuff here:
  const margin = 100;
  const width = 800;
  const height = 700;
  const legendWidth = 200;
  const legendHeight = incidents.length * 20;
  const legendX = width - legendWidth;
  const legendY = 1.5 * margin;

  // SCALES

  // colour scale
  const colourScale = d3.scaleSequential()
    .domain([0, incidents.length - 1])
    .interpolator(d3.interpolateRainbow);

  // x scale
  const xScale = d3.scaleLinear()
    .domain([0, months.length - 1])
    .range([margin, width - margin]);
  
  console.log("monthylthing");
  console.log(monthlyOccurrences[incidents[0]]);

  // y scale
  const operationsData = Object.entries(monthlyOccurrences[incidents[0]])
    .map(([month, value]) => ({ month, value: parseInt(value) }));
  console.log("operationsData")
  console.log(operationsData)

  let operationsYScale = d3.scaleLinear()
    .domain([0, d3.max(operationsData, d => d.value)])
    .range([height - margin, margin]);

  // monthsScale
  // const monthsScale = d3.scaleTime()
  //   .domain([new Date('2022-01-01'), new Date('2022-12-01')])
  //   .range([margin, width-margin]);

  // DRAWING STUFF
  const svg = d3
    .select('#svg')
    .attr('width', width + margin)
    .attr('height', height + margin);

  const graph = svg
    .append('g')
    .attr('class', 'incident-area')

  // AXES
  // Define the axis generators
  const bottomAxis = d3.axisBottom(xScale)
    .ticks(months.length)
    .tickFormat(d => months[d]);

  const leftAxis = d3.axisLeft(operationsYScale);

  // Create the bottom axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin})`)
    .call(bottomAxis);

  // x axis label
  svg
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height - margin / 2)
    .text('Month (2022)');

  // Create the left axis
  svg
    .append('g')
    .attr('transform', `translate(${margin}, 0)`)
    .call(leftAxis);

  // y axis label
  svg
    .append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'translate(-20, 0) rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', margin - 20)
    .text('# of occurrences')

  // Chart title

  svg
    .append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', margin / 2)
    .attr('text-anchor', 'middle')
    .text('2022 Delay Event Seasonality on TTC Streetcar Line # 501');

  // PATH FOR AREA

  // area generator
  const areaGen = d3.area()
    .x((d, i) => xScale(i))
    .y0(d => height - margin)
    .y1(d => operationsYScale(d.value))
    .curve(d3.curveBasis);

  // LEGEND
  const legendSvg = svg
    .append('svg')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('x', legendX)
    .attr('y', legendY);

  const legendGroups = legendSvg
    .selectAll('.legend-group')
    .data(incidents)
    .enter()
    .append('g')
    .attr('class', 'legend-group')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  // Draw the graph

  graph.selectAll('.incident-area')
    .data(data)
    .enter()
    .append('path')
    .attr('class', 'area')
    .attr('d', d => areaGen(d))
    .attr('stroke-width', 1)
    .attr('stroke', (d, i) => colourScale(i))
    .attr('fill', (d, i) => colourScale(i))
    .attr('opacity', 0.4);

  legendGroups
    .append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', (d, i) => colourScale(i));

  legendGroups
    .append('text')
    .attr('x', 20)
    .attr('y', 12)
    .attr('font-family', 'helvetica')
    .text(d => d);
};

handleData();
