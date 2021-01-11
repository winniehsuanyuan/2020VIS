let box_start_time = new Date(2012, 0, 1);
let box_end_time = new Date(2019, 11, 31);

function plot_box(crop, start, end) {
    // clear the previous plot
    $("#boxPlot").empty();

    let svg = d3.select('#boxPlot');
    let width = +svg.attr('width');
    let height = +svg.attr('height');
    let margin = { top: 10, right: 10, bottom: 30, left: 50 }; //left150
    let innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bottom;
    let color = ['rgba(0, 0, 0, 0.65)', 'rgba(153, 76, 0, 1)', 'rgba(255,153,51,1)'];

    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //const markets = ['三重區', '台中市', '台北一', '台北二', '台東市', '嘉義市', '宜蘭市', '東勢鎮', '板橋區', '桃農', '豐原區', '高雄市', '鳳山區', '西螺鎮', '屏東市', '溪湖鎮', '南投市', '花蓮市'];

    // Read the data and compute summary statistics for each specie
    d3.csv('data/boxPlot/' + crop + '.csv').then(data => {
        //console.log(data);
        data.forEach(d => {
            d.DateTime = d3.timeParse("%Y-%m-%d")(d.DateTime);
        });

        data = data.filter(function(d) {
            if ((d.DateTime >= start) && (d.DateTime <= end))
                return true;
            else
                return false;
        })
        var markets = d3.map(data, d => d['市場名稱']).keys();
        var outliers = [];
        // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(d => d['市場名稱'])
            .rollup(function(d) {
                let sorted = d.map(x => +x['平均價']).sort(d3.ascending);
                let q1 = d3.quantile(sorted, 0.25);
                let median = d3.quantile(sorted, 0.5);
                let q3 = d3.quantile(sorted, 0.75);
                let iqr = q3 - q1;
                let min = Math.max(sorted[0], q1 - (iqr * 1.5));
                let max = Math.min(sorted[sorted.length - 1], q3 + iqr * 1.5);
                //let min = q1 - (1.5 * iqr);
                //let max = q3 + (1.5 * iqr);
                d.filter(x => (+x['平均價'] < min || +x['平均價'] > max)).forEach(function(x) {
                    outliers.push(x);
                });
                //console.log(outliers);
                return ({ q1: q1, median: median, q3: q3, min: min, max: max }); //, outliers: outliers});
            }).entries(data);

        //console.log(outliers); 
        // Show the X scale
        var x = d3.scaleBand()
            .domain(markets)
            .range([0, innerWidth])
            .paddingInner(1)
            .paddingOuter(0.5);
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

        // Show the Y scale
        var y = d3.scaleLinear()
            .domain(d3.extent(data, d => +d['平均價']))
            .range([innerHeight, 0])
            .nice();
        g.append('g')
            .call(d3.axisLeft(y));
        /*
            // color palette
            var color = d3.scaleOrdinal()
              .domain(markets)
              .range(colors);
        */
        var tip = d3.tip().attr('class', 'd3-tip').direction('e').offset([0, 5])
            .html(function(d) {
                var content = "<span style='margin-left: 2.5px;'><b>" + d.key + "</b></span><br>";
                content += `<table style="margin-top: 2.5px;">
                <tr><td>Max: </td><td style="text-align: right">` + d3.format(".2f")(d.value.max) + `</td></tr>
                <tr><td>Q3: </td><td style="text-align: right">` + d3.format(".2f")(d.value.q3) + `</td></tr>
                <tr><td>Median: </td><td style="text-align: right">` + d3.format(".2f")(d.value.median) + `</td></tr>
                <tr><td>Q1: </td><td style="text-align: right">` + d3.format(".2f")(d.value.q1) + `</td></tr>
                <tr><td>Min: </td><td style="text-align: right">` + d3.format(".2f")(d.value.min) + `</td></tr>
              </table>`;
                return content;
            });
        svg.call(tip);

        // Show the main vertical line
        g.selectAll('.vertLines')
            .data(sumstat)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', d => x(d.key))
            .attr('x2', d => x(d.key))
            .attr('y1', d => y(d.value.min))
            .attr('y2', d => y(d.value.max))
            .attr('stroke', color[1])
            .attr('stroke-width', 1)
            .style('stroke-dasharray', ('5,5'));

        // rectangle for the main box
        var boxWidth = 20
        g.selectAll('.boxes')
            .data(sumstat)
            .enter()
            .append('rect')
            .attr('x', function(d) { return (x(d.key) - boxWidth / 2); })
            .attr('y', d => y(d.value.q3))
            .attr('height', d => (y(d.value.q1) - y(d.value.q3)))
            .attr('width', boxWidth)
            .attr('stroke', color[1])
            .attr('stroke-width', 1)
            .style('fill', color[2])
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // Show the median
        g.selectAll('.medianLines')
            .data(sumstat)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', function(d) { return (x(d.key) - boxWidth / 2); })
            .attr('x2', function(d) { return (x(d.key) + boxWidth / 2); })
            .attr('y1', d => y(d.value.median))
            .attr('y2', d => y(d.value.median))
            .attr('stroke-width', 1)
            .attr('stroke', color[1]);

        // Show the min
        g.selectAll('.minLines')
            .data(sumstat)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', function(d) { return (x(d.key) - boxWidth / 2); })
            .attr('x2', function(d) { return (x(d.key) + boxWidth / 2); })
            .attr('y1', d => y(d.value.min))
            .attr('y2', d => y(d.value.min))
            .attr('stroke-width', 1)
            .attr('stroke', color[1]);
        //.on('mouseover', Hover);

        // Show the max
        g.selectAll('.maxLines')
            .data(sumstat)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', function(d) { return (x(d.key) - boxWidth / 2); })
            .attr('x2', function(d) { return (x(d.key) + boxWidth / 2); })
            .attr('y1', d => y(d.value.max))
            .attr('y2', d => y(d.value.max))
            .attr('stroke-width', 1)
            .attr('stroke', color[1]);

        // draw outliers
        if (outliers.length > 0) {
            g.selectAll('.circles')
                .data(outliers)
                .enter()
                .append('circle')
                .attr('class', 'circle')
                .attr('r', 3)
                .attr('cx', d => x(d['市場名稱']))
                .attr('cy', d => y(+d['平均價']));
        }
    });
}