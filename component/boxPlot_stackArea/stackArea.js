const svg = d3.select('#stackArea');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = { top: 10, right: 80, bottom: 30, left: 80 }; //left150
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const colors = ['rgba(228,27,19,1)', 'rgba(241,134,14,1)', 'rgba(253,200,0,1)', 'rgba(152,198,70,1)', 'rgba(27,165,72,1)', 'rgba(0,156,166,1)', 'rgba(0,163,226,1)', 'rgba(0,87,184,1)', 'rgba(104,91,199,1)', 'rgba(180,0,158,1)', 'rgb(184,161,207)', 'rgb(230, 138, 184)', 'rgb(255, 192, 203)'];
var start_time = new Date(2012, 0, 1);
var end_time = new Date(2019, 11, 31);

function plot_stack(crop, start, end) {
    // clear the previous plot
    $("#stackArea").empty();

    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv('data/stackArea/dropped_norm/' + crop + '.csv').then(data => {
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

        g.append('g')
            .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal()
            .domain(markets)
            .range(colors);

        // Show the areas
        g.selectAll('layers')
            .data(stackedData)
            .enter()
            .append('path')
            .style('fill', d => color(d.key))
            .attr('stroke', 'rgb(0,0,0)')
            .attr('stroke-width', 0.05)
            .attr('d', d3.area()
                .x(function(d, i) { return x(d.data.DateTime); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )

        //legend
        const legend = g.append('g')
            .attr('transform', `translate(${innerWidth+30}, 20)`);
        let i = 0;
        markets.forEach(m => {
            legend.append('circle').attr('cx', 0).attr('cy', i * 20).attr('r', 5)
                .style('fill', color(m));
            legend.append('text').attr('x', 15).attr('y', i * 20).attr('class', 'legend')
                .style('alignment-baseline', 'middle')
                .text(m);
            i++;
        });
    });
}