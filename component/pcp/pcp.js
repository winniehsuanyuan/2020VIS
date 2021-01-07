/*for 309551091.html*/
(function (d3) {
  'use strict';
  const pcp_width = 960;
  const pcp_height = 350;
  const svg = d3.select('#pcp-div').append('svg')
    .attr('width', pcp_width)
    .attr('height', pcp_height);
  const margin = { top: 30, right: 50, bottom: 30, left: 0 };//left150
  const innerWidth = pcp_width - margin.left - margin.right;
  const innerHeight = pcp_height - margin.top - margin.bottom; 
  const color = ['rgba(255, 0, 0, 0.3)', 'rgba(255, 128, 0, 0.2)', 'rgba(255, 255, 0, 0.2)', 'rgba(0, 255, 0, 0.2)', 'rgba(34, 139, 34, 0.2)', 'rgba(135, 206, 235, 0.2)', 'rgba(0, 0, 255, 0.2)', 'rgba(139, 0, 255, 0.2)'];
  const price = ['<18','18-20', '21-23', '24-26', '27-29', '30-32','33-35','>35'];
  const className = ['c1','c2','c3','c4','c5', 'c6','c7','c8']; //for hover
  //const dimensions = ['平均價','交易量','強度','警報發布報數','C0A530_StnPres','C0A530_Temperature','C0A530_WS','C0A530_WSGust','C0A530_Precp','467490_StnPres','467490_Temperature','467490_WS','467490_WSGust','467490_Precp','467420_StnPres','467420_Temperature','467420_WS','467420_WSGust','467420_Precp','467440_StnPres','467440_Temperature','467440_WS','467440_WSGust','467440_Precp','C0C590_StnPres','C0C590_Temperature','C0C590_WS','C0C590_WSGust','C0C590_Precp','C0D560_StnPres','C0D560_Temperature','C0D560_WS','C0D560_WSGust','C0D560_Precp','C0E750_StnPres','C0E750_Temperature','C0E750_WS','C0E750_WSGust','C0E750_Precp','C0H950_StnPres','C0H950_Temperature','C0H950_WS','C0H950_WSGust','C0H950_Precp','C0G660_StnPres','C0G660_Temperature','C0G660_WS','C0G660_WSGust','C0G660_Precp','C0K240_StnPres','C0K240_Temperature','C0K240_WS','C0K240_WSGust','C0K240_Precp','467480_StnPres','467480_Temperature','467480_WS','467480_WSGust','467480_Precp','467590_StnPres','467590_Temperature','467590_WS','467590_WSGust','467590_Precp','467080_StnPres','467080_Temperature','467080_WS','467080_WSGust','467080_Precp','C0Z061_StnPres','C0Z061_Temperature','C0Z061_WS','C0Z061_WSGust','C0Z061_Precp','467660_StnPres','467660_Temperature','467660_WS','467660_WSGust','467660_Precp'];
  const city = ['新北市','臺中市','臺南市','高雄市','桃園市','新竹縣','苗栗縣','南投縣','彰化縣','雲林縣','嘉義市','屏東縣','宜蘭縣','花蓮縣','臺東縣'];
  const weather = ['_氣壓','_氣溫','_風速', '_最大陣風','_降水量'];
  const dimensions = ['平均價']; 
  city.forEach(c=>{
    dimensions.push(c+weather[0]);
  });
  const g = svg.append('g')
       .attr('transform', `translate(${margin.left},${margin.top})`);
  
  //read pcp_data
  d3.csv('data/weather/香蕉/2017/_氣壓.csv')
    .then(pcp_data => {
      //delete rows with missing value
      /*
      pcp_data = pcp_data.filter(function(d){
        if(d['class']==undefined) 
          return false;
        else
          return true;})
      */
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

      //highlight the class that is hovered
      const highlight = function(d){
        let selected_class = priceClass(+d['平均價']);
        // 1. every class turns grey
        d3.selectAll('.line')
          .transition().duration(200)
        //.style('stroke', lineColor(''));
          .style('stroke', 'rgba(230,230,230,0.1)');
        // 2. the hovered class takes its color
        d3.selectAll('.' + selected_class)
          .transition().duration(200)
          .style('stroke', d => d['color']);//lineColor(d['平均價']));
        //  .style('stroke', 'rgba(0,0,255,0.25)');
      }

      //none of the classes are hovered
      const noHover = function(d){
        d3.selectAll('.line')
          .transition().duration(200).delay(500)
          .style('stroke', d => d['color']);//lineColor(d['平均價']));
          //.style('stroke', 'rgba(0,0,255,0.25)'); 
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
        .style('stroke', d => d['color'])//lineColor(d['平均價']))
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
        .text(d => d.replace(weather[0], ''));

    });

}(d3));

