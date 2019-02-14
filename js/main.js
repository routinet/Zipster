;
(function ($, document, window, undefined) {
  $(document).ready(function () {
    let $body = $('body');

    ZJQ.body_id = $body.attr('id');

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

        // Hook to show/hide side menu for mobile.
        .on('click', '#main-nav', function (e) {
          $body.toggleClass('show-side-menu');
        })

        // Hook to show/hide the cart.
        .on('click', '#order-now-link', function (e) {
          if ($body.hasClass('allow-cart')) {
            e.preventDefault();
            ZJQ.showCartSidebar();
          }
        })

        // Hook to add selection to cart.
        .on('click', '.add-to-cart-submit', function (e) {
          e.preventDefault();
          ZJQ.add_to_cart($(e.target));
        })

        //Hook to delete selection from cart.
        .on('click', '.cart-item-remove', function (e) {
          e.preventDefault();
          ZJQ.delete_from_cart($(e.target));
        })

        // Hook to flip visibility on checkout delivery.
        .on('click', 'input[name="address_id"]', function (e) {
          let id = e.target.id;
          $('.address-new,.address-pickup-text').removeClass('active');
          if (id == 'address_id_new') {
            $('.address-new').addClass('active');
          }
          else if (id == 'address_id_pickup') {
            $('.address-pickup-text').addClass('active');
          }
        })
    ;

    // If the page allows the cart, set a flag.
    if (ZJQ.allow_cart()) {
      $body.addClass('allow-cart');
    }

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

    // Set the background colors for any product containers.
    $('.product-list-container .product-item-container').each(function () {
      $(this).addClass('product-color-' + ZJQ.randomColor());
    });

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

  });
})
(jQuery, document, window);
