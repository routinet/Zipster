;
var ZJQ = ZJQ || {};
(function ($, document, window, undefined) {
    ZJQ.flipboard_default_options = {
        width: 5,             // number of digits
        align: 'left',       // aligns values to the left or right of display
        padding: '&nbsp;',    // value to use for padding
        chars_preset: 'alphanum',  // 'num', 'hexnum', 'alpha' or 'alphanum'
        timing: 250,          // the maximum timing for digit animation
        min_timing: 10,       // the minimum timing for digit animation
        threshhold: 100      // the point at which Flapper will switch from
    };
    ZJQ.flipboard_options = {
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
            width:16,
            chars_preset: 'alphanum'
        },
        arrival: {
            width:5,
            chars_preset: 'num',
            align: 'right'
        },
        source: {
            width:4,
            chars_preset: 'alpha'
        }
    };
})(jQuery, document, window);