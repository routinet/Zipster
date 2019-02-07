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

        // Hook to show/hide the cart.
        .on('click', '#order-now-link', function (e) {
          if (!$body.hasClass('no-cart')) {
            e.preventDefault();
            ZJQ.showCartSidebar();
          }
        })

        // Hook to add selection to cart.
        .on('click', '.add-to-cart-submit', function (e) {
          ZJQ.add_to_cart($(e.target));
        })

        //Hook to delete selection from cart.
        .on('click', '.cart-item-remove', function (e) {
          ZJQ.delete_from_cart($(e.target));
        })

        // Hook to handle sign-in submission.
        .on('submit', '.sign-in-credentials', function (e) {
          e.preventDefault();
          let $e = $(e.target),
              name = $e.find('input[name="sign-in-email"]').val(),
              pass = $e.find('input[name="sign-in-password"]').val();
          ZJQ.api.execute('sign_in', name, pass);
        })

        // Hook to submit create account form.
        .on('submit', '#create-account-form', function (e) {
          e.preventDefault();
          let $e = $(e.target),
              name = $e.find('input[name="name"]').val(),
              lname = $e.find('input[name="lastname"]').val(),
              email = $e.find('input[name="email"]').val(),
              pass = $e.find('input[name="password"]').val(),
              passc = $e.find('input[name="password_confirmation"]').val(),
              mobile = $e.find('input[name="mobile"]').val();
          ZJQ.api.execute('create_account', name, lname, email, pass, passc, mobile);
        })

        // Hook to delete an address.
        .on('click', '.account-address-item-delete', function(e) {
          let $e = $(e.target),
              id = $e.closest('.address-list-item').data('id');
          ZJQ.api.execute('account_delete_address', id);
        })

        // Hook to save a new address.
        .on('click', '#account-add-address', function(e) {
          let $e = $(e.target),
              $top = $e.closest('.address-list-item'),
              title = $top.find('input[name="address-name"]').val(),
              addr = $top.find('input[name="address-street"]').val(),
              apt = $top.find('input[name="address-apt"]').val(),
              zip = $top.find('input[name="address-zip"]').val(),
              phone = $top.find('input[name="address-phone"]').val();
          ZJQ.api.execute('account_add_address', title, addr, apt, zip, phone);
        })
    ;

    // If on the landing page, suppress the cart.  Otherwise, populate it.
    if (ZJQ.no_cart.includes(ZJQ.body_id.replace('-page', ''))) {
      $body.addClass('no-cart');
    }
    else {
      ZJQ.api.execute('get_cart');
    }

    // If on the account page, populate the address list and user info.
    if ($body.attr('id') == 'account-page') {
      $body.find('input[name="account-full-name"]').val(ZJQ.user_data.name + ' ' + ZJQ.user_data.lastname);
      $body.find('input[name="account-email"]').val(ZJQ.user_data.email);
      ZJQ.api.execute('account_address_list');
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
