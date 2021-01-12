$(document).ready(function() {
    // intital plot
    let init_crop = $('#crop').val();
    let init_start = $('#time-slider').dateRangeSlider("min");
    let init_end = $('#time-slider').dateRangeSlider("max");
    let init_norm = $('#normalize').is(":checked");
    plot_annual(init_crop);
    plot_line(init_crop, init_start, init_end);
    plot_box(init_crop, init_start, init_end);
    plot_stack(init_crop, init_start, init_end, init_norm);
    // load iframe
    let init_start_str = init_start.toISOString().substring(0, 10);
    let init_end_str = init_end.toISOString().substring(0, 10);
    let iframe = document.getElementById("map-iframe");
    iframe.src = `component/map/index.html?crop=${init_crop}&start=${init_start_str}&end=${init_end_str}`;

    // date slider listener
    $("#time-slider").bind("valuesChanged", function(e, data) {
        let start = data.values.min;
        let end = data.values.max;
        let crop = $('#crop').val();
        let norm = $('#normalize').is(":checked");
        update_all_year_plot(start, end);
        plot_typhoon(start, end);
        plot_stack(crop, start, end, norm);
        plot_box(crop, start, end);

        // update map
        let start_str = start.toISOString().substring(0, 10);
        let end_str = end.toISOString().substring(0, 10);
        iframe.src = `component/map/index.html?crop=${crop}&start=${start_str}&end=${end_str}`;
    });

    // crop drop-down list listener
    $('#crop').on('change', e => {
        let crop = $('#crop').val();
        let start = $('#time-slider').dateRangeSlider("min");
        let end = $('#time-slider').dateRangeSlider("max");
        let norm = $('#normalize').is(":checked");
        plot_line(crop, start, end);
        plot_annual(crop);
        plot_box(crop, start, end);
        plot_stack(crop, start, end, norm);

        // update map
        let start_str = start.toISOString().substring(0, 10);
        let end_str = end.toISOString().substring(0, 10);
        iframe.src = `component/map/index.html?crop=${crop}&start=${start_str}&end=${end_str}`;
    });

    $('#normalize').on('change', e => {
        let crop = $('#crop').val();
        let start = $('#time-slider').dateRangeSlider("min");
        let end = $('#time-slider').dateRangeSlider("max");
        let norm = $('#normalize').is(":checked");
        plot_stack(crop, start, end, norm);
    });
});