;
var ZJQ = ZJQ || {};
(function ($, document, window, Math, undefined) {
  let Z = ZJQ;

  /* For debugging only.  Remove, or set to false for production */
  Z.debug_logger = true;

  /* a console logger */
  Z.log = function () {
    if (Z.debug_logger && arguments.length) {
      for (let i = 0; i < arguments.length; i++) {
        console.log(arguments[i]);
      }
    }
  };

  Z.jqxhr = {};

  // default options for the flipboard library
  Z.flipboard_default_options = {
    width: 5,             // number of digits
    align: 'left',       // aligns values to the left or right of display
    padding: '&nbsp;',    // value to use for padding
    chars_preset: 'alphanum',  // 'num', 'hexnum', 'alpha' or 'alphanum'
    timing: 250,          // the maximum timing for digit animation
    min_timing: 10,       // the minimum timing for digit animation
    threshhold: 100      // the point at which Flapper will switch from
  };
  // Keep track of background colors for products.
  Z.last_random_color = false;
  // Use-specific option overrides for flipboard library.
  Z.flipboard_options = {
    date_month: {
      width: 3,
      chars_preset: 'alpha'
    },
    date_day: {
      width: 2,
      chars_preset: 'num'
    },
    date_year: {
      width: 4,
      chars_preset: 'num'
    },
    origin: {
      width: 16,
      chars_preset: 'alphanum'
    },
    arrival: {
      width: 5,
      chars_preset: 'num',
      align: 'right'
    },
    source: {
      width: 4,
      chars_preset: 'alpha'
    }
  };

  // Helper function to generate random colors from a palette or scheme.
  Z.randomColor = function () {
    let num_colors = 9;
    do {
      new_color = Math.floor(Math.random() * num_colors) + 1;
    } while (new_color == Z.last_random_color);
    Z.last_random_color = new_color;
    return new_color;
  };

  Z.trim = function (s, c) {
    if (c === "]") c = "\\]";
    if (c === "\\") c = "\\\\";
    return s.replace(new RegExp(
        "^[" + c + "]+|[" + c + "]+$", "g"
    ), "");
  };

  Z.getTemplate = function (t) {
    return $('#template-' + t + ' > div').first().clone();
  };

  Z.showProductOverlay = function ($ele) {
    let id = $ele.data('id'),
        cid = $ele.closest('.category-item-container').data('id')
    ;
    if (id && cid) {
      Z.api.execute('product_overlay', cid, id);
    }
  };


  /* Simple management of AJAX calls
 This handler utilizes the request cache ZJQ.jqxhr, and formats an
 AJAX request to include fields required by the server.  It also
 sets a method (default POST), a default dataType, and replaces the
 .complete callback with a custom handler.  Any current assignment
 of .complete is cached.  All AJAX parameters except .complete can
 be overridden by passing an options object.
 n = name of this AJAX call
 o = custom options to override defaults, see jQuery's .ajax() options
 cb = a callback to add to the end of the .complete chain
 */
  Z.doAjax = function (n, o, cb) {
    n = n || 'default';
    o = o || {type: 'POST'};
    let t = (o.type ? o.type : 'POST'),
        allcb = Z.prepareCallback(o.complete)
    ;
    if (Z.jqxhr[n]) {
      try {
        Z.jqxhr[n].abort();
      } catch (e) {
      }
      Z.jqxhr[n] = null;
    }
    (($.isArray(cb)) ? cb : [cb]).forEach(function (v, k) {
      if (v) {
        allcb.push(v);
      }
    });
    let oo = $.extend({type: t, dataType: 'json'}, o, {complete: Z.handlerDoAjax});
    Z.jqxhr[n] = $.ajax(oo);
    Z.jqxhr[n].userHandler = allcb;
  };

  /* In case an AJAX call fails
     m = a message to use in the alert
     */
  Z.failAlert = function (m) {
    alert(m);
  }

  /* handler for general AJAX
     A custom AJAX return handler.  When an AJAX call is executed
     through ZJQ.doAjax(), this handler is called before any other
     handlers in the .complete property.  After error checking the
     response, any other cached handlers (.complete, followed by
     the custom callback, see ZJQ.doAjax) are called in order.
     The function signature is as required for $.ajax.complete.
     */
  Z.handlerDoAjax = function (r, s) {
    var $this = this;
    Z.log('===AJAX response JSON', r.responseJSON);
    if (!r.responseJSON || r.status != 200 || r.statusText != 'OK') {
      Z.log('AJAX call failed! (' + s + ")", r.statusText + ' (' + r.status + ')');
    }
    if (r.userHandler && r.userHandler.length) {
      r.userHandler.forEach(function (v, i) {
        if (v && typeof(v) == 'function') {
          v.call($this, r, s);
        }
      });
    } else {
      Z.log('---AJAX call has no custom handlers');
    }
  }

  Z.prepareCallback = function (ref, cb) {
    let o = ref ? ($.isArray(ref) ? ref : [ref]) : [];
    if (cb) {
      (($.isArray(cb)) ? cb : [cb]).forEach(function (v, k) {
        if (v) {
          o.push(v);
        }
      });
    }
    return o;
  }

})(jQuery, document, window, Math);