// visThreeScript.js
async function handleData() {
  let data = await d3.csv('../ttc-streetcar-delay-data-2022.csv');
  console.log(data);

  // Question 3: Can we see any seasonality in delay times for top incident types?

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

  const totalIncidents = data.length; // already filtered for what we want + non-null

  const dataByIncident = [];
  incidents.map(type => {
    dataByIncident[type] = data.filter(row => row.incident === type);
  });

  console.log("dataByIncident");
  console.log(dataByIncident);

  let month = "";

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

  // d3 stuff here:
  const margin = 100;
  const width = 800;
  const height = 600;

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
  const monthsScale = d3.scaleTime()
    .domain([new Date('2022-01-01'), new Date('2022-12-01')])
    .range([margin, width-margin]);

  // DRAWING STUFF
  const svg = d3
    .select('#svg')
    .attr('width', width + margin)
    .attr('height', height + margin);

  const graph = svg
    .append('g')

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
  // Create the left axis
  svg
    .append('g')
    .attr('transform', `translate(${margin}, 0)`)
    .call(leftAxis);

  // PATH FOR AREA

  // area generator
  const areagen = d3.area()
    .x((d, i) => xScale(i))
    .y0(d => height - margin)
    .y1(d => operationsYScale(d.value))
    .curve(d3.curveBasis);

  // Draw the graph

  graph
    .append('path')
    .attr('d', areagen(operationsData))
    .attr('stroke-width', 1)
    .attr('stroke', 'cornflowerblue')
    .attr('fill', 'cornflowerblue')
    .attr('opacity', 0.4);
};

handleData();
