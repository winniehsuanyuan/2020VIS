var rawDataURL = 'data/crop_avg.csv';
var xField = 'DateTime';
var yField = '平均價';
var vField = '交易量';

function plot_annual(crop) {
    let data_file = rawDataURL.replace('crop', crop);
    Plotly.d3.csv(data_file, function(err, rawData) {
        if (err) throw err;

        let data = prepData(rawData);
        let line_data = data[0];
        let polar_data = data[1];

        var traces = [];

        polar_data.forEach((year, _) => {
            traces.push({
                r: year['y'],
                theta: year['x'],
                mode: 'lines',
                name: year['name'],
                type: 'scatterpolar',

            })
        })

        // for the angularaxis ticks
        // angular_data = {
        //     type: 'scatterpolar',
        //     r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        //     theta: [...Array(12).keys()],
        //     subplot: "polar2"
        // };

        var polar_layout = {
            title: crop + ' 各年平均價',
            showlegend: true,
            // orientation: -90,
            polar: {
                domain: {
                    x: [0, 360]
                },
                radialaxis: {
                    tickangle: 270,
                    angle: 270
                },
                angularaxis: {
                    tickmode: 'array',
                    tickvals: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                    ticktext: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
                    direction: "clockwise"
                },
            }
        };

        var line_layout = {
            title: crop + ' - 各年平均價',
            xaxis: {
                tickformat: '%m/%d'
            },
            yaxis: {
                title: '平均價 (元)',
            }
        };

        Plotly.newPlot('annual-polar', traces, polar_layout);
        Plotly.newPlot('annual-line', line_data, line_layout, {
            showSendToCloud: true
        });
    });
}

function prepData(rawData) {
    let polar_year_data = {};
    let line_year_data = {};

    rawData.forEach(function(datum, i) {
        // sample interval
        if (i % 3) return;

        let full_date = new Date(datum[xField]);
        year = full_date.getFullYear().toString();
        date = '2012-' + String(full_date.getMonth() + 1).padStart(2, '0') + '-' + String(full_date.getDate()).padStart(2, '0')

        let year_start = new Date(year + "-01-01");
        let offset = full_date.getTime() - year_start.getTime();

        // store data by each year
        if (!(year in line_year_data)) {
            line_year_data[year] = { 'x': new Array(date), 'y': new Array(datum[yField]), 'mode': 'lines', 'name': year };
        } else {
            line_year_data[year]['x'].push(date);
            line_year_data[year]['y'].push(datum[yField]);
        }

        if (!(year in polar_year_data)) {
            polar_year_data[year] = { 'x': new Array(), 'y': new Array(), 'mode': 'lines', 'name': year };
        }
        polar_year_data[year]['x'].push(offset);
        polar_year_data[year]['y'].push(datum[yField]);
    });

    function to_radius(min, max) {
        var delta = max - min;
        return function(val) {
            return ((val - min) / delta) * 360;
        };
    }

    // scale date to the radius
    // console.log(year_data)
    radius_year_data = {}
    Object.keys(polar_year_data).forEach(key => {
        radius_year_data[key] = polar_year_data[key];
        radius_year_data[key]['x'] = radius_year_data[key]['x'].map(to_radius(Math.min(...radius_year_data[key]['x']), Math.max(...radius_year_data[key]['x'])));
    });

    return [Object.values(line_year_data), Object.values(radius_year_data)];
}

plot_annual('香蕉');