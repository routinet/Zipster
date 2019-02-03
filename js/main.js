;
(function ($, document, window, undefined) {
  $(document).ready(function () {
    let $body = $('body');

    // All hooks delegated through body element.
    $body
        // Hook the click event for products
        .on('click', '.product-item-container', function (e) {
          let $e = $(e.target);
          if (!$e.hasClass('product-item-container')) {
            $e = $e.closest('.product-item-container');
          }
          ZJQ.showProductOverlay($e);
        })

        // Hook to close the product overlay
        .on('click', '.product-overlay-close', function (e) {
          $(e.target).closest('.product-overlay-container').remove();
        })

        // Hook to handle plus/minus clicks on "Add to cart"
        .on('click', '.add-to-cart-icon', function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          let $e = $(e.target),
              $target = $e.closest('form').find('.add-to-cart-quantity'),
              val = parseInt($target.val());
          if ($e.hasClass('minus-icon')) {
            if (--val < 1) {
              val = 1;
            }
          }
          else if ($e.hasClass('plus-icon')) {
            val++;
          }
          $target.val(val);
        })

        // Hook to show/hide the cart.
        .on('click', '#order-now-link', function (e) {
          if (!$body.hasClass('no-cart')) {
            e.preventDefault();
            $body.toggleClass('show-cart');
          }
        })
    ;

    // Prevent the cart from showing on the landing page.
    $('body#landing-page').addClass('no-cart');


    // Handle account page navigation
    $('#account-nav').on('click', 'li', function () {
      let $this = $(this),
          target = $this.data('target')
      ;
      $('#account-nav li').removeClass('active');
      $this.addClass('active');
      $('#account-page main section').hide(0);
      $('section#' + target).show(0);
    });
    $('#account-nav li.active').trigger('click');

    // Light up the flipboards
    $('tr:first-child .flipboard').each(function () {
    //$('tr .flipboard').each(function () {
      let $this = $(this),
          this_opts = $this.data('flip-option'),
          opts = JSON.parse(JSON.stringify(ZJQ.flipboard_default_options))
      ;
      if (this_opts in ZJQ.flipboard_options) {
        $.extend(opts, ZJQ.flipboard_options[this_opts]);
      }
      $this.flapper(opts).change();
    });

    // Populate products and categories if a menu block exists.
    if ($('.category-list-container').length) {
      ZJQ.api.execute('catalog');
    }

  });
})
(jQuery, document, window);
