let select_date = '2012-01-08';
const CITY = ["臺北市", "嘉義市", "新竹市", "基隆市", "新北市", "桃園市", "臺中市", "彰化縣", "高雄市", "臺南市", "金門縣", "澎湖縣", "雲林縣", "連江縣", "新竹縣", "苗栗縣", "屏東縣", "嘉義縣", "宜蘭縣", "南投縣", "花蓮縣", "臺東縣"];
const CSV_FILE = "data/週成交量_crop_市場.csv";

// reference: https://www.learningjquery.com/2012/06/get-url-parameters-using-jquery
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};


$(document).ready(function() {

    let market_data = new Object();
    var density = {};
    var value_max, value_min;

    // get query string
    let crop = getUrlParameter('crop');
    let start = new Date(getUrlParameter('start'));
    let end = new Date(getUrlParameter('end'));
    let data_file = CSV_FILE.replace('crop', crop);

    d3.csv(data_file, function(error, csv) {
        if (error) {
            console.log(error);
        }

        csv.forEach(r => {
            market_data[r['DateTime']] = r;
            delete market_data[r['DateTime']]['DateTime'];
        });

        // console.log(market_data);

        // init density
        CITY.forEach(c => {
            density[c] = 0;
        });

        // sum up the volume between selected time range
        for (const [date, value] of Object.entries(market_data)) {
            // if before the start, skip
            if (new Date(date) < start) {
                continue;
            }
            // if after the end, break
            if (new Date(date) > end) {
                break;
            }
            // sum up the volume of each city
            CITY.forEach(c => {
                density[c] += parseInt(value[c]);
            });
        }

        // console.log(density);

        value_max = Math.max(...Object.values(density));
        value_min = Math.min(...Object.values(density));
    });

    d3.json("data/taiwan_county.json", function(topodata) {
        var features = topojson.feature(topodata, topodata.objects.county).features;
        var color = d3.scale.linear().domain([value_min, value_max]).range(["#090", "#f00"]);
        var fisheye = d3.fisheye.circular().radius(100).distortion(2);
        var prj = function(v) {
            var ret = d3.geo.mercator().center([122, 23.25]).scale(6000)(v);
            var ret = fisheye({ x: ret[0], y: ret[1] });
            return [ret.x, ret.y];
        };
        var path = d3.geo.path().projection(prj);
        for (idx = features.length - 1; idx >= 0; idx--) features[idx].density = density[features[idx].properties.C_Name];
        d3.select("svg").selectAll("path").data(features).enter().append("path");

        function update() {
            d3.select("svg").selectAll("path").attr({
                "d": path,
                "fill": function(d) { return color(d.density); }
            }).on("mouseover", function(d) {
                $("#name").text(d.properties.C_Name);
                $("#density").text(d.density);

            });
        }
        /*
        d3.select("svg").on("mousemove", function() {
          fisheye.focus(d3.mouse(this));
          update();
        });
        */
        update();
    });
});