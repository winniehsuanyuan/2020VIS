const svg = d3.select('#stackArea');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = { top: 10, right: 80, bottom: 30, left: 80 }; //left150
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const newColors = ['rgba(199, 67, 70,1)','rgba(231, 111, 81,1)','rgba(244, 162, 97,1)','rgba(233, 196, 106,1)', 'rgba(138, 177, 125,1)', 'rgba(42, 157, 143,1)','rgba(38, 70, 83,1)','rgba(67, 69, 89,1)','rgba(96, 67, 95,1)','rgba(150, 109, 139,1)'];
const colors = ['rgba(228,27,19,1)', 'rgba(241,134,14,1)', 'rgba(253,200,0,1)', 'rgba(152,198,70,1)', 'rgba(27,165,72,1)', 'rgba(0,156,166,1)', 'rgba(0,163,226,1)', 'rgba(0,87,184,1)', 'rgba(104,91,199,1)', 'rgba(180,0,158,1)', 'rgba(184,161,207,1)', 'rgba(230, 138, 184,1)', 'rgba(255, 192, 203,1)'];
var start_time = new Date(2012, 0, 1);
var end_time = new Date(2019, 11, 31);

function plot_stack(crop, start, end, norm) {
    // clear the previous plot
    $("#stackArea").empty();

    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    var n;
    if(norm) n = 'norm/';
    else n = 'unnorm/';
    // Parse the Data
    d3.csv('data/stackArea/dropped_'+ n + crop + '.csv').then(data => {
        data.forEach(d => {
            d.DateTime = d3.timeParse("%Y-%m-%d")(d.DateTime);
        });

        data = data.filter(function(d) {
            if ((d.DateTime >= start) && (d.DateTime <= end))
                return true;
            else
                return false;
        })
        //get col names without datetime
        var markets = d3.keys(data[0]).filter(function(d){ 
            if (d=='DateTime') return false;
            let min_max = d3.extent(data, r => r[d]);
            if(min_max[0]==min_max[1]) return false;
            else return true;
        });
        //stack the data
        var stackedData = d3.stack()
            .keys(markets)(data);

        // Add X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.DateTime; }))
            .range([0, innerWidth]);
        g.append('g')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(d3.axisBottom(x).ticks(5));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(stackedData[markets.length - 1], d => d[1])])
            .range([innerHeight, 0]);
        if(!norm) y.nice();

        g.append('g')
            .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal()
            .domain(markets)
            .range(newColors);

        const hoverArea = function(h) {
            d3.selectAll('.layers','.legendCircle')
            .style('fill', d => color(d.key).replace('1)', '0.1'))
            .attr('stroke', 'rgba(0,0,0,0.1)');
            d3.selectAll('.legendText')
            .style('opacity', 0.3);
            d3.selectAll('.layers.'+h.key, '.legendCircle.'+h.key)
            .style('fill', color(h.key))
            .attr('stroke', 'rgba(0,0,0,1)')
            d3.selectAll('.legendText.'+h.key)
            .style('opacity', 0.85);
        }
        const noHoverArea = function(h) {
            d3.selectAll('.layers','.legendCircle')
            .style('fill', d => color(d.key))
            .attr('stroke', 'rgba(0,0,0,1)');
            d3.selectAll('.legendText')
            .style('opacity', 0.85);
        }
        // Show the areas
        g.selectAll('.layers')
            .data(stackedData).enter()
            .append('path')
            .attr('class', d => 'layers '+ d.key)
            .style('fill', d => color(d.key))
            .attr('stroke', 'rgba(0,0,0,1)')
            .attr('stroke-width', 0.05)
            .attr('d', d3.area()
                .x(function(d, i) { return x(d.data.DateTime); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            ).on('mouseover', hoverArea)
            .on('mouseleave', noHoverArea);

        var pos = d3.scaleBand()
            .domain(markets)
            .range([innerHeight, 0]);
        //legend
        const legend = g.append('g')
            .attr('transform', `translate(${innerWidth+30}, 20)`);
        const l = legend.selectAll('.legend')
            .data(stackedData).enter();
        l.append('circle')
            .attr('class', d => 'legendCircle '+ d.key)
            .attr('cx', 0)
            .attr('cy', d => pos(d.key))
            .attr('r', 5)
            .style('fill', d => color(d.key));
        l.append('text')
            .attr('x', 15).attr('y',  d => pos(d.key))
            .attr('class', d => 'legendText '+ d.key)
            .style('alignment-baseline', 'middle')
            .text(d => d.key)
            .on('mouseover', hoverArea)
            .on('mouseleave', noHoverArea);
    });
}
