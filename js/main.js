;
(function ($, document, window, undefined) {
    $(document).ready(function () {
        // Set the background colors for any product containers.
        $('.product-item-container').each(function () {
            $(this).css('background-color', ZJQ.randomColor());
        });

        // Handle account page navigation
        $('#account-nav').on('click', 'li', function(){
            var $this = $(this),
                target = $this.data('target')
            ;
            $('#account-nav li').removeClass('active');
            $this.addClass('active');
            $('#account-page main section').hide(0);
            $('section#' + target).show(0);
        });
        $('#account-nav li.active').trigger('click');

        // Light up the flipboards
        // **** LIMITED TO THE DATE FIELD FOR PERFORMANCE ****
        // $('.flipboard').each(function () {
        $('.todays-date .flipboard').each(function () {
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