window.onload = function () {
    var decodeData = function(encodedData) {
        if (encodedData.length > 1) {
            var encodingType = encodedData[0];
            encodedData = encodedData.slice(1);
            if ('a' == encodingType) {
                return atob(encodedData);
            }
            if ('e' == encodingType) {
                return unescape(atob(encodedData));
            }
        }
        return '';
    };
    var encodeData = function(data) {
        if (!data.length) return '';
        // try btoa() for ascii
        try {
            var encodedData = btoa(data);
            if (atob(encodedData) == data) {
                return 'a' + encodedData;
            }
        } catch (e) {}
        
        // failed, do escape() for unicode
        return 'e' + btoa(escape(data));
    };
    
    var inputEl = document.getElementById('input');
    if (window.location.hash.length) {    
        try {
            //var encodedData = window.location.hash.slice(1);
            inputEl.value = decodeData(window.location.hash.slice(1));
            //inputEl.value = unescape(atob(window.location.hash.slice(1)));
        } catch(e) {}
    }
    
    inputEl = inputEl.replace(",", ".");
    
    var outputEl = document.getElementById('output');

    var warningEl = document.getElementById('warning');
    var shareEl = document.getElementById('share');
    var tinyurlEl = document.getElementById('tinyurl');
    tinyurlEl.onclick = function() {
        shareEl.value = window.location.href;
        return true;
    }

    var oldValue = null;
    var oldSelectionStart = null;
    var handler = function () {
        var newValue = inputEl.value;
        if (newValue !== oldValue) {
            oldValue = newValue;
            setTimeout(recalc, 0);
            window.location.hash = encodeData(newValue);
        }

        var newSelectionStart = inputEl.selectionStart;
        if (newSelectionStart !== oldSelectionStart) {
            oldSelectionStart = newSelectionStart;
            setTimeout(recalc, 0);
            window.location.hash = encodeData(newValue);
        }

        if (window.location.href.length > 2000) {
            warningEl.style.display = '';
        } else {
            warningEl.style.display = 'none';
        }

        if (input.scrollTop !== output.scrollTop) {
            output.scrollTop = input.scrollTop;
        }
    };

    inputEl.onkeydown = handler;
    inputEl.onkeyup = handler;
    setInterval(handler, 50);

    outputEl.scrollTop = inputEl.scrollTop;
    inputEl.onscroll = function () {
        outputEl.scrollTop = inputEl.scrollTop;
    };

    inputEl.select();
}

function recalc() {
    var scope = {};
    var output = [];

    var inputEl = document.getElementById('input');
    var input = inputEl.value.split("\n");


    if (input.length === 1) {
        var selectedLine = 1;
    } else {
        var match = inputEl.value.substr(0, inputEl.selectionStart).match(/\n/g);
        if (!match) {
            var selectedLine = 1;
        } else {
            var selectedLine = inputEl.value.substr(0, inputEl.selectionStart).match(/\n/g).length + 1;
        }
    }

    input.forEach(function (line, index) {
        if (line.trim() === '') {
            output.push({
                type: 'empty',
            });
        } else {
            var length = line.length;

            try {
                var value = math.eval(line, scope).toString();
            } catch (e) {
                output.push({
                    type: 'error',
                    length: length,
                    value: e,
                    mute: index + 1 === selectedLine,
                });
                return;
            }

            if (value.substr(0, 8) === 'function') {
                value = value.substring(9, value.indexOf('{') - 1);
                output.push({
                    type: 'function',
                    length: length,
                    value: value,
                });
            } else {
                output.push({
                    type: 'value',
                    length: length,
                    value: value,
                });
            }
        }
    });

    var outputEl = document.getElementById('output');
    outputEl.innerHTML = '';
    output.forEach(function (line) {
        if (line.type === 'empty') {
            outputEl.innerHTML += '<div class="clear">&nbsp;</div>';
        } else if (line.type === 'value') {
            var comment = '<span class="comment">= </span>';
            var spaces = '';
            for (var s = 0; s <= line.length; s++) spaces += ' ';
            outputEl.innerHTML += '<div class="value">' + spaces + comment + line.value + '</div>';
        } else if (line.type === 'function') {
            var comment = '<span class="comment">fn</span>';
            var spaces = '';
            for (var s = 0; s <= line.length; s++) spaces += ' ';
            outputEl.innerHTML += '<div class="function">' + spaces + comment + '</div>';
        } else if (line.type === 'error') {
            if (line.mute) {
                outputEl.innerHTML += '<div class="clear">&nbsp;</div>';
            } else {
                var comment = '<span class="comment">// </span>';
                var spaces = '';
                for (var s = 0; s <= line.length; s++) spaces += ' ';
                outputEl.innerHTML += '<div class="error">' + spaces + comment + line.value + '</div>';
            }
        }
    });
}
