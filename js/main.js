;
(function ($, document, window, undefined) {
    $(document).ready(function () {
        $('.flipboard').each(function () {
            var $this = $(this),
                this_opts = $this.data('flip-option'),
                opts = JSON.parse(JSON.stringify(ZJQ.flipboard_default_options))
            ;
            if (this_opts in ZJQ.flipboard_options) {
                $.extend(opts, ZJQ.flipboard_options[this_opts]);
            }
            $this.flapper(opts).change();
        });
    });
})
(jQuery, document, window);