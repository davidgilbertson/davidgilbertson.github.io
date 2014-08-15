'use strict';
//TODO IE8 support with polyfill, either of these:
//https://github.com/luwes/selection-polyfill
//https://github.com/timdown/rangy

//Also json3

window.TPYO = (function() {
  /*  --  Private  --  */

  var initialised = false
    , typoBoxWrapper
    , typoBoxTitleWrapper
    , typoBoxSubTitle
    , typoBoxClose
    , typoBoxText
    , typoBoxMessageWrapper
    , typoBoxMessage
    , typoBoxSubmit
    , range
    , selectedText
    , UID = 'q8dj347' //Truly random string (typed with my eyes closed);
    , dragOffsetX
    , dragOffsetY
    , config = {
        pos: 'fixed',
        top: 10,
        right: 10,
        left: null,
        bottom: null,
        font: 'helvetica, arial, san-serif',
        placeholder: 'Suggested correction (or just hit "Report a typo"!)'
      }
    ;

  function getNearestId(el) {
    //TODO go up till I get an ID.
  }


  function reportTypo() {
    var load = 'paragraphNum=' + 1;
    load += '&wordNum=' + 1;
    load += '&text=' + selectedText;
    load += '&comments=' + typoBoxMessage.value;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'log.php', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4 || xhr.status !== 200) { return; }
      if (xhr.responseText.err) {
        console.log(xhr.responseText.err);
      } else {
        console.log('Logged. Response:', xhr.responseText);
      }
      closeBox();
      typoBoxMessage.value = '';
    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(load);
  }


/*  --  Event Handlres  --  */

  function bindEvent(el, type, cb) {
    if (el.addEventListener) {
      el.addEventListener(type, cb, false);
    }
    else {
      el.attachEvent(type, cb);
    }
  }
  function unbindEvent(el, type, func) {
    if (el.removeEventListener) {
      el.removeEventListener(type, func);
    }
    else {
      el.detachEvent(type, func); //TODO is this right?
    }
  }
  
  function mouseup(e) {
    range = window.getSelection().getRangeAt();
    if (range.toString() === '') { return; }
    if (e.target.id.match(new RegExp(UID))) { return; } //He's one of ours!
    if (!initialised) { init(); }
    
    selectedText = range.toString();
    typoBoxText.innerHTML = selectedText;

    window.setTimeout(function() { //give the dom el time to create so it slides down.
      typoBoxWrapper.style.opacity = 1;
    }, 20);
  }

  function dragStart(e) {
    dragOffsetX = e.offsetX; //TODO browser support?
    dragOffsetY = e.offsetY;
    bindEvent(window, 'mousemove', dragMove);
    bindEvent(window, 'mouseup', dragEnd);
  }
  function dragMove(e) {
    e.preventDefault();
    typoBoxWrapper.style.left = e.x - dragOffsetX + 'px';
    typoBoxWrapper.style.top = e.y - dragOffsetY + 'px';
  }
  function dragEnd() {
    unbindEvent(window, 'mousemove', dragMove);
    unbindEvent(window, 'mouseup', dragEnd);
  }

  function closeBox() {
    typoBoxWrapper.style.opacity = 0;
  }

  function newEl(type) {
    var newEl = document.createElement(type);
    newEl.id = UID + Math.random().toString().slice(2,8);
    return newEl;
  }

  function toCssString(obj) {
    var returnString = ''
      , prop;
    for (prop in obj) {
      returnString += prop + ':' + obj[prop] + ';';
    }
    return returnString;
  }




/*  --  Build the dom + bind events  --  */
  function init() {
    //NB: specifically avoiding <p>, <h1>, etc to best avoid any host page styling (so text is in <div>s)
    
    typoBoxWrapper = newEl('div');
    var cssText = {
      'width': '300px',
      'height': '300px',
      'bottom': '10px',
      'right': '10px',
      'opacity': 0,
      'color': '#eee',
      'position': 'fixed',
      'transition': 'opacity 100ms',
      'background-image': 'repeating-linear-gradient(-40deg, #666 0, #BBB 4px, #666 8px, #666 10px)',
      'box-shadow': '0 0 20px rgba(0, 0, 0, 0.5)',
      'border-radius': '2px',
      'backface-visibility': 'hidden'
    };
    typoBoxWrapper.style.cssText = toCssString(cssText);

    typoBoxTitleWrapper = newEl('div');
    typoBoxTitleWrapper.innerHTML = 'Tpyo';
    typoBoxTitleWrapper.style.cssText = toCssString({
      'background': '#111',
      'background-color': 'rgba(0, 0, 0, 0.9)',
      'padding': '5px 0 0 10px',
      'font-size': '25px',
      'height': '50px',
      'border-radius': '2px 2px 0 0',
      'cursor': 'move'
    });

    typoBoxSubTitle = newEl('div');
    typoBoxSubTitle.innerHTML = 'Crowdsourced corrections';
    typoBoxSubTitle.style.cssText = toCssString({
      'color': '#AAA',
      'font-size': '10px'
    });

    typoBoxTitleWrapper.appendChild(typoBoxSubTitle);

    typoBoxClose = newEl('div');
    typoBoxClose.innerHTML = '×';
    typoBoxClose.style.cssText = toCssString({
      'position': 'absolute',
      'top': '0',
      'right': '0',
      'width': '50px',
      'height': '50px',
      'font-size': '40px',
      'line-height': '50px',
      'text-align': 'center',
      'color': '#eee',
      'cursor': 'pointer'
    });

    typoBoxText = newEl('div');
    typoBoxText.style.cssText = toCssString({
      'background': '#555',
      'background-color': 'rgba(51, 51, 51, 0.95)',
      'height': '100px',
      'overflow-y': 'auto',
      'padding': '7px',
      'font-size': '14px'
    });

    typoBoxMessageWrapper = newEl('div');
    typoBoxMessageWrapper.style.cssText = toCssString({
      'height': '100px'
    });
    typoBoxMessage = newEl('textarea');
    typoBoxMessage.placeholder = config.placeholder;
    typoBoxMessage.style.cssText = toCssString({
      'width': '100%',
      'height': '100%',
      'font-family': config.font,
      'padding': '5px',
      'font-size': '14px',
      'background': '#FFF',
      'resize': 'none'
    });
    typoBoxMessageWrapper.appendChild(typoBoxMessage);

    typoBoxSubmit = newEl('div');
    typoBoxSubmit.innerHTML = 'Report a typo';
    typoBoxSubmit.style.cssText = toCssString({
      'transition': '200ms',
      'height': '50px',
      'padding': '13px',
      'font-size': '20px',
      'text-align': 'center',
      'cursor': 'pointer',
      'background': '#AAA',
      'background-color': 'rgba(150, 150, 150, 0.93)',
      'color': '#FFF',
      'border-radius': '0 0 2px 2px'
    });
    

    typoBoxWrapper.appendChild(typoBoxTitleWrapper);
    typoBoxWrapper.appendChild(typoBoxClose);
    typoBoxWrapper.appendChild(typoBoxText);
    typoBoxWrapper.appendChild(typoBoxMessageWrapper);
    typoBoxWrapper.appendChild(typoBoxSubmit);

    document.body.appendChild(typoBoxWrapper);

    bindEvent(typoBoxClose, 'click', closeBox);
    bindEvent(typoBoxSubmit, 'click', reportTypo);
    bindEvent(typoBoxTitleWrapper, 'mousedown', dragStart);
    bindEvent(typoBoxSubmit, 'mouseover', function() {
      this.style.backgroundColor = 'rgba(100, 100, 100, 0.95)';
    });
    bindEvent(typoBoxSubmit, 'mouseout', function() {
      this.style.backgroundColor = 'rgba(150, 150, 150, 0.93)';
    });
    
    initialised = true;
  }

  bindEvent(window, 'mouseup', mouseup);

  /*  --  Public  --  */
  var tpyo = {};

  tpyo.setConfig = function(configObject) {
    var prop;
    for (prop in configObject) {
      if (configObject[prop]) {
        config[prop] = configObject[prop];
      } //TODO if null passed in reset to default?
    }
  }

  tpyo.getConfig = function() {
    return config;
  }

//   window.TPYO = tpyo;
  return tpyo;

})();
