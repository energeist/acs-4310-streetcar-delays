// visTwoScript.js
async function handleData() {
  let data = await d3.csv('../ttc-streetcar-delay-data-2022.csv');
  console.log(data);

  // Question 2: What is the distribution of the reasons for delays on the 501 line?

  // filter values only for the 501 line and any null values for incident
  data = data.filter((row) => row.line === '501' && row.incident);
  console.log(data);

  const totalIncidents = data.length // already filtered for what we want + non-null

  const collectedData = data.reduce((obj, row) => {
    if (obj[row.incident] === undefined) {
      console.log(`new entry for ${row.incident}`);
      obj[row.incident] = 1;
    } else {
      obj[row.incident] += 1;
    }
    return obj;
  }, {});

  console.log(collectedData);

  let dataArray = [];

  Object.keys(collectedData).forEach((entry) => {
    console.log(entry);
    dataArray.push({ incident: entry, occurrences: collectedData[entry] });
  });

  dataArray.sort((a, b) => b.occurrences - a.occurrences);

  // combine all the smaller sources of delays

  let sum = 0
  dataArray.forEach((item, index) => {
    if (index > 9) { 
      sum += item.occurrences
    }
  })

  dataArray = dataArray.slice(0,10)
  dataArray.push({incident: "Other Source", occurrences: sum})

  console.log(dataArray);

  // d3 stuff here:
  const margin = 100;
  const width = 1100;
  const height = 800;
  const radius = Math.min(width, height) / 2 - margin;

  // SCALES

  // colour scale
  const colourScale = d3.scaleSequential().domain([0, dataArray.length]).interpolator(d3.interpolateRainbow);

  // PIE STUFF

  // Compute position of each group on pie
  const pie = d3.pie().value((d) => d.occurrences).startAngle(-Math.PI / 6);

  const pieData = pie(dataArray);

  // ARC GENERATOR
  const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.8);

  // Secondary arc for label positioning
  const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

  // DRAWING STUFF

  const svg = d3
    .select('#svg')
    .attr('width', width + margin)
    .attr('height', height + margin)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  // Drawing the donut chart
  svg
    .selectAll('allSlices')
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d) => colourScale(d.index))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 0.7);

  // Drawing the polylines for labelling
  svg
    .selectAll('allPolylines')
    .data(pieData)
    .enter()
    .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', d => {
        const posA = arc.centroid(d); // line insertion in the slice
        const posB = outerArc.centroid(d); 
        const posC = outerArc.centroid(d); 
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // Angle position to determine if label goes to left or right
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })

  // Label text
  svg
    .selectAll('allLabels')
    .data(pieData)
    .enter()
    .append('text')
      .text(d => `${d.data.incident} - ${(d.data.occurrences / totalIncidents * 100).toFixed(2)}%`)
      .attr('font-family', 'helvetica')
      .attr('transform', d => {
          const pos = outerArc.centroid(d);
          const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
      })
      .style('text-anchor', function(d) {
          const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return (midangle < Math.PI ? 'start' : 'end');
      })

  // Title text
  svg
    .append('text')
    .attr('class', 'chart-title')
    .attr('text-anchor', 'middle')
    .text('Delay sources on TTC streetcar line #501')
      .attr('font-family', 'helvetica')
}

handleData()
