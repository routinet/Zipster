;
var ZJQ = ZJQ || {};
(function ($, document, window, Math, undefined) {
  ZJQ.api = ZJQ.api || {};
  let Z = ZJQ, A = ZJQ.api;

  /**
   * Build out all the API-related functions and properties.
   */

  A.authkey = {
    key: '',
    expire: 0
  };

  A.defaults = {
    method: "GET",
    host: "staging.zokusushi.com",
    path_prefix: "api/v1/mobile",
    use_ssl: true,
    api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.WyJ5bFRGRnlGK2NDWGNFcmtVNnhwZ3ViYkJTeExsaUdjbHBSM2hIaSt4d1JZay95U0tkQUw2SktXWVY0OTdBT2RDZy91MXBOcUdoS1FnUVNueVVsb0dWQT09Il0.fpfrOVQWRw2969sY9Z9KcmXC27DAPXMkzlsOODVvDW4'
  };

  A.definitions = {
    login: {},
    catalog: {
      name: 'cities/NYC/stores/ZS/menus/all/items',
    },
    product: {
      name: 'cities/NYC/stores/ZS/menus/{1}/items/{2}'
    },
    product_overlay: {
      name: 'cities/NYC/stores/ZS/menus/{1}/items/{2}'
    },
    add_cart: {
      auth_required: true,
      name: 'cities/NYC/stores/ZS/items/{1}/cart/add',
      method: 'POST',
      data: {quantity: 2},
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
  }

  A.resolveAuth = function () {
    // if no cookie exists, authenticate and store
    // read auth cookie
    // create Bearer token
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

      $('.menu-nav-link', $ul).first().addClass('active')
      $('header#top-header').append($menu);

      $('.category-item-container').show(750);
    },

    product_overlay: function (r) {
      $('body').append(A.render.product_overlay(r));
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
  };

})(jQuery, document, window, Math);