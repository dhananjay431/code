var targetCost = (function () {
    function targetCost() {
        console.log("targetCost");
    }
    targetCost.prototype.initDataProcess = function (temp) {
        return _.map(temp, function (d) {
            var ll = _.keys(d.LANDEDCOST);
            for (var i = 1; i <= ll.length; i++) {
                d['L' + i] = {
                    LANDEDCOST: d.LANDEDCOST['L' + i],
                    NOOFDIES: d.NOOFDIES['L' + i],
                    DIEWEIGHT: d.DIEWEIGHT['L' + i],
                    BASICCOST: d.BASICCOST['L' + i],
                    COSTPERTON: d.BASICCOST['L' + i]
                };
            }
            ;
            return d;
        });
    };
    targetCost.prototype.xmltoJson = function (data, key) {
        return $.cordys.json.findObjects(data, key);
    };
    return targetCost;
}());
