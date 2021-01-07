$(document).ready(function() {
    $("#time-slider").bind("valuesChanged", function(e, data) {
        let start = data.values.min;
        let end = data.values.max;
        update_all_year_plot(start, end);
        plot_typhoon(start, end);
        plot_stack(start, end);
    });
});