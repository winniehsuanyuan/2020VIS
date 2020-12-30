START_YEAR = 2014,
    END_YEAR = 2017;

var width = 960,
    height = 136,
    cellSize = 17; // cell size

var percent = d3.format(".1%"),
    format = d3.timeFormat("%Y-%m-%d");

var color;

var month_label_pos = {};
var data_year = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
for (let i = 0; i < data_year.length; i++) {
    month_label_pos[data_year[i]] = new Array();
}
var prev_pos = 0,
    cur_pos = 0;

var svg = d3.select("#calendar-div")
    .data(d3.range(START_YEAR, END_YEAR + 1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .attr("class", "year-label")
    .text(function(d) { return d; });

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(format);

rect.append("title")
    .text(function(d) { return d; });

svg.selectAll(".month")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    // .attr("class", "month")
    .attr("class", genMonthClass)
    .attr("d", monthPath);

d3.csv("data/香蕉_avg.csv")
    .then(csv => {
        let value_max = 0,
            value_min = 10000;

        var data = d3.nest()
            .key(function(d) { return d['DateTime']; })
            .rollup(function(d) {
                let value = d[0]['平均價']
                if (value >= value_max) {
                    value_max = value;
                }
                if (value <= value_min) {
                    value_min = value;
                }
                return value;
            })
            .map(csv);

        color = d3.scaleQuantize()
            .domain([value_min, value_max])
            .range(d3.range(11).map(function(d) {
                return "q" + d + "-11";
            }));

        console.log('data', data);

        rect.filter(function(d) { return data.has(d); })
            .attr("class", function(d) { return "day " + color(data.get(d)); })
            .select("title")
            .text(function(d) { return d + " : " + String(Math.round(data.get(d))) + " 元"; });
    })
    .catch(error => {
        console.log(error);
    })

function genMonthClass(t0) {
    return "month month-" + String(t0.getFullYear());
}

function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(),
        w0 = d3.timeWeek.count(d3.timeYear(t0), t0)
    d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);

    // calculate the month label pos
    let year = t0.getFullYear();
    prev_pos = cur_pos;
    cur_pos = w0;

    month_label_pos[year].push(prev_pos + (cur_pos - prev_pos) / 2)

    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
        "H" + w0 * cellSize + "V" + 7 * cellSize +
        "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
        "H" + (w1 + 1) * cellSize + "V" + 0 +
        "H" + (w0 + 1) * cellSize + "Z";
}


// --------------------------
// Legend
// --------------------------
var svgContainer = d3.select("#calendar-legend").append("svg")
    .attr("width", 800)
    .attr("height", 40);
svgContainer.append("text")
    .attr("x", 10)
    .attr("y", 25)
    .text("價格低")
    .attr("class", "calendar-legend-label")

var rectangle = svgContainer.append("rect")
    .attr("x", 60)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#006837");

svgContainer.append("rect")
    .attr("x", 90)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#A6D96A");

svgContainer.append("rect")
    .attr("x", 120)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#FEE08B");
svgContainer.append("rect")
    .attr("x", 150)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#A50026");

svgContainer.append("text")
    .attr("x", 180)
    .attr("y", 25)
    .text("價格高")
    .attr("class", "calendar-legend-label")


// ---------------------------
month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
used_year = [];

Object.keys(month_label_pos).forEach(y => {
    if (month_label_pos[y].length != 0) {
        used_year.push(y)
    }
});

// used_year.forEach(y => {
// });

for (var i = 0; i < month.length; i++) {
    let x = 6 + (6 * i);
    x = x + "em";
    svg.append("text")
        .attr("class", month[i] + " month-label")
        .style("text-anchor", "end")
        .attr("dy", "-.25em")
        .attr("dx", x)
        .text(month[i]);
}



days = ['Sun', 'Mon', 'Tue', 'Wes', 'Thu', 'Fri', 'Sat'];
for (var j = 0; j < days.length; j++) {
    let y = 0.7 + (1.65 * j);
    y = y + "em";
    svg.append("text")
        .attr("class", days[j] + " day-label")
        .style("text-anchor", "end")
        .attr("dy", y)
        .attr("dx", width - 30)
        .text(days[j]);
}