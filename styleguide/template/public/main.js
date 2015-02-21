(function ($) {
  $(document).ready(function() {

    var offcanvas = {
      init: function() {
        this.$menu = $('.mknt-menu');
        this.$open = $('.mknt-openMenu');
        this.$close = $('.mknt-menu__close');

        this.duration = 300;

        //set event
        this.setEvent();

        //menu default css
        this.$menu.css({
          right: '-300px'
        });
      },

      setEvent: function() {
        var that = this;
        this.$open.on('click', function(e) {
          e.preventDefault();
          that.open();
        });
        this.$close.on('click', function(e) {
          e.preventDefault();
          that.close();
        });
      },

      open: function() {
        this.$menu.animate({
          right: '0px'
        }, this.duration);
      },

      close: function() {
        this.$menu.animate({
          right: '-300px'
        }, this.duration);
      }
    };
    offcanvas.init();


    var $menu = $('.mknt-nav');
    var $menuItem = $menu.find('.mknt-nav__item');
    var $childMenu = $('.mknt-nav__child');
    var ref = $menu.data('kss-ref');

      // Activate current page item
    $menuItem.eq(ref).addClass('mknt-nav__item--active');

    // Append child menu and attach scrollSpy
    if ($childMenu.length) {
      console.log(ref);
      $childMenu.show().appendTo($menuItem.eq(ref));
    }


    // Syntax hightlignting with Rainbow.js
    $('code.html').attr('data-language', 'html');
    $('code.css').attr('data-language', 'css');
    $('code.less, code.scss').attr('data-language', 'generic');

  });
}(jQuery));