// var rawDataURL = 'data/crop_avg.csv';
// var xField = 'DateTime';
// var yField = '平均價';
// var vField = '交易量';

function plot_line(crop, start, end) {
    let data_file = rawDataURL.replace('crop', crop);
    Plotly.d3.csv(data_file, function(err, rawData) {
        if (err) throw err;

        var data = prepDataAll(rawData);
        var layout = {
            xaxis: {
                range: [start, end]
            },
            yaxis: {
                title: '交易量',
                // overlaying: 'y',
                side: 'right'
            },
            yaxis2: {
                title: '平均價 (元)',
                fixedrange: true,
                overlaying: 'y'
            },
            width: 1250,
            margin: {
                b: 25
            }
        };

        Plotly.newPlot('all-year-graph', data, layout, {
            showSendToCloud: true
        });
    });
}

function prepDataAll(rawData) {
    var x = [];
    var y = [];
    var v = [];

    console.log(rawData.length)

    rawData.forEach(function(datum, i) {
        if (i % 1) return;

        x.push(new Date(datum[xField]));
        y.push(datum[yField]);
        v.push(datum[vField]);
    });

    price_data = {
        x: x,
        y: y,
        mode: 'lines',
        xaxis: 'x1',
        yaxis: 'y2',
        name: '平均價'
    };

    volume_data = {
        x: x,
        y: v,
        type: 'bar',
        yaxis: 'y1',
        xaxis: 'x1',
        name: '交易量'
    }

    return [price_data, volume_data];
}

function update_all_year_plot(start, end) {
    Plotly.relayout('all-year-graph', 'xaxis.range', [start, end]);
}