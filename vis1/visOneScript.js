async function handleData() {
  let data = await d3.csv('../ttc-streetcar-delay-data-2022.csv');
  console.log(data);

  // Question 1: Which 10 TTC Streetcar lines suffered the longest cumulative delays in 2022?
  
  // filter any null values for line or minDelay
  data = data.filter(row => row.line && row);
  console.log(data);

  const collectedData = data.reduce((obj, row) => {
    if (obj[row.line] === undefined) {
      console.log(`new entry for line ${row.line}`);
      obj[row.line] = {};
      obj[row.line]["numDelays"] = 1;
      obj[row.line]["totalDelayMins"] = parseInt(row.minDelay);
    } else {
      obj[row.line]["numDelays"] += 1;
      obj[row.line]["totalDelayMins"] += parseInt(row.minDelay);
    }
    return obj;
  }, {});

  console.log(collectedData);

  let dataArray = [];
  
  Object.keys(collectedData).forEach(entry => {
    console.log(entry)
    dataArray.push({
      "line": entry,
      "totalDelayMins": collectedData[entry].totalDelayMins,
      "numDelays": collectedData[entry].numDelays
    })
  });
  
  console.log(dataArray);
  
  // dataArray.sort((a,b) => (a.totalDelayMins > b.totalDelayMins) ? 1 : ((b.totalDelayMins > a.totalDelayMins) ? -1 : 0))
  dataArray.sort((a,b) => b.totalDelayMins - a.totalDelayMins);
  
  dataArray = dataArray.slice(0,10)
  console.log(dataArray);
  // Absolutely no surprise to anyone who tries to use the TTC that it's the 501 
  // because that thing doesn't actually exist

  // d3 stuff here:
  const margin = { top: 10, right: 125, bottom: 60, left: 100 };
  const width = 500
  const height = 500

  // SCALES

  // x scale
  const totalDelayMinsExtent = [0, d3.max(dataArray, d => parseInt(d.totalDelayMins))];

  const xScale = d3.scaleLinear()
    .range([0, width])
    .domain(totalDelayMinsExtent);
  
  // y scale
  
  const yScale = d3.scaleBand()
    .range([0, height])
    .domain(dataArray.map(d => d.line))
    .padding(0.1);
  
  // DRAWING STUFF

  const svg = d3.select("#svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  
  // X AXIS
  svg.append('g')
    .attr("transform", `translate(${margin.left}, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr("transform", "translate(-10, 0) rotate(-45)")
    .style("text-anchor", "end");

  // X AXIS LABEL
  svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('text-anchor', 'middle')
    .attr('font-family', 'helvetica')
    .attr('x', width / 2 + margin.left)
    .attr('y', height + margin.top + margin.bottom - 5)
    .text('Cumulative delays in 2022 (minutes)');
  
  // Y AXIS
  svg.append('g')
    .call(d3.axisLeft(yScale))
    .attr("transform", `translate(${margin.left}, 0)`)
  
  // Y AXIS LABEL
  svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('text-anchor', 'middle')
    .attr('font-family', 'helvetica')
    .attr('x', -(height / 2) - margin.top)
    .attr('y', margin.left / 2)
    .attr('transform', 'rotate(-90)')
    .text('TTC Streetcar Line #');

  // BARS
  const barGroup = svg.append('g')
    .attr("transform", `translate(${margin.left}, 0)`);
  
  barGroup
    .selectAll('rect')
    .data(dataArray)
    .enter()
    .append('rect')
    .attr('x', xScale(0))
    .attr('y', d => yScale(d.line))
    .attr('width', d => xScale(d.totalDelayMins))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'red')
    .attr('opacity', 0.8)
  
  barGroup
    .selectAll('.bar-label')
    .data(dataArray)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => xScale(d.totalDelayMins) + 10)
    .attr('y', d => yScale(d.line) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .text(d => `${d.totalDelayMins}, ${d.numDelays} delays`)
      .attr('font-size', '0.8rem')
      .attr('font-family', 'helvetica');
}

handleData()
