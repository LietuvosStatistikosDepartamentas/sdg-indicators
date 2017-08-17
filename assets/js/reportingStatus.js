var reportingStatus = function(indicatorDataStore) {
  this.indicatorDataStore = indicatorDataStore;

  this.getReportingStatus = function() {

    var that = this;

    return new Promise(function(resolve, reject) {

      // if(Modernizr.localStorage &&) {

      // }

      getPercentages = function(values) {

        var percentageTotal = 100;
        var total = _.reduce(values, function(memo, num) { return memo + num; });
        var percentages = _.map(values, function(v) { return (v / total) * percentageTotal; });

        var off = percentageTotal - _.reduce(percentages, function(acc, x) { return acc + Math.round(x) }, 0);
          return _.chain(percentages).
                  map(function(x, i) { return Math.round(x) + (off > i) - (i >= (percentages.length + off)) }).
                  value();
      }

      that.indicatorDataStore.getData().then(function(data) {
        // for each goal, get a percentage of indicators in the various states:
        // notstarted, inprogress, complete
        var mappedData = _.map(data, function(dataItem) {

          var returnItem = {
            goal_id: dataItem.goal.id,
            notStartedCount: _.where(dataItem.goal.indicators, { status: 'notstarted' }).length,
            inProgressCount: _.where(dataItem.goal.indicators, { status: 'inprogress' }).length,
            completeCount: _.where(dataItem.goal.indicators, { status: 'complete' }).length
          };

          returnItem.percentages = getPercentages([returnItem.notStartedCount, returnItem.inProgressCount, returnItem.completeCount]);          
          
          return returnItem;
        });    

        resolve(mappedData);
      });     
    });
  };
};

$(function() {

  if($('.container').hasClass('reportingstatus')) {
    var url = $('.container.reportingstatus').attr('data-url'),
        status = new reportingStatus(new indicatorDataStore(url));

    status.getReportingStatus().then(function(data) {
      // loop through each data item, using its goal_id property:

      var selector, percentage, types = ['Exploring data sources', 'Statistics in progress', 'Reported online'];

      // 
      _.each(data, function(goal) {
        
        var el = $('.goal[data-goalid="' + goal.goal_id + '"]');

        var total = goal.notStartedCount + goal.inProgressCount + goal.completeCount;
        var counts = [goal.notStartedCount, goal.inProgressCount, goal.completeCount];

        $(el).find('.goal-stats span').each(function(index, statEl) {

          var percentage = Math.round(Number(((counts[index] / total) * 100))) + '%'
          
          $(statEl).attr({
            'style': 'width:' + goal.percentages[index] + '%',
            'title': types[index] + ': ' + goal.percentages[index] + '%'
          });

          $(el).find('span.value:eq(' + index + ')').text(goal.percentages[index] + '%');

        });        
      });

      // animation:
      if($('#main-content').hasClass('reportingstatus')) {
        setTimeout(function() {

          var width = $('.reportingstatus').width();

          $('#main-content').find('.statuses, .divider, h3').slideDown(function() {
            $('.frame').animate({ 'width' : '110px', duration: 1500, queue: false }, function() {
              $('.goal img').fadeIn(1500, function() {
                $('.goal').animate({ borderTopColor: '#ddd', borderLeftColor: '#ddd', borderRightColor: '#ddd', borderBottomColor: '#ddd' }, 500);
              });
            });

            $('.details').animate({ 'width' : width - 130 + 'px', duration: 1500, queue: false });
          });

        }, 1200);
      }
    });

  }
});