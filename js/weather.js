  $(document).ready(function() {
    $('#crop').on('change', function(e) {
      var crop = $('#crop').val();
      var year = $('#year').val();
      var weather = $('#weather').val();
      plot_pcp(crop, year, weather);
      plot_calendar(crop, year);
    });
    $('#year').on('change', function(e) {
      var crop = $('#crop').val();
      var year = $('#year').val();
      var weather = $('#weather').val();
      plot_pcp(crop, year, weather);
      plot_calendar(crop, year);
    });
    $('#weather').on('change', function(e) {
      var crop = $('#crop').val();
      var year = $('#year').val();
      var weather = $('#weather').val();
      plot_pcp(crop, year, weather);
    });

});





