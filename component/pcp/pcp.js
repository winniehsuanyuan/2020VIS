/*for 309551091.html*/

const pcp_width = 1000;
const pcp_height = 300;
const pcp_margin = { top: 30, right: 20, bottom: 10, left: 0 };//left150
const innerWidth = pcp_width - pcp_margin.left - pcp_margin.right;
const innerHeight = pcp_height - pcp_margin.top - pcp_margin.bottom; 
const className = ['c1','c2','c3','c4','c5', 'c6','c7','c8']; //for hover
const city = ['新北市','臺中市','臺南市','高雄市','桃園市','新竹縣','苗栗縣','南投縣','彰化縣','雲林縣','嘉義市','屏東縣','宜蘭縣','花蓮縣','臺東縣'];

$(document).ready(function() {
    plot_pcp('香蕉', '2017', '氣壓');
});

function plot_pcp(crop, year, weather){
  // clear the previous plot
  $("#pcp-div").empty();
  $("#img-div").empty();


  const dimensions = ['平均價']; 
  city.forEach(c=>{
    dimensions.push(c+'_'+weather);
  });
  const svg = d3.select('#pcp-div').append('svg')
  .attr('width', pcp_width)
  .attr('height', pcp_height);
  const g = svg.append('g')
       .attr('transform', `translate(${pcp_margin.left},${pcp_margin.top})`);
  //read pcp_data
  d3.csv('data/weather/'+crop+'/'+year+'/_'+weather+'.csv')
    .then(pcp_data => {
      const min_max = d3.extent(pcp_data, d => +d['平均價']);
      const k = Math.floor((min_max[1] - min_max[0])/8);
      const priceClass = (d) => {
        if (d<(min_max[0]+k)) return className[0];
        else if (d<=(min_max[0]+2*k)) return className[1];
        else if (d<=(min_max[0]+3*k)) return className[2];
        else if (d<=(min_max[0]+4*k)) return className[3];
        else if (d<=(min_max[0]+5*k)) return className[4];
        else if (d<=(min_max[0]+6*k)) return className[5];
        else if (d<=(min_max[0]+7*k)) return className[6];
        else return className[7];
      };

      const highlight = function(d){
        let selected_class = priceClass(+d['平均價']);
        d3.selectAll('.line')
          .transition().duration(200)
          .style('stroke', 'rgba(0,0,0,0)');
        d3.selectAll('.line.' + selected_class)
          .transition().duration(200)
          .style('stroke', d => d['color']);
        drawNodes(selected_class);
      }
      const noHover = function(d){
        d3.selectAll('.line')
          .transition().duration(200).delay(500)
          .style('stroke', d => d['color']);
        drawNodes(false);
      }

      //y: one scale linear for each dimension
      var yAxis = {}
      for (let i in dimensions) {
        let yName = dimensions[i]; 
        yAxis[yName] = d3.scaleLinear()
                       .domain( d3.extent(pcp_data, d => +d[yName]) )
                       .range([innerHeight, 0])
                       .nice();
      }

      //x: scale point find the best x coor for each Y axis
      var xAxis = d3.scalePoint()
              .domain(dimensions)
              .range([0, innerWidth])
              .padding(0.5)            //left/right padding
              .round('true');

      //if an axis is being dragged, its x coor = mouse x coor, else x = xAxis
      var dragging = {}
      const xCoor = function(d) {
          let x = dragging[d];
          return x == null ? xAxis(d) : x;
      }

      //draw lines
      var lineCoor = d => d3.line()(dimensions.map( p => [ xCoor(p), yAxis[p](d[p]) ] ));  //take a row of the csv as input, and return [x, y]
      var lines = g.selectAll('path').data(pcp_data)
      .enter().append('path')
        .attr('class', d => 'line ' + priceClass(+d['平均價']))
        .attr('d',  lineCoor)
        .style('stroke', d => d['color'])
        .on('mouseover', highlight)
        .on('mouseleave', noHover);

      //draw axes
      var AxisG = g.selectAll('axis').data(dimensions)
      .enter().append('g')                                    //add a group for each dimension
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xAxis(d)},0)`)     //translate the axes to the right x coor
      .each(function(d){d3.select(this).call(d3.axisLeft(yAxis[d]).tickPadding(10));})
      .call(d3.drag()  //reorder coors
            .on('start', function(d) {
              dragging[d] = xAxis(d);
            })
            .on('drag', function(d) {
              //must be inside the graph
              dragging[d] = Math.min(innerWidth, Math.max(0, d3.event.x));
              //calculate new x coors by sorting the dimension list and pass to xAxis
              dimensions.sort(function(a, b) { return xCoor(a) - xCoor(b); });
              xAxis.domain(dimensions);
              AxisG.attr('transform', p => `translate(${xCoor(p)}, 0)`);
              //lines should stick with the axes
              lines.attr('d',  lineCoor);
            })
            .on('end', function(d) {
              //translate the dragged axis to the right x coor
              delete dragging[d];
              d3.select(this).transition().duration(500) //duration make the translate smoother
              .attr('transform', `translate(${xAxis(d)},0)`);
              //lines should stick with the axes and also translate smoothly
              lines.transition().duration(500).attr('d',  lineCoor); 
            }))    

      AxisG.append('text') //axis label
        .attr('y', -10)
        //.attr('transform', function(d){return 'rotate(-45)'})
        .style('text-anchor', 'middle')
        .text(d => d.replace('_'+weather, ''));

    
///////////////////////////////////////////////////////////////////////////////////////
    const img_margin = { top: 0, right: 0, bottom: 0, left: 30 };
    const img = d3.select('#img-div').append('img').attr('id', 'colorImg')
      .attr('src', 'component/pcp/color.png');
    const img_width = parseInt(img.style('width'));
    const img_height = parseInt(img.style('height'));
    const canvas = d3.select('#img-div').append('canvas').attr('id', 'imgCanvas')
      .attr('width', String(img_width)) //256px x 256px
      .attr('height', String(img_height));
    const customBase = document.createElement('custom');
    const custom = d3.select(customBase);
    //bind data
    var join = custom.selectAll('custom.circle').data(pcp_data)
      .enter().append('custom')
      .attr('class', d => 'circle ' + priceClass(+d['平均價']))
      .attr('x', d => d['y'])
      .attr('y', d => d['x']);

    function drawNodes(selected_class){
      var c = canvas.node().getContext('2d');
      c.clearRect(0, 0, img_width, img_height);
      var elements = custom.selectAll('.circle');
      if(selected_class){
        elements.each(function(d){
          var node = d3.select(this);
          c.fillStyle='rgba(100,100,100,0.2)';
          c.strokeStyle = 'rgba(0,0,0,0.2)';
          c.beginPath();
          c.arc(node.attr('x'), node.attr('y'), 3, 0, 2*Math.PI, false);
          c.stroke();
          c.fill();
        });
        var selected = custom.selectAll('.'+selected_class)
        selected.each(function(d){
          var node = d3.select(this);
          c.fillStyle='rgba(255,255,255,0.8)';
          c.strokeStyle = 'rgba(0,0,0,0.8)';
          c.beginPath();
          c.arc(node.attr('x'), node.attr('y'), 3, 0, 2*Math.PI, false);
          c.stroke();
          c.fill();
        });
      }else{
        elements.each(function(d){
          var node = d3.select(this);
          c.fillStyle='rgba(255,255,255,0.8)';
          c.strokeStyle = 'rgba(0,0,0,0.8)';
          c.beginPath();
          c.arc(node.attr('x'), node.attr('y'), 3, 0, 2*Math.PI, false);
          c.stroke();
          c.fill();
        });
      }
    }
    drawNodes(false);

  });
}



