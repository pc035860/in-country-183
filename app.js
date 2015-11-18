angular.module('in-country-183', [
  'ui.router'
])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('_', {
      url: '/_',
    })
      .state('_.data', {
        url: '/*data'
      });

    $urlRouterProvider.otherwise('/_');
})

.controller('MainCtrl', 
function MainCtrl ($scope, $state, $log) {

    var checkDate = function(str){
        var timestamp=Date.parse(str);
        return  (isNaN(timestamp)==false);
    };

    var fd = function(d){
        return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    };

    var indate = function (d) {
        var found = false;
        $scope.dates.forEach(function(rule){
            if(d >= rule.start && d <= rule.end){
                found = true;
                return false;
            }
        });
        return found;
    };

    $scope.type ="不在";
    $scope.alldate = 365;
      
    $scope.dates = [];
    
    $scope.startDate = fd(new Date());
    $scope.endDate = fd(new Date());
    $scope.calc = function(){
        if ($scope.type == "不在") {
            
        }
    };

    $scope.countDates = function () {
        var date = new Date();
        var d = new Date(fd(date));
        var ed = new Date(fd(date));          
        var alldates = [];
        for(var i = 0 ; i < 365;++i){
            var nd = new Date(fd(date));
            nd.setDate(nd.getDate() - i -1);
            alldates.push(nd);
        }
        var founddates = alldates.filter(indate);
        $scope.alldate = founddates.length;
        $scope.type2 = ($scope.type === "在") ? "不在" : "在";
        $scope.alldate2 = 365 -     $scope.alldate;        
        var rule = 0 ,diff = 0;
        if($scope.type == "在"){
            rule = $scope.alldate;
        }else{
            rule = 365 - $scope.alldate;        
        }
        diff = rule - 183;
        if(diff > 0){
            $scope.valid = "現在";
        }else{
            var d = new Date() , nd = d;        
            for(var i = 0 ,valid = 0; valid < diff*-1 ;++i){
                nd = new Date();        
                nd.setDate(d.getDate() + i);
                if(!indate(nd)){
                    valid ++;
                }
            }
            $scope.valid = fd(nd);
        }
    };
    
    $scope.addDate = function(){
        if(!checkDate($scope.startDate)){
            alert("開始日期格式錯誤");
            return true;
        }
        if(!checkDate($scope.endDate)){
            alert("結束日期格式錯誤");
            return true;
        }

        if ((+new Date($scope.endDate)) < (+new Date($scope.startDate))) {
            alert("結束日期 需 大於 開始日期");
            return true;
        }

        $scope.dates.push(genDate($scope.startDate, $scope.endDate));
        updateUrl($scope.type, $scope.dates);
    };

    $scope.removeDate = function (date) {
        var index = $scope.dates.indexOf(date);

        if (index >= 0) {
            $scope.dates.splice(index, 1);
            updateUrl($scope.type, $scope.dates);
        }
    };

    $scope.typeChanged = function () {
        updateUrl($scope.type, $scope.dates);
    };

    init();


    function init () {
        $scope.countDates();

        $scope.$watchCollection('dates', function () {
            $scope.countDates();
        });

        $scope.$on('$stateChangeSuccess', function ($evt, state, stateParams) {
            if (state.name && stateParams.data) {
                // update dates
                var data = extractData(stateParams.data);
                if (data) {
                    $scope.type = data.type;
                    $scope.dates = data.dates;
                    $scope.type2 = $scope.type == "在" ?"不在" :"在";
                }
            }
        });
    }

    function genDate(start, end) {
        var d = new Date(start);
        var e = new Date(end);
        return {
            raw: {
                start: start,
                end: end
            },
            start: d, end: e,
            duration: fd(d)+" ~ "+ fd(e)
        };
    }

    /**
     * data 格式
     *
     * {type}t{start1}v{end1}u{start2}v{end2} ...
     */
    function updateUrl(type, dates) {
        type = (type === '不在') ? 1 : 2;

        if (dates.length > 0) {
            var ref = +new Date(),
                path = type + 't',
                l = [],
                date;
            angular.forEach(dates, function (d) {
                l.push(d.raw.start + 'v' + d.raw.end);
            })
            data = path + l.join('u');
        }
        else {
            data = null;
        }


        $state.go('_.data', {data: data}, {notify: false});
    }

    /**
     * 還原 data
     */
    function extractData(data) {
        var re = /(1|2)t(.+)$/,
            m = data.match(re);

        if (!m) {
            return null;
        }

        var type = (m[1] == '1') ? '不在' : '在';

        var dates = [];

        angular.forEach(m[2].split(/u/), function (v) {
            var buf = v.split(/v/),
                start = buf[0],
                end = buf[1];
            dates.push(genDate(start, end));
        });

        return {
            type: type,
            dates: dates
        };
    }
});