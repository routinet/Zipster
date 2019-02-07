;
var ZJQ = ZJQ || {};
(function ($, document, window, Math, undefined) {
  ZJQ.api = ZJQ.api || {};
  let Z = ZJQ, A = ZJQ.api;

  /**
   * Build out all the API-related functions and properties.
   */

  A.defaults = {
    method: "GET",
    host: "staging.zokusushi.com",
    path_prefix: "api/v1/mobile",
    use_ssl: true,
    api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.WyJ5bFRGRnlGK2NDWGNFcmtVNnhwZ3ViYkJTeExsaUdjbHBSM2hIaSt4d1JZay95U0tkQUw2SktXWVY0OTdBT2RDZy91MXBOcUdoS1FnUVNueVVsb0dWQT09Il0.fpfrOVQWRw2969sY9Z9KcmXC27DAPXMkzlsOODVvDW4'
  };

  A.definitions = {
    catalog: {
      name: 'cities/NYC/stores/ZS/menus/all/items',
    },
    product: {
      name: 'cities/NYC/stores/ZS/menus/{1}/items/{2}'
    },
    product_overlay: {
      name: 'cities/NYC/stores/ZS/menus/{1}/items/{2}'
    },
    get_cart: {
      auth_required: true,
      name: 'cities/NYC/stores/ZS/cart',
    },
    add_cart: {
      auth_required: true,
      name: 'cities/NYC/stores/ZS/items/{1}/cart/add',
      method: 'POST',
      data: {quantity: 2},
    },
    sign_in: {
      name: 'customers/login',
      method: 'POST',
      data: {email: 1, password: 2},
    },
    create_account: {
      name: 'customers/new',
      method: 'POST',
      data: {name: 1, lastname: 2, email: 3, password: 4, password_confirmation: 5, mobile: 6},
    },
    address_list: {
      auth_required: true,
      name: 'customers/addresses',
    },
    account_address_list: {
      auth_required: true,
      name: 'customers/addresses',
    },
    account_delete_address: {
      auth_required: true,
      name: 'customers/addresses/{1}',
      method: 'DELETE',
    },
    account_add_address: {
      auth_required: true,
      name: 'customers/addresses/new',
      method: 'POST',
      data: {title: 1, address: 2, number: 3, zipcode: 4, contact_info: 5},
      alter: 'account_add_address_alter',
    },
  };

  A.buildApiUrl = function (req, params) {
    let ret = '',
        c = A.definitions[req];
    if (c) {
      let d = A.defaults,
          r = A.processParams(Z.trim(c.name, '/'), params),
          use_ssl = c.hasOwnProperty('use_ssl') ? !!c.use_ssl : d.use_ssl,
          protocol = 'http' + (use_ssl ? 's' : ''),
          host = c.hasOwnProperty('host') ? c.host : d.host,
          path = c.hasOwnProperty('path') ? c.path : d.path_prefix
      ;
      ret = protocol + '://' + Z.trim(host, '/') + '/' + Z.trim(path, '/') + '/' + r;
    }
    return ret;
  };

  A.processParams = function (name, params) {
    if ($.isArray(params) && params.length) {
      name = name.replace(/\{(\d+)\}/g, function (t) {
        return params[(arguments[1] - 1)] || t;
      });
    }
    return name;
  };

  A.resolveAuth = function () {
    // if no cookie exists, forward to sign-in page
    let token = document.Cookies.getItem('token');
    if (!(token || $('body').hasClass('no-cart'))) {
      window.location.href = '/sign-in.html'
    }
    return token ? 'Bearer ' + token : '';
  };

  A.setAuth = function (d) {
    let a = false;
    if (d.hasOwnProperty('auth_token')) {
      document.Cookies.setItem('token', d.auth_token, 86400, '/', null, true);
      delete d.auth_token;
      a = true;
    }
    ZJQ.user_data = d || {};
    return a;
  };

  A.execute = function (call) {
    if (A.definitions.hasOwnProperty(call)) {
      let c = A.definitions[call],
          params = [...arguments].slice(1),
          auth = c.hasOwnProperty('auth_required') ? !!c.auth_required : false,
          method = c.hasOwnProperty('method') ? c.method : A.defaults.method,
          options = {
            url: A.buildApiUrl(call, params),
            complete: Z.prepareCallback(A.handlers[call]),
            type: method,
            data: {},
            headers: {
              AppVersion: A.defaults.api_key,
            }
          }
      ;
      if (c.data) {
        for (let p in c.data) {
          if (c.data.hasOwnProperty(p)) {
            options.data[p] = params[c.data[p] - 1];
          }
        }
      }
      if (c.complete) {
        options.complete = Z.prepareCallback(options.complete, c.complete);
      }
      if (auth) {
        options.headers.Authorization = A.resolveAuth();
      }
      if (c.alter && typeof(A.handlers[c.alter]) == 'function') {
        options = A.handlers[c.alter](options);
      }
      Z.doAjax(call, options);
    }
  };

  /**
   * Build out the API return handlers.
   */

  A.handlers = {
    catalog: function (r) {
      let data = r.responseJSON,
          $toptarget = $('.category-list-container'),
          $ul = $('<ul/>'),
          $menu = $('<nav/>').addClass('menu-nav-container').append($ul)
      ;
      $toptarget.empty();

      // Build the category elements.
      $.each(data, function (i, v) {
        if (v.included_items.length) {
          let $ele = A.render.catalog(v),
              $target = $ele.find('.product-list-container')
          ;
          // Build the product elements within this category.
          $.each(v.included_items, function (i, v) {
            $target.append(A.render.product(v));
          });
          $toptarget.append($ele.hide());

          // Add the category nav menu item.
          let $name = $ele.find('.category-item-title').text(),
              $short = $ele.data('menu_name'),
              $link = $('<a/>').attr('href', '#' + $ele.attr('id')).html($short),
              $li = $('<li/>').html($link).addClass('menu-nav-link')
          ;
          $ul.append($li);
        }
      });

      $('.menu-nav-link', $ul).first().addClass('active');

      $('header#top-header').append($menu);

      $('.category-item-container').show(750);
    },

    product_overlay: function (r) {
      $('body').append(A.render.product_overlay(r));
    },

    sign_in: function (r) {
      if (A.setAuth(r.responseJSON)) {
        window.history.go(-1);
      }
      else {
        A.render.sign_in_fail();
      }
    },

    get_cart: function (r) {
      A.render.cart(r.responseJSON);
    },

    add_cart: function (r) {
      A.handlers.get_cart(r);
      ZJQ.showCartSidebar(true);
    },

    create_account: function (r) {
      if (A.setAuth(r.responseJSON)) {
        window.history.go(-1);
      }
      else {
        alert('CREATE ACCOUNT FAILED');
      }
    },

    address_list: function (r) {
      A.render.address_list('checkout', r.responseJSON);
    },

    account_address_list: function (r) {
      A.render.address_list('account', r.responseJSON);
    },

    account_delete_address: function (r) {
      alert('done delete address');
    },

    account_add_address: function (r) {
      alert('done add address');
    },

    account_add_address_alter: function (o) {
      o.contentType = 'application/json';
      o.processData = false;
      o.data = JSON.stringify(o.data);
      return o;
    },
  };

  /**
   * Build out the render/view functions.
   */
  A.render = {
    catalog: function (r) {
      let $ele = Z.getTemplate('category-item-container');
      $ele.attr('id', 'category-container-' + r.id).data('id', r.id).data('menu_name', r.name);
      $ele.find('.category-item-title').html(r.name);
      $ele.find('.category-item-description').html(r.description);
      if (r.imgpath) {
        $ele.find('.category-item-preface').css('background-image', "url('" + r.imgpath + "')");
      }
      return $ele;
    },

    product: function (r) {
      let $ele = Z.getTemplate('product-item-container');
      A.render.product_data($ele, r);
      $ele.attr('id', 'product-container-' + r.id);
      return $ele;
    },

    product_data: function ($ele, r) {
      let $flags = $ele.find('.product-item-flags-container');
      $ele.attr('id', 'product-' + r.id)
          .addClass('product-color-' + Z.randomColor())
          .data('id', r.id);
      $ele.find('.product-item-price').html(r.monetized_price);
      $ele.find('.product-item-desc').html(r.short_description);
      $ele.find('.product-item-long-desc').html(r.description);
      $ele.find('.product-item-title').html(r.name);
      if (r.photo_small_url) {
        let $img = $('<img/>').attr('src', r.photo_small_url).attr('alt', r.name);
        $ele.find('.product-item-image').append($img);
      }
      r.product_menu_filters.forEach(function (v, i) {
        $flags.append(
            $('<div/>').addClass('product-item-flag ' + v.icon_class_name)
        );
      });

      $ele.attr('id', 'product-container-' + r.id);
      return $ele;
    },

    product_overlay: function (r) {
      let $ele = Z.getTemplate('product-overlay-contents');
      A.render.product_data($ele, r.responseJSON);
      $ele.attr('id', 'product-overlay-' + r.responseJSON.id);
      return $('<div/>').addClass('product-overlay-container')
          .append('<div class="product-overlay-background"/>')
          .append($ele);
    },

    sign_in_fail: function () {
      alert('sign in failed');
    },

    cart: function (r) {
      let $cart = $('#cart-sidebar').empty();
      if (r.items.length && $cart.length) {
        $cart.removeClass('has-empty-cart').addClass('has-cart-items');
        $.each(r.items, function (i, v) {
          $cart.append(A.render.cart_item(v));
        });
        $cart.append(A.render.cart_summary(r));
      }
      else {
        $cart.removeClass('has-cart-items').addClass('has-empty-cart');
      }
      $('<div/>').addClass("cart-sidebar-checkout").html('Checkout').appendTo($cart);
    },

    cart_item: function (r) {
      let $e = $('<div/>').addClass('cart-item').data('id', r.menu_item_id),
          is_item = r.hasOwnProperty('quantity');
      if (is_item) $('<div/>').addClass('cart-item-remove').appendTo($e);
      $('<div/>').addClass('cart-item-name').html(r.name).appendTo($e);
      if (is_item) $('<div/>').addClass('cart-item-qty').html(r.quantity).appendTo($e);
      $('<div/>').addClass('cart-item-price').html(r.paid_price).appendTo($e);
      return $e;
    },

    cart_summary: function (r) {
      let $e = $('<div/>').addClass('cart-summary-container'),
          s = r.summary;
      if (s.hasOwnProperty('tax') && s.tax != '$0.00') {
        $e.append(A.render.cart_item({name: 'Tax', paid_price: s.tax}).addClass('cart-summary-tax'));
      }
      if (s.hasOwnProperty('delivery_fee') && s.delivery_fee != '$0.00') {
        $e.append(A.render.cart_item({
          name: 'Delivery Fee',
          paid_price: s.delivery_fee
        }).addClass('cart-summary-delivery'));
      }
      $e.append(A.render.cart_item({name: 'Total', paid_price: s.net_value}).addClass('cart-summary-total'));
      return $e;
    },

    account_address: function (r) {
      let $e = Z.getTemplate('address-list-item');
      $e.attr('id', 'address-item-' + r.id).data('id', r.id);
      $e.find('input[name="address-name"]').val(r.title || '');
      $e.find('input[name="address-street"]').val(r.address || '');
      //$e.find('input[name="address-apt"]').val(r.address || '');
      $e.find('input[name="address-zip"]').val(r.zipcode || '');
      $e.find('input[name="address-phone"]').val(r.contact_info || '');
      $e.find('input[name="address-default"]').prop('checked', r.selected || false);
      return $e;
    },

    checkout_address: function () {
    },

    address_list: function (listtype, r) {
      let rend = listtype == 'account' ? A.render.account_address : A.render.checkout_address,
          $e = $('.address-list-container');
      $e.empty();
      if (r.length && $e.length) {
        $.each(r, function (i, v) {
          $e.append(rend(v));
        });
      }
      if (listtype == 'account') {
        let $new_addr = rend({id: 'new'}),
            $b = $('<div/>').addClass('boxed').html('Add New Address'),
            $d = $('<div/>').attr('id', 'account-add-address').append($b);
        $new_addr.find('.account-address-item-delete').remove();
        $new_addr.append($d).appendTo($e);
      }
    },
  };

})(jQuery, document, window, Math);