function convertToArray(obj) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return months.map(month => {
  const temp = parseFloat(obj[month])
    return { month: month, temp }
  }) 
}

async function handleData() {
  const data = await d3.csv('weather-in-india.csv')
  console.log(data)
  const everyTenthYear = data.filter((_, index) => index % 10 === 0);

  const data1901 = data[0]
  const data1902 = data[1]
  const months1901 = convertToArray(data1901)
  const months1902 = convertToArray(data1902)

  const width = 600
  const height = 300
  const margin = 40

  // SCALES DEFINED HERE

  const xScale = d3.scaleLinear()
    .domain([0, months1901.length - 1])
    .range([margin, width - margin])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(months1901, d => d.temp))
    .range([height - margin, margin])

  const y2Scale = d3.scaleLinear()
    .domain(d3.extent(months1902, d => d.temp))
    .range([height - margin, margin])

  const monthsScale = d3.scaleTime()
    .domain([new Date('1901-01-01'), new Date('1901-12-01')])
    .range([margin, width - margin])
    .nice()

  // SETUP ELEMENTS

  // Select the SVG
  const svg = d3
  .select('#svg')

  // Make a group for the graph
  const graph = svg
  .append('g')

  // AXES

  // Define the axis generators
  const bottomAxis = d3.axisBottom(monthsScale)
  const leftAxis = d3.axisLeft(yScale)

  // Create the bottom axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin})`)
    .call(bottomAxis)
  // Create the left axis
  svg
    .append('g')
    .attr('transform', `translate(${margin}, 0)`)
    .call(leftAxis)

  // DRAWING THINGS HERE

  // PATH FOR AREA

  // line generator
  const linegen = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.temp))
    .curve(d3.curveBasis)

  // area generator
  const areagen = d3.area()
    .x((d, i) => xScale(i))
    .y0(d => yScale(d.temp))
    .y1(height - margin)
    .curve(d3.curveBasis)

  // Draw the graph
  graph
    .append('path')
    .attr('d', areagen(months1901))
    .attr('stroke-width', 1)
    .attr('stroke', 'cornflowerblue')
    .attr('fill', 'cornflowerblue')
    .attr('opacity', 0.4)
  
  graph
    .append('path')
    .attr('d', areagen(months1902))
    .attr('stroke-width', 1)
    .attr('stroke', 'tomato')
    .attr('fill', 'tomato')
    .attr('opacity', 0.4)
}

handleData()


