/*
 * jQuery Backstretch : Put a dynamically-resized image on your background
 * Version 1.3.0 - Copyright (c) 2012 Christophe Desguez (eidolon-labs.com)
 * https://github.com/zipang/jquery-backstretch
 *
 * Original version Copyright (c) 2011 Scott Robbin (srobbin.com)
 * Dual licensed under the MIT and GPL licenses.
 * http://srobbin.com/jquery-plugins/backstretch/
 *
*/

;(function($) {

    var $viewport = ("onorientationchange" in window) ? $(document) : $(window); // hack to account for iOS position:fixed shortcomings
    var $backstretch;

    // Initialize
    function init() {
        $backstretch = $("<div>")
            .attr("id", "backstretch")
            .css({
                position: "absolute",
                left: 0, top: 0,
                margin: 0, padding: 0,
                overflow: "hidden",
                zIndex: -999999,
                height: "100%", width: "100%"
            })
            .appendTo("body");
    }

    var defaultSettings = {
        centeredX: true,         // Should we center the image on the X axis?
        centeredY: true,         // Should we center the image on the Y axis?
        stretchMode: "crop",     // Should we occupy full screen width?
        speed: 1000,             // transition speed after image load (e.g. "fast" or 500)
        transition: function(image, speed, oldies, callback) {
            oldies.fadeOut(speed);
            image.fadeIn(speed, function() {
                oldies.remove();
                // Callback
                if (typeof callback == "function") callback();
            });
        }
    };


    $.backstretch = function(src, options, callback) {

        if (!$backstretch) { // first call
            init();
            // Adjust the background size when the window is resized or orientation has changed (iOS)
            $(window).resize(adjustSize);
        }

        var settings = $backstretch.data("settings") || defaultSettings; // If this has been called once before, use the old settings as the default

        // Extend the settings with those the user has provided
        if (options && typeof options == "object") {
            $.extend(settings, options);
            $backstretch.data("settings", settings);

        } else if (options && typeof options == "function") {// Just in case the user passed in a function without options
            callback = options;
        }


        // Prepare to delete any old images
        var oldies = $backstretch.find("img");

        var $img = $("<img>")
            .css({
                display: "none",
                zIndex: -999999,
                width: "auto", height: "auto"

            }).bind("load", function imageLoaded() {
                $img.data("ratio", $img.width() / $img.height()); // store the native image ratio when just loaded
                $backstretch.data("image", $img);
                adjustSize(function transition() {
                    settings.transition($img, settings.speed, oldies, callback);
                });

            }).appendTo($backstretch);


        $img.attr("src", src); // Hack for IE img onload event

        function adjustSize(next) {

            var pageWidth = $viewport.width(), pageHeight = $viewport.height(),
                image = $backstretch.data("image"),
                imgRatio = image.data("ratio");

            // resize the container first
            $backstretch.width(pageWidth).height(pageHeight);

            // try the usual stretch on image's width
            var imgWidth  = pageWidth;
            var imgHeight = imgWidth / imgRatio;

            if (settings.stretchMode == "crop") {

                if (imgHeight < pageHeight) { // stretch the other way
                    imgHeight = pageHeight;
                    imgWidth  = imgHeight * imgRatio;
                }
            } else if (settings.stretchMode == "adapt") {

                if (imgRatio < 1) { // image in portrait mode : stretch the other way
                    imgHeight = pageHeight;
                    imgWidth  = imgHeight * imgRatio;
                }
            } else { // fit

                if (imgHeight > pageHeight) {
                    imgHeight = pageHeight;
                    imgWidth  = imgHeight * imgRatio;
                }
            }

            var imgCSS = {position: "absolute", left: 0, top: 0};

            // Center as needed
            // Note: Offset code provided by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
            if (settings.centeredY) {
                $.extend(imgCSS, {top: ((pageHeight - imgHeight) / 2) + "px"});
            }

            if (settings.centeredX) {
                $.extend(imgCSS, {left: ((pageWidth - imgWidth) / 2) + "px"});
            }

            image.width(imgWidth).height(imgHeight).css(imgCSS);



            // Executed the callback function if passed
            if (typeof next == "function") next();

        }

        // For chaining
        return this;

    };
  
})(jQuery);
