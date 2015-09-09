/**
 * Extends the SelectBox plugin so it can jump to typed input.
 *
 * The original SelectBox plugin has to be loaded separately, get it from:
 * http://www.bulgaria-web-developers.com/projects/javascript/selectbox/
 * 
 * see README.md and LICENSE.md for details
 *
 * (c) glutrot GmbH, 2015
 * released under MIT license
 */

;(function(jQuery){
    function escapeRegExp(str) {
        // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    
    jQuery.fn.selectboxExtended = function(params){
        // NOTE: up/down/return are already handled by selectbox
        var keyCodeBackspace = 8;
        var keyCodeUp = 38;
        var keyCodeDown = 40;
        //var keyCodeReturn = 13;
        var keyCodeTab = 9;
        
        // initialize original selectbox
        var jCreatedSelectbox = this.selectbox(params);
        
        // make all .sbHolder divs focusable
        // see: http://stackoverflow.com/questions/3656467/is-it-possible-to-focus-on-a-div-using-javascript-focus-function
        var jCreatedHolders = jCreatedSelectbox.next('.sbHolder');
        jCreatedHolders.attr('tabindex', 0);
        
        // open selectbox on focus in
        // works only after .sbHolder has been made focusable!
        // FIXME: Somehow events are completely mangled if this is enabled:
        //        Focus events occur before click events.
        //        Click events are causing toggle on original selectbox,
        //        effectively closing .sbOptions again after focus.
        //        Opening relies on animation queue.
        //        Animation queue must not be tempered with!
        //        If animation queue is stopped/cleared, opening does not work.
        //        If animation queue gets a function added to attempt to call
        //        selectbox' open method at the end of all animations, clicking
        //        doesn't do anything at all (even if nothing gets added to the
        //        queue!?!? what's the causality?!).
        /*
        jCreatedHolders.on('focus', function(){
            var jHolder = jQuery(this);
            jHolder.prev('select').selectbox('open');
        });
        jCreatedHolders.find('a.sbSelector').on('focus', function(){
            // anchor is focused on Shift-TAB from next field
            var jHolder = jQuery(this).parent('.sbHolder');
            jHolder.prev('select').selectbox('open');
        });
        */
       
        // handle key presses
        var regExpValidCharacters = /^[ a-z0-9\-\+\.\:,_\?\*]$/i;
        jQuery(jCreatedSelectbox).next('.sbHolder').on('keydown', function(e){
            var jHolder = jQuery(this);
            var jSelect = jHolder.prev('select');
            var jSelector = jHolder.find('.sbSelector');
            
            // try to get key code
            var keyCode = (typeof(e.keyCode) != 'undefined')  ? e.keyCode :
                          (typeof(e.which) != 'undefined')    ? e.which :
                          (typeof(e.charCode) != 'undefined') ? e.charCode :
                          0;
            
            // convert to character and check if it's text or control input
            var char = String.fromCharCode(keyCode);
            var isAppendable = regExpValidCharacters.test(char);
            
            // get what has been typed so far
            var typed = jSelect.data('typed');
            if (typeof(typed) == 'undefined') {
                typed = '';
            }
            
            // reset after given timeout
            var timeout = 3000;
            var lastTyped = jSelect.data('lastTyped');
            var now = new Date().getTime();
            
            if (now - lastTyped > timeout) {
                typed = '';
            }
            
            // handle key press
            var jFocusedItem = jHolder.find('.sbOptions a.sbFocus').parent('li');
            var jPreviouslyFocusedItem = jQuery(jFocusedItem);
            var jItems = jHolder.find('.sbOptions li');
            if (isAppendable) {
                // append to end
                typed += char;
                
                // search for matching items
                var jFilteredItems = jQuery();
                var regExpStartsWithTypedText = new RegExp('^'+escapeRegExp(typed.toLowerCase()));
                jItems.each(function(){
                    var jItem = jQuery(this);
                    var itemText = jItem.text();
                    
                    if (regExpStartsWithTypedText.test(itemText.toLowerCase())) {
                        jFilteredItems = jFilteredItems.add(jItem);
                    }
                });
                
                // change selection to first matching item
                if (jFilteredItems.length > 0) {
                    jFocusedItem = jFilteredItems.first();
                }
            } else if ((keyCode == keyCodeUp) || (keyCode == keyCodeDown)) {
                // reset typed text on navigation by arrow keys
                
                // NOTE: internal handling by selectbox preceedes this method,
                //       so we already have the new item focused
                
                typed = '';
            } else if (keyCode == keyCodeBackspace) {
                // remove from end
                if (typed.length > 0) {
                    typed = typed.substring(0, typed.length - 1);
                }
            } else if (keyCode == keyCodeTab) {
                // (Shift-)TAB should move to next/previous fields
                
                // get all fields which could potentially be focused
                var jFocusableFields = jQuery('input:visible, select:visible, .sbHolder:visible, textarea:visible');
                var focusableFields = jFocusableFields.toArray();
                
                // find index of this selectbox holder
                var holders = jHolder.get();
                var holder = holders[0];
                var index = _.indexOf(focusableFields, holder);
                
                // move forward or backwards? (TAB vs. Shift-TAB)
                var offset = ((typeof(e.shiftKey) != 'undefined') && e.shiftKey) ? -1 : 1;
                
                // choose next field to focus
                var focusField = null;
                if (index >= 0) {
                    focusField = focusableFields[(index+offset) % focusableFields.length];
                }
                
                // focus if found
                if (focusField != null) {
                    jQuery(focusField).focus();
                }
            } else {
                // skip unknown key codes
                //console.log('selectboxExtended unknown keycode: '+String(keyCode)); // DEBUG
                return;
            }
            
            // save data
            jSelect.data('typed', typed);
            jSelect.data('lastTyped', now);
            
            // we cannot continue without any focused item
            if (jFocusedItem.length == 0) {
                return;
            }
            
            // update focus
            var jFocusedAnchor = jFocusedItem.find('a');
            jPreviouslyFocusedItem.find('a').removeClass('sbFocus');
            jFocusedAnchor.addClass('sbFocus');
            
            // mark selected on actual select field
            var focusedText = jFocusedAnchor.text();
            var jNewOption = null;
            var jOptions = jSelect.find('option');
            jOptions.each(function(){
                var jOption = jQuery(this);
                if (jOption.text() == focusedText) {
                    jNewOption = jOption;
                }
            });
            if (jNewOption != null) {
                jOptions.prop('selected', false);
                jNewOption.prop('selected', true);
                jSelector.text(focusedText);
            }
            
            // selection has changed, so trigger change event on select
            jSelect.trigger('change');
            
            // scroll drop down to show focused item on top
            var jOptions = jHolder.find('.sbOptions');
            var offsetFromFirstItem = (jFocusedItem.offset().top - jItems.first().offset().top);
            jOptions.scrollTop(offsetFromFirstItem);
        });
        
        return jCreatedSelectbox;
    };
})(jQuery);
