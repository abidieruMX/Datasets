let formatValue = d3.format(",.0f");

let margin = {top: 35, right: 35, bottom: 35, left: 35},
    width = 550 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let durations = 0;

let afterLoad = () => durations = 750;

// ===== Monthly bars init values =====

let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);
  
let xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y)

let g = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");
  
g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")");
g.append("g")
    .attr("class", "axis axis--y");

// ===== Total bar init values =====

let totalG = d3.select("#chart").append("svg")
    .attr("width", (width/4) + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

let xTotal = d3.scaleBand().rangeRound([0, (width/4)]).padding(0.1),
    yTotal = d3.scaleLinear().rangeRound([height, 0]);

let xAxisTotal = d3.axisBottom(xTotal),
    yAxisTotal = d3.axisLeft(yTotal);

totalG.append("g")
    .attr("class", "axis axis--xTotal")
    .attr("transform", "translate(0," + height + ")");
totalG.append("g")
    .attr("class", "axis axis--yTotal");

d3.queue()
    .defer(d3.csv, "/csv/Vehiculos.csv", d => d)
    .await(ready);

function ready(error, data) {

  if (error) throw error;
  
  var INT;

  // Event handlers
  d3.select("#category").on('change', update);

  update();

  function update() {
    
    INT = d3.select('#category').property('value');

    var totalSum = d3.sum(data, d => d["Category"  + INT])

    // ========= Monthly bars =========
  
    y.domain([0, d3.max(data, d => d["Category" + INT]) ]).nice();

    x.domain(data.map( d => d.month ));
    
    g.selectAll(".axis.axis--y").transition()
      .duration(durations)
      .call(yAxis);

    g.selectAll(".axis.axis--x").transition()
      .duration(durations)
      .call(xAxis);
      
    let bars = g.selectAll(".barEnter")
      .data(data, d => d.month);
      
    bars = bars
      .enter()
    .append("rect")
      .attr("class", "barEnter")
      .attr("fill","steelblue")
      .attr("x", d => x(d.month))
      .attr("width", x.bandwidth())
      .merge(bars);
    
    bars.transition()
      .duration(durations)
      .attr("y", d => y(d["Category" + INT]))
      .attr("height", d => height - y(d["Category" + INT]))
    
    bars.exit().remove();

    // ========= Total bar =========

    yTotal.domain([0, totalSum]).nice();

    xTotal.domain(["Total"]);
    
    totalG.selectAll(".axis.axis--yTotal").transition()
      .duration(durations)
      .call(yAxisTotal);

    totalG.selectAll(".axis.axis--xTotal").transition()
      .duration(durations)
      .call(xAxisTotal);

    let totalBar = totalG.selectAll(".totalBar")
      .data(["empty"]); 

    totalBar = totalBar
      .enter()
    .append("rect")
      .attr("class", "totalBar")
      .attr("fill","#ccc")
      .attr("x", xTotal(["Total"]) )
      .attr("width", xTotal.bandwidth())
      .merge(totalBar)

    totalBar.transition()
      .duration(durations)
      .attr("y", yTotal(totalSum))
      .attr("height", height - yTotal(totalSum))

  } // End of update

  afterLoad()

} // End of ready