;
var ZJQ = ZJQ || {};
(function ($, document, window, undefined) {
  let Z = ZJQ;

  Z.showProductOverlay = function(ele) {
    let id = $(ele).data('id');
    if (id) {
      Z.getProduct(id, ZJQ.renderProductOverlay);
    }
  };

  Z.getProduct = function(id, cb) {
    let o = {data: $.param({requestType: 'product', id: id})};
    o.complete = Z.prepareCallback(cb);
    Z.doAjax('product', o);
  };

  Z.getProductCatalog = function (cb) {
    let o = {data: $.param({requestType: 'product-catalog'})};
    o.complete = Z.prepareCallback([$.proxy(this.handlerGetProductCatalog, this)], cb);
    Z.doAjax('productcatalog', o);
  };

  Z.handlerGetProductCatalog = function (r) {
    let data = r.responseJSON.data,
        $toptarget = $('.category-list-container'),
        $ul = $('<ul/>'),
        $menu = $('<nav/>').addClass('menu-nav-container').append($ul)
    ;
    // Build the category elements.
    $.each(data, function (i, v) {
      let $ele = Z.renderCategory(v),
          $target = $ele.find('.product-list-container')
      ;
      // Build the product elements within this category.
      $.each(v.products, function (i, v) {
        $target.append(Z.renderProduct(v));
      });
      $toptarget.append($ele.hide());
    });

    // Add the menu item for the categories.
    $toptarget.find('.category-item-container').each(function () {
      let $name = $(this).find('.category-item-title').text(),
          $link = $('<a/>').attr('href', '#' + this.id).html($name),
          $li = $('<li/>').html($link).addClass('menu-nav-link');
      $ul.append($li);
    });
    $('.menu-nav-link', $ul).first().addClass('active')
    $('header#top-header').append($menu);

    $('.category-item-container').show(750);
  };

  Z.renderCategory = function (r) {
    let id = r.id,
        $ele = Z.getTemplate('category-item-container');
    $ele.attr('id', 'category-container-' + r.id).data('id', r.id);
    $ele.find('.category-item-title').html(r.name);
    $ele.find('.category-item-description').html(r.descript);
    if (r.imgpath) {
      $ele.find('.category-item-preface').css('background-image', "url('" + r.imgpath + "')");
    }
    return $ele;
  };

  Z.renderProduct = function (r) {
    let $ele = Z.getTemplate('product-item-container'),
        $flags = $ele.find('product-item-flags-container');
    Z.renderProductData($ele, r);
    $ele.attr('id', 'product-container-' + r.id)
    return $ele;
  };

  Z.renderProductOverlay = function(r) {
    let data = r.responseJSON.data,
        $ele = Z.getTemplate('product-overlay-contents');
    Z.renderProductData($ele, data);
    $ele.attr('id', 'product-overlay-' + data.id);
    $('<div/>').addClass('product-overlay-container')
        .append('<div class="product-overlay-background"/>')
        .append($ele)
        .appendTo($('body'));
  };

  Z.renderProductData = function ($ele, data) {
    let $flags = $ele.find('.product-item-flags-container');

    $ele.attr('id', 'product-' + data.id)
        .css('background-color', Z.randomColor())
        .data('id', data.id);
    $ele.find('.product-item-price').html('$' + data.price);
    $ele.find('.product-item-desc').html(data.descript);
    $ele.find('.product-item-title').html(data.name);
    if (data.imgpath) {
      let $img = $('<img/>').attr('src', data.imgpath).attr('alt', data.name);
      $ele.find('.product-item-image').append($img);
    }
    data.flags.split(',').forEach(function (v, i) {
      $flags.append(
          $('<div/>').addClass('product-item-flag product-item-flag-' + v.toLowerCase())
      );
    });
  }

  Z.getTemplate = function(t) {
    return $('#template-' + t + ' > div').first().clone();
  }
})
(jQuery, document, window);