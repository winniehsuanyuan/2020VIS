$(document).ready(function() {
    // default time range
    plot_typhoon('2012-01-01', '2019-12-31');
});

function plot_typhoon(start, end) {
    d3.csv("data/typhoon.csv")
        .then(csv_data => {
            let chart = d3.timeline();

            let data = new Array();
            csv_data.forEach(row => {
                // check if in the range
                let range_start = new Date(start);
                let range_end = new Date(end);
                let typhoon_start = new Date(row['start-date']);
                let typhoon_end = new Date(row['end-date']);

                if (typhoon_start > range_start && typhoon_end < range_end) {
                    data.push([row['type'], row['強度'], new Date(row['start-date']), new Date(row['end-date'])])
                }
            })

            // start & end
            data.push(['入台時間', '', new Date(start), new Date(start)]);
            data.push(['入台時間', '', new Date(end), new Date(end)]);

            // clear the previous plot
            $("#typhoon-timeline").empty();
            d3.select('#typhoon-timeline').datum(data).call(chart);
        })
        .catch(error => {
            console.log(error);
        })
}