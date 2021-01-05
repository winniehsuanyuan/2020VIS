let select_date = '2012-01-08';
const CITY = ["臺北市", "嘉義市", "新竹市", "基隆市", "新北市", "桃園市", "臺中市", "彰化縣", "高雄市", "臺南市", "金門縣", "澎湖縣", "雲林縣", "連江縣", "新竹縣", "苗栗縣", "屏東縣", "嘉義縣", "宜蘭縣", "南投縣", "花蓮縣", "臺東縣"];

$(document).ready(function() {

    let market_data = new Object();
    var density = {};
    var value_max, value_min;

    d3.csv("data/週成交量_小白菜-土白菜_市場.csv", function(error, csv) {
        if (error) throw error;

        csv.forEach(r => {
            market_data[r['DateTime']] = r;
            delete market_data[r['DateTime']]['DateTime'];
        });

        // update volume
        console.log(market_data);
        selected_data = market_data[select_date];
        CITY.forEach(c => {
            density[c] = selected_data[c]
        });

        value_max = Math.max(...Object.values(selected_data));
        value_min = Math.min(...Object.values(selected_data));
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