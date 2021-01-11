$(document).ready(function() {
    // intital plot
    let init_crop = $('#crop').val();
    let init_start = $('#time-slider').dateRangeSlider("min");
    let init_end = $('#time-slider').dateRangeSlider("max");
    plot_annual(init_crop);
    plot_line(init_crop, init_start, init_end);
    plot_box(init_crop, init_start, init_end);
    plot_stack(init_crop, init_start, init_end);

    // date slider listener
    $("#time-slider").bind("valuesChanged", function(e, data) {
        let start = data.values.min;
        let end = data.values.max;
        let crop = $('#crop').val();
        update_all_year_plot(start, end);
        plot_typhoon(start, end);
        plot_stack(crop, start, end);
        plot_box(crop, start, end);
    });

    // crop drop-down list listener
    $('#crop').on('change', e => {
        let crop = $('#crop').val();
        let start = $('#time-slider').dateRangeSlider("min");
        let end = $('#time-slider').dateRangeSlider("max");
        plot_line(crop, start, end);
        plot_annual(crop);
        plot_box(crop, start, end);
        plot_stack(crop, start, end);
    });
});