  $(document).ready(function() {
    $('select[name="selectCropYear"]').on('change', function(e) {
      var crop = $('#crop').val();
      var year = $('#year').val();
      var weather = $('#weather').val();
      plot_pcp(crop, year, weather);
      plot_calendar(crop, year);
    });
    $('select[name="selectWeather"]').on('change', function(e) {
      var crop = $('#crop').val();
      var year = $('#year').val();
      var weather = $('#weather').val();
      plot_pcp(crop, year, weather);
    });
});





