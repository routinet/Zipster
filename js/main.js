;
(function ($, document, window, undefined) {
  $(document).ready(function () {
    // Set the background colors for any product containers.
    //$('.product-item-container').each(function () {
      /* $(this).css('background-color', ZJQ.randomColor());*/
    //  $(this).addClass('product-color-' + ZJQ.randomColor());
    //});

    // Handle account page navigation
    $('#account-nav').on('click', 'li', function () {
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
    $('tr:first-child .flipboard').each(function () {
    //$('tr .flipboard').each(function () {
      var $this = $(this),
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
      //ZJQ.getProductCatalog();
      ZJQ.api.execute('catalog');
    }

    // Hook the click event for products
    $('body').on('click', '.product-item-container', function(e){
      let $e = $(e.target);
      if (!$e.hasClass('product-item-container')) {
        $e = $e.closest('.product-item-container');
      }
      ZJQ.showProductOverlay($e);
    });

    // Hook to close the product overlay
    $('body').on('click', '.product-overlay-close', function(e) {
      $(e.target).closest('.product-overlay-container').remove();
    })

    // Hook to handle plus/minus clicks on "Add to cart"
    $('body').on('click', '.add-to-cart-icon', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      let $e = $(e.target),
          $target = $e.closest('form').find('.add-to-cart-quantity'),
          val = parseInt($target.val());
      if ($e.hasClass('minus-icon')) {
        val--;
        if (val < 1) { val = 1; }
      }
      else if ($e.hasClass('plus-icon')) {
        val++;
      }
      $target.val(val);
    });

    // Prevent the cart from showing on the landing page.
    $('body#landing-page').addClass('no-cart');

    // Hook to show/hide the cart.
    $('body').on('click', '#order-now-link', function(e) {
      if (!$('body').hasClass('no-cart')) {
        e.preventDefault();
        $('body').toggleClass('show-cart');
      }
    })
  });
})
(jQuery, document, window);