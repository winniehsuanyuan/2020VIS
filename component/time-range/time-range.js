$(document).ready(function() {
    $("#slider").dateRangeSlider({
        bounds: {
            min: new Date(2012, 0, 1),
            max: new Date(2019, 11, 31)
        },
        defaultValues: {
            min: new Date(2012, 5, 1),
            max: new Date(2013, 10, 10)
        }
    });

    $("#slider").bind("valuesChanged", function(e, data) {
        let msg = "Values just changed. min: " + data.values.min + " max: " + data.values.max;
        alert(msg);
    });
});