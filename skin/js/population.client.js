/**
 * Ваши изменения ниже
 */
var requests = ['/countries', '/cities', '/populations'];
var responses = {};

for (i = 0; i < 3; i++) {
    var request = requests[i];
    var callback = function (error, result) {
        responses[this] = result;
        var l = [];
        for (K in responses)
            l.push(K);

        if (l.length == 3) {
            var c = [], cc = [], p = 0;
            for (i = 0; i < responses['/countries'].length; i++) {
                if (responses['/countries'][i].continent === 'Africa') {
                    c.push(responses['/countries'][i].name);
                }
            }

            for (i = 0; i < responses['/cities'].length; i++) {
                for (j = 0; j < c.length; j++) {
                    if (responses['/cities'][i].country === c[j]) {
                        cc.push(responses['/cities'][i].name);
                    }
                }
            }

            for (i = 0; i < responses['/populations'].length; i++) {
                for (j = 0; j < cc.length; j++) {
                    if (responses['/populations'][i].name === cc[j]) {
                        p += responses['/populations'][i].count;
                    }
                }
            }

            console.log('Total population in African cities: ' + p);
        }
    };

    getData(request, callback.bind(request));
}

/**
 *  custom search component by country or city
 */
var SRCH = (function(s){

    /**
     * simple initialization function. If any errors: search just doesn't work.
     */
    s.preloader = (function(){
        var l = document.createElement('i');
        l.className = 'spinner-loader';
        return l;
    })();

    s.initSearchSet = function(){
        this.searchSet = {
            string: null,
            scope: [{
                url: '/cities'
            },{
                url: '/populations'
            }],
            scopeData: [],
            keeper: 0, // initial state,
            successSearch: false
        };
    };

    s.initCustomSearch = function(){

        /**
         * init search button
         * @param {object} [el] - HTMLelement
         */
        this.initSearchTrigger = function(el) {
            this.searchTrigger = el || {};
            if (!el) {
                console.error('You need specify search button identifier');
                return;
            }
            this.searchTrigger.onclick = s.startSearch.bind(this);
            this.searchTrigger.loadText = this.searchTrigger.innerHTML;
            this.searchTrigger.innerHTML = this.searchTrigger.title;
            this.searchTrigger.loading = function(state){
                if (state || typeof state === 'undefined') {
                    this.innerHTML = this.loadText;
                    s.searchHolder.loading();
                } else {
                    this.innerHTML = this.title;
                    s.searchHolder.loading(false);
                }
            };
            this.searchTrigger.disabled = false;
        };

        /**
         * init search and calculate result placement
         * @param {object} [el] - HTMLelement
         */
        this.initSearchHolder = function(el) {
            if (!el) {
                console.error('You need specify search button identifier');
                return;
            } else {
                el.loading = function(state){
                    // don't use cool features like classList and others from HTML5 & CCS3 specs following code style provided by SHRI task.
                    // so just innerHTML to be simple.
                    if (state || typeof state === 'undefined') {
                        this.appendChild(s.preloader);
                    } else if (s.searchSet.canceledSearch) {
                        var childs = this.children;
                        for (var child = childs.length - 1; child >= 0; child--) {
                            if ( childs[child].className === s.preloader.className ) {
                                this.removeChild(childs[child]);
                            }
                        };
                    }
                };
                this.searchHolder = el;
            }
        };
        
        /**
         * search handler
         * @param {object} [event] - event object if function used as a event handler
         * @param {string} [msg]
         */
        this.startSearch = function(event, msg) {
            msg = msg || 'Введите название страны или города на английском:\n(например, Japan или Suva)';
            var searchText = window.prompt(msg);
            if (!searchText) {
                this.cancelSearch();
                return;
            }
            SRCH.searchTrigger.loading();
            this.initSearchSet();
            this.searchSet.string = searchText;
            this.search();
        }

        /**
         * send search request
         * @param {string} url - api url
         */
        this.search = function(url) {
            for (var i = this.searchSet.scope.length - 1; i >= 0; i--) {
                this.searchSet.keeper++;
                getData(this.searchSet.scope[i].url, this.parseResult.bind(this));
            };
        };

        /**
         * process request results
         * @param {array} data - 2-dimension array only (array of scopes); data to parse
         * @param {array} fieldCodes - what keys scope must has
         */
        this.process = function(fieldCodes) {

            // waiting while all requests are finished; uses keeper instead of "promises".
            if (this.searchSet.keeper > 0 || this.searchSet.canceledSearch) {
                if (this.searchSet.keeper > 0 && this.searchSet.canceledSearch) {
                    this.cancelSearch();
                }
                return;
            }

            var strg;
            var st = this.searchSet.string.toLowerCase();
            
            fieldCodes = fieldCodes || [];
            
            strg = this.searchSet.scopeData || [[]];

            var result = [],
                scope,
                i;

            fullScope: for (scope = strg.length-1; scope >= 0; scope--) {
                if (fieldCodes.length) {
                    for (var i = fieldCodes.length - 1; i >= 0; i--) {
                        if ( !strg[scope][0][fieldCodes[i]] ) {
                            continue fullScope;
                        }
                    };
                }
                for (i = strg[scope].length - 1; i >= 0; i--) {
                    switch (true) {
                        // if search by city
                        case !!(strg[scope][i].count && strg[scope][i].name.toLowerCase() === st):
                            result.push(strg[scope][i].count);
                            // this.showResult(strg[scope][i].count);
                            break fullScope;
                        break;
                        // if search by country
                        case !!( (strg[scope-1] && strg[scope-1][i]) || (strg[scope+1] && strg[scope+1][i]) ):
                            var sc = strg[scope][i] || strg[scope-1][i] || strg[scope+1][i] || {};
                            if (sc.name.toLowerCase() === st) {
                                this.process(['count', 'name']);
                                break fullScope;
                            }
                            if (sc.country && sc.country.toLowerCase() === st) {
                                this.searchSet.string = sc.name;
                                this.process(['count', 'name']);
                                break fullScope;
                            }
                            sc = null;
                        break;
                    }
                };
            }

            if (result.length) {
                if (result.length > 1) {
                    var _result = 0;
                    for (var i = result.length - 1; i >= 0; i--) {
                        _result += result[i];
                    };
                    result = _result;
                    _result = null;
                }
                this.searchSet.canceledSearch = true;
                this.showResult(result);
            } else {
                if (scope === -1 && i === -1) {
                    this.startSearch(null, 'Такой страны не найдено, попробуйте еще раз:\n(например, Japan или Suva)');
                } else if (this.searchSet.canceledSearch) {
                    this.cancelSearch();
                }
            }
        };
        
        /**
         * parse search result
         * @param {object|string} data - request result
         */
        this.parseResult = function(err, data) {
            this.searchSet.keeper--;
            if (err || !data.length || typeof data === 'string') {
                this.cancelSearch('Случилось страшное, но мы уже в курсе.\nПопробуйте выполнить запрос чуть позже.\nОшибка: ' + err);
                return;
            } else {
                this.searchSet.scopeData.push(data);
                this.process();
            }
        }

        /**
         * cancel search process
         * @param {string} msg - string notification
         */
        this.cancelSearch = function(msg) {
            this.searchTrigger.loading(false);
            if (msg) {
                window.alert(msg);
            }
        };

        /**
         * show calculate result
         * @param {object} result
         */
        this.showResult = function(result) {
            this.searchHolder.innerHTML = ''+result;
        };

        this.initSearchTrigger(document.getElementById('search-by-country'));
        this.initSearchHolder(document.getElementById('search-result'));
    }

    s.initCustomSearch();

    return s;
})(SRCH || {});