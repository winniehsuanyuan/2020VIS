$(document).ready(function() {
    $("#time-slider").dateRangeSlider({
        bounds: {
            min: new Date(2012, 0, 1),
            max: new Date(2019, 11, 31)
        },
        defaultValues: {
            min: new Date(2012, 0, 1),
            max: new Date(2019, 11, 31)
        }
    });

    /* === time-slider update event ===
    $("#time-slider").bind("valuesChanged", function(e, data) {
        let start = data.values.min;
        let end = data.values.max;
        ...
    });
    */
});