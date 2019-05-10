function get(cb) {
    cb.prototype.set = function(d) {
        var key = d.k;
        window.scope[key] = d.v;
    }
    cb.prototype.get = function(d) {
        return window.scope[d];
    }
    cb.prototype.key = function(s) {
        var o = window.scope;
        if (s == undefined)
            return "NK";
        s = s.replace(/\[(\w+)\]/g, '.$1');
        s = s.replace(/^\./, '');
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
    cb.prototype.cb = function(data) {
        data(this);
    }
    cb.prototype.del = function(){
        window.scope = {};
    }
    return new cb;
}
window.db = new get(function() {
    window.scope = {};
});