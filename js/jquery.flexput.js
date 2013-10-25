/**
 * flexput
 *
 * LICENSE
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author     François "cahnory" Germain <cahnory@gmail.com>
 * @license    http://www.opensource.org/licenses/mit-license.php
 */
/*jslint browser: true, todo: true, plusplus: true, indent: 2 */
/*global jQuery */
(function ($) {
  'use strict';

  var Plugin = $.easyPlug({
    name:       'flexput',
    events:     [],
    presets:    {
      duration:     100,
      easing:       'swing',
      horizontal:   true,
      vertical:     true,
      leadingCols:  2,
      leadingRows:  1,
      watch:        false,
      jump:         true
    },
    construct:  function () {
      var plugin = this;

      // Leading space, improve writing comfort
      while (this.leadingCols.length < this.settings.leadingCols) {
        this.leadingCols += 'M';
      }
      while (this.leadingRows.length < this.settings.leadingRows) {
        this.leadingRows += '\n.';
      }

      // Bind and style targeted element
      this.element
        // No scroll needed anymore (and keeping it make troubles)
        // Could be a problem with very long line without space
        .css({overflow: 'hidden'})

        // Update field on when subject to change
        .on(Plugin.addNamespace('keydown keyup change'), function () {
          plugin.update();
        });

      // Create reference inline element
      this.reference = Plugin.getReference(this.element);

      // Auto refresh
      if (this.settings.watch) {
        this.watch(this.settings.watch);
      }

      // Why timeout needed ? I don't know
      setTimeout(function () {
        plugin.update(true);
      }, 1);
    },
    prototype:  {
      // Inline reference for the element
      reference:  undefined,

      // Leading chars (spaces and linebreaks)
      leadingCols:  '',
      leadingRows:  '',

      watch: function (interval) {
        var plugin = this;
        this.unwatch();
        this.interval = setInterval(function () {
          plugin.update();
        }, interval);
      },
      unwatch: function () {
        clearInterval(this.interval);
        delete this.interval;
      },
      update: function (direct) {
        // Adjust width
        if (this.settings.horizontal) {
          // Animate width
          this.element
            .stop(Plugin.queues.horizontal, true, this.settings.jump)
            .animate({width: this.getWidth()}, {
              duration: direct ? 0 : this.settings.duration,
              easing:   this.settings.easing,
              queue:    Plugin.queues.horizontal
            })
            .dequeue(Plugin.queues.horizontal);
        }

        // Adjust height
        if (this.settings.vertical) {
          // Animate height
          this.element
            .stop(Plugin.queues.vertical, true, false)
            .animate({height: this.getHeight()}, {
              duration: direct ? 0 : this.settings.duration,
              easing:   this.settings.easing,
              queue:    Plugin.queues.vertical
            })
            .dequeue(Plugin.queues.vertical);
        }
      },

      getWidth: function () {
        var width, old;

        // Prepare reference
        this.enableReference();
        this.reference
          .css({
            height: this.element.css('height'),
            width:  'auto'
          })
          .text(this.getContent(this.leadingCols));

        // Get new height
        width = this.referenceCss('width');
        this.disableReference();

        return width;
      },
      getHeight: function () {
        var height, old;

        // Prepare reference
        this.enableReference();
        this.reference
          .css({
            width:  this.element.css('width'),
            height: 'auto'
          })
          .text(this.getContent(this.leadingRows));

        // Get new height
        height = this.referenceCss('height');
        this.disableReference();

        return height;
      },
      getContent: function (leading) {
        var content = this.element.val() + leading;
        if (content === '') {
          content = '.';
        }
        return content;
      },

      referenceCss: function (property) {
        var value, style, result;

        value   = this.reference.css(property);

        // Save style attribute to safely restore element
        style   = this.element.attr('style');

        // Set and get property
        result  = this.element.css(property, value).css(property);

        // Restore style attribute
        this.element.attr('style', style);

        // Reference property if changed
        if (value !== result) {
          this.reference.css(property, result);
        }

        return result;
      },
      enableReference: function () {
        this.reference.appendTo('body');
      },
      disableReference: function () {
        this.reference.detach();
      }
    }
  });

  Plugin.getReference = function (element) {
    return $(document.createElement('span')).css($.extend(element.css(Plugin.referenceNeeds), Plugin.referenceStyle));
  };

  Plugin.referenceStyle = {
    whiteSpace:       'pre',
    left:             '-9999px',
    position:         'absolute',
    visibility:       'hidden',
    top:              '-9999px'
  };

  Plugin.referenceNeeds = [
    'boxSizing',
    'mozBoxSizing',
    'webkitBoxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'glyphOrientationHorizontal',
    'glyphOrientationVertical',
    'lineHeight',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'padding',
    'textRendering',
    'whiteSpace',
    'wordWrap'
  ]

  Plugin.queues = {
    horizontal: Plugin.addPrefix('horizontal'),
    vertical:   Plugin.addPrefix('vertical')
  };

}(jQuery));