/**
 * @namespace ferrandApp
 *
 * @type {{_count: number, _data: Array, _input: (*|jQuery|HTMLElement), _output: (*|jQuery|HTMLElement), getInput: Function, setInput: Function, getSelected: Function, addKeyValue: Function, processInput: Function, removeKeyValue: Function, isValidInput: Function, sortKeyValueBy: Function, render: Function, buildXML: Function, renderXML: Function, utils: {forEach: Function, isArray: Function, isNumeric: Function, createComparator: Function, handleError: Function}, start: Function}}
 */

var ferrandApp = (function () {


    /**
     * id for current pair
     */
    var _count = 0;


    var _data = [];


    var _input = $('#kvInput');

    var _output = $('#kvCombo');

    return {
        /**
         *
         * @returns {*}
         */
        getInput: function () {
            return _input.val();
        },

        /**
         * sets the name value input to '' or str if that is passed in
         * @param str {string}
         */
        setInput: function (str) {
            (arguments.length > 1 && typeof arguments[0] === 'string') ? _input.val(str) : _input.val('');
        },

        /**
         * Get the currently selected items from the listed pairs
         * @returns {Array} containing the ids of the pairs to be deleted
         */
        getSelected: function () {
            var el = _output;
            var selected = [];

            $(el).children().filter(':selected').each(function () {
                selected.push(parseInt(this.value, 10));
            });

            return selected;
        },

        /**
         *
         * @param str {string} name value pair string to be added to the store
         */
        addKeyValue: function (str) {
            var arr;

            //TODO: move data validation outside method
            if (this.isValidInput(str)) {
                var key, value;
                arr = str.split('=', 2);

                //TODO: implement alt trim function for non ECMAScript 5 browsers
                key = arr[0].trim();
                value = arr[1].trim();

                this.processInput({'key': key, 'value': value});

                value = this.utils.isNumeric(value) ? parseInt(value, 10) : value;

                _data.push({
                    "id"   : ++(_count),
                    "name" : key,
                    "value": value
                });

                this.render(null);
            }
        },

        /**
         * Takes a structurally valid name value pair and further processes against a set of rules like allowed characters
         * @param obj {Object} containing the name value pair
         */
        processInput: function (obj) {
            var size = 0;
            var arr = [];
            var regexpTest = /^(?:[0-9A-Za-z]+)$/;

            /**
             * Obj should only be a length of 2, but loop below is generalized
             */
            if (obj instanceof Object) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        arr[size] = obj[prop];
                        ++size;
                    }
                }

                if (!regexpTest.test(arr[0]) || !regexpTest.test(arr[1])) {
                    throw {
                        name   : 'Oops! We only allow alphabets and numbers... sorry',
                        message: "Your Name / Value pair can only contain alpha-numeric characters." +
                            "However, if you like, you may enter only numbers in your value."
                    }
                }


                if (this.utils.isNumeric(arr[0])) {
                    throw {
                        name   : "Ahh. That\'s a bad name",
                        message: 'The \"name\" in your pair appears to be a numeric value (' + arr[0] +
                            '), only alphanumeric characters are allowed in the name property'
                    }
                }
            } else {
                throw {
                    name   : '',
                    message: 'Should be an instance of Object'
                }
            }
        },

        /**
         * Removes selected (or provided) pairs from the array of pairs
         * @param arr {Array} Array containing the ids of pairs to be deleted
         */
        removeKeyValue: function (arr) {
            $.each(arr, function (index, deleteId) {
                $.each(_data, function (idx) {
                    if (_data[idx].id === deleteId) {
                        _data.splice(idx, 1);
                        return false;
                    }
                    return true;
                });
            });

            this.render(null);
        },

        /**
         *
         * @param input {string} The string to test for valid pair format
         * @returns {boolean}
         */
        isValidInput: function (input) {
            //TODO: allow addition of multiple kv stores using a comma delimited list
            var count = 0;
            //var pos = -1;

            if (typeof input === 'string' && input.length > 2) {

                this.utils.forEach(input, function (member) {
                    if (member === '=') {
                        count++;
                    }
                });

                /** incomplete alternate check algorithm
                 pos = input.indexOf('=');
                 while (pos > -1){
                if (input.indexOf('=', pos+1)>pos){
                    count++;
                    pos = input.indexOf('=', pos + 1);
                }
            }*/
            } else {
                throw {
                    name   : 'Hmm... your input does not look right',
                    message: 'Your string should be in the proper format of \"name\" = \"value\". Without the quotes.'
                }
            }

            return count === 1 && input.indexOf('=') > 0 && input.indexOf('=') < input.length - 1;
        },

        /**
         *
         * @param prop {string} Property to be sorted by comparator
         */
        sortKeyValueBy: function (prop) {
            _data.sort(this.utils.createComparator(prop));

            this.render(null);
        },

        /**
         *
         * @param elm {*|jQuery|HTMLElement} The containing element to output the list of name - value stores to
         */
        render: function (elm) {
            var el = elm || _output;

            el.children().remove();


            (function appendData(obj, el) {
                var markup = [];

                $.each(obj, function (index, value) {
                    //el.append($('<option></option>').attr('value', value['id']).text(value['name'] + '=' + value['value']));
                    markup.push("<option value =" + value['id'] + ">" + value['name'] + '=' + value['value'] + "</option>");
                });
                el.append($(markup.join("")));

            })(_data, el);

            /*el.children().click(function(){
             $(this).toggleClass('tmpSelected');
             });*/

            console.log(JSON.stringify(_data));//TODO: Remove from PROD
        },

        /**
         * Takes an array of JSON objects / objects and builds an array of XML nodes
         * @param d {Array} Array of Objects
         * @returns {Array} Array of XML markup nodes
         */
        buildXML: function (d) {
            var data = d || _data;
            var markup = [];

            if (!this.utils.isArray(data)) {
                throw {
                    name   : 'Data Error',
                    message: 'It seems you do not have the right kind of data: ' + data
                }
            }

            //TODO: Allow user to specify node names
            markup.push("<?xml version='1.0' encoding='UTF-8' standalone='yes'?>[br]");
            markup.push("<root>[br]");

            $.each(data, function (index, value) {
                markup.push(" <dataitem>[br]");
                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        markup.push("  <" + prop + ">" + value[prop] + "</" + prop + ">[br]");
                    }
                }
                markup.push(" </dataitem>[br]");
            });
            markup.push("</root>[br]");

            return markup;
        },

        /**
         * renders the XML to the UI
         * @param XML {Array} containing XML nodes
         * @param el {*|jQuery|HTMLElement} XML document will be appended to
         * @returns {boolean} returns false if renderXML failed due to an unexpected Array or Object
         */
        renderXML: function (XML, el) {
            el.empty();

            if (this.utils.isArray(XML) && XML.length > 3) {
                XML = XML.join('');
                XML = XML.replace(/[<>&"]/g, function (c) {
                    var character = {
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        '&': '&amp;'
                    };

                    return character[c];
                });

                XML = XML.replace(/\[br\]/g, '<br />');
                var XMLStr = '<pre>' + XML + '</pre>';
                console.log(XMLStr); //TODO: Remove from PROD
                $(XMLStr).appendTo(el);
                return true;
            }
            return false;
        },

        /**utility functions that aid the ferrand Key Value app
         * @namespace
         */
        utils: {
            /**
             * Higher order forEach function, performs the action on each element in Array
             * @param arr {Array}
             * @param action {Function}
             */
            forEach: function (arr, action) {
                if (typeof arr === 'string' || this.isArray(arr)) {
                    for (var i = 0, len = arr.length; i < len; i++) {
                        action(arr[i]);
                    }
                }

            },

            /**
             * Returns true of val is an Array, even if val is in an iFrame i.e. different global execution context
             * @param val The value to test
             * @returns {boolean}
             */
            isArray: function (val) {
                return Object.prototype.toString.call(val) === '[object Array]';
            },

            /**
             * returns true if val is a number, will exclude non-numeric values including bool, infinity etc
             * @param val The value to test
             * @returns {boolean}
             */
            isNumeric: function (val) {
                return !isNaN(parseFloat(val)) && isFinite(val);
            },

            /**
             *
             * @param prop {string} The property to compare against
             * @returns {Function} The comparator function, used in Array.sort, returns 0 if equal, uses localCompare to
             * better sort things like a < A. If different types, use typeof as a measure
             */
            createComparator: function (prop) {
                return function (objA, objB) {
                    var store1 = objA[prop];
                    var store2 = objB[prop];

                    if (store1 === store2) {
                        return 0;
                    }

                    if (typeof store1 === typeof store2) {
                        if (typeof store1 === 'string') {
                            return store1.localeCompare(store2);
                        }
                        return store1 < store2 ? -1 : 1;
                    }

                    return typeof store1 < typeof store2 ? -1 : 1;
                }
            },

            /**
             * Take a thrown error object e and output to UI element out
             * @param e
             * @param out {*|jQuery|HTMLElement} The element to append notification to
             */
            handleError: function (e, out) {
                out.show();
                out.html('<span>' + e.name + '<br />' + e.message + '</span>');
                setTimeout(function () {
                    out.children().fadeOut();
                    out.slideUp('slow');
                }, 10000);
            }
        },

        /**
         * Initialization steps
         * DOM elements needed for user interaction
         */
        start: function () {
            var addKVButton = $('input#kvAdd');
            var deleteKVButton = $('input#kvDelete');
            var sortKVButton = $('input.kvSort');
            var showXML = $('#kvShowXML');
            var kvInput = $('#kvInput');
            var notifications = $('.kv-error-notification');
            var xmlOutput = $('#kvXML');

            /**
             * Bind to enter key on name value input element
             */
            kvInput.bind({'keypress': function (e) {
                e.keyCode === 13 && addKVButton.click();
            }});

            if (addKVButton.length === 1) {
                addKVButton.click(function (e) {
                    e.preventDefault();

                    /**
                     * Exception handling for name value input
                     */
                    try {
                        ferrandApp.addKeyValue(ferrandApp.getInput());
                    } catch (e) {
                        //console.log(e.name + '\n' + e.message); //TODO:Remove from PROD
                        ferrandApp.utils.handleError(e, notifications);
                    }
                    ferrandApp.setInput('');
                });
            }

            if (deleteKVButton.length === 1) {
                deleteKVButton.click(function (e) {
                    e.preventDefault();
                    var selected = ferrandApp.getSelected();

                    if (selected.length > 0) {
                        ferrandApp.removeKeyValue(selected);
                    }
                });
            }

            if (sortKVButton.length > 0) {
                sortKVButton.click(function (e) {
                    e.preventDefault();

                    switch (true) {
                        case this.value.toLocaleLowerCase() === 'sort by name':
                            ferrandApp.sortKeyValueBy('name');
                            break;
                        case this.value.toLocaleLowerCase() === 'sort by value':
                            ferrandApp.sortKeyValueBy('value');
                            break;
                        default :
                            ferrandApp.sortKeyValueBy('id');
                            break;
                    }
                });
            }

            if (showXML.length > 0) {
                showXML.click(function (e) {
                    e.preventDefault();

                    $(this).val(ferrandApp.renderXML(ferrandApp.buildXML(), xmlOutput) ? 'Reload XML' : 'Show XML');
                });
            }
        }
    }
})();

/**
 * @@Application start
 * The application is run on DOM ready
 */
$(ferrandApp.start);

