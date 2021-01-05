var rawDataURL = 'crop/香蕉_avg.csv';
var xField = 'DateTime';
var yField = '平均價';
var vField = '交易量';

var selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD'
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
};

Plotly.d3.csv(rawDataURL, function(err, rawData) {
    if (err) throw err;

    var data = prepData(rawData);
    var layout = {
        title: '香蕉 - 平均價',
        xaxis: {},
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
    };

    Plotly.plot('graph', data, layout, { showSendToCloud: true });
});



function prepData(rawData) {
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