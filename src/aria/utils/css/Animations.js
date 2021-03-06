/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Aria = require("../../Aria");
var ariaUtilsClassList = require("../ClassList");
var ariaUtilsDelegate = require("../Delegate");
var ariaTemplatesCSSMgr = require("../../templates/CSSMgr");
var ariaUtilsCssTransitions = require("./Transitions.tpl.css");
var _isSupported;

/**
 * Utilities for CSS3 animations Add CSS animations. To add a new animation you need to create a new instance of
 * aria.utils.css.Animations and call the method start passing:
 *
 * <pre>
 * - the animation name (that can be slide, slideup, slidedown, fade, pop, flip)
 * - a configuration object that describes the animation:
 *      cfg {
 *          from : {HTMLElement} that will animate out [optional],
 *          to : {HTMLElement} that will animate in [optional],
 *          reverse : {Boolean} true to activate the reverse transition, default false [optional],
 *          type : {Number} 1 for normal transitions, 2 to activate hardware acceleration, 3 for 3D transitions, default is 1 [optional],
 *          hiddenClass : {String} className for to the element that will animate out and to remove from the element animate in [optional]
 *      }
 * </pre>
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.utils.css.Animations",
    $css : [ariaUtilsCssTransitions],
    $constructor : function () {

        /**
         * Name of the animation (slide, slideup, slidedown, fade, pop, flip)
         * @type String
         */
        this._name = "";

        /**
         * Configuration parameters for animation
         * @type aria.utils.css.AnimationsBean:AnimationCfg
         */
        this._cfg = {};

        /**
         * Loads the CSSTemplate for the animations
         */
        ariaTemplatesCSSMgr.loadClassPathDependencies(this.$classpath, this.$css);
        this.__cssLoaded = true;
    },
    $destructor : function () {
        if (this.__cssLoaded) {
            ariaTemplatesCSSMgr.unloadClassPathDependencies(this.$classpath, this.$css);
            this.__cssLoaded = false;
        }
    },
    $events : {
        "animationend" : {
            description : "Notify when an animation completes",
            properties : {
                animation_name : "The animation name completed."
            }
        }
    },
    $statics : {
        /**
         * Checks if transitions are supported by the used browser
         * @return {Boolean} true if the browser supports transitions, otherwise false
         */
        isSupported : function () {
            if(_isSupported !== undefined){
                return _isSupported;
            }
            _isSupported = false;
            var document = Aria.$window.document;
            var div = document.createElement("div");
            var p, pre = ["ms", "O", "Webkit", "Moz"];
            for (p in pre) {
                if (div.style[pre[p] + "Transition"] !== undefined) {
                    _isSupported = true;
                    break;
                }
            }
            div = null;
            return _isSupported;
        }

    },
    $prototype : {
        /**
         * Starts the animation
         * @param {String} animation name
         * @param {aria.utils.css.AnimationsBean:AnimationCfg} cfg animation configuration
         */
        start : function (animation, cfg) {
            this._name = "x" + animation;
            this._cfg.from = cfg.from;
            this._cfg.to = cfg.to;
            this._cfg.reverse = !cfg.reverse ? "" : "xreverse";
            this._cfg.sequential = this._isSequential();
            this._cfg.type = cfg.type;
            this._cfg.hiddenClass = cfg.hiddenClass;

            this._toggleClassBody();

            if (this._cfg.from) {
                this._startOut();
            } else {
                this._doneOut();
            }
        },

        /**
         * Starts the out animation for the From HTMLElement
         */
        _startOut : function () {
            if (!this._cfg.sequential) {
                this._doneOut();
            } else {
                aria.utils.Event.addListener(this._cfg.from, this._animationEndEvent(), {
                    fn : this._doneOut,
                    scope : this
                });
            }

            this._addOutClass(this._cfg.from);
        },

        /**
         * Ends the out animation for the From HTMLElement
         */
        _doneOut : function () {
            if (this._cfg.from && this._cfg.sequential) {
                this._cleanFrom();
            }
            if (this._cfg.to) {
                this._startIn();
            } else {
                this._doneIn();
            }
        },

        /**
         * Starts the in animation for the To HTMLElement
         */
        _startIn : function () {
            aria.utils.Event.addListener(this._cfg.to, this._animationEndEvent(), {
                fn : this._doneIn,
                scope : this
            });
            this._addInClass(this._cfg.to);
        },

        /**
         * Ends the in animation for the To HTMLElement
         */
        _doneIn : function () {
            if (!this._cfg.sequential && this._cfg.from) {
                this._cleanFrom();
            }

            if (this._cfg.to) {
                this._removeClass(this._cfg.to, "xout xin xreverse xinMix xoutMix xin3d xout3d " + this._name);
                aria.utils.Event.removeListener(this._cfg.to, this._animationEndEvent());
            }

            this._toggleClassBody();

            this.$raiseEvent({
                name : "animationend",
                animation : this._name.substring(1) + (this._cfg.reverse ? " reverse" : "")
            });
        },

        /**
         * Add the out css class to the HTMLElement
         * @param {HTMLElement} Element to which out css class will be added
         */
        _addOutClass : function (element) {
            if (this._cfg.type == 1 || !this._cfg.type) {
                this._addClass(element, this._name + " xout" + " " + this._cfg.reverse);
            } else if (this._cfg.type == 2) {
                this._addClass(element, this._name + " xoutMix" + " " + this._cfg.reverse);
            } else if (this._cfg.type == 3) {
                this._addClass(element, this._name + " xout3d" + " " + this._cfg.reverse);
            }
        },

        /**
         * Add the in css class to the HTMLElement
         * @param {HTMLElement} Element to which in css class will be added
         */
        _addInClass : function (element) {
            if (this._cfg.hiddenClass) {
                this._removeClass(element, this._cfg.hiddenClass);
            } else {
                this._removeClass(element, "xanimation-element");
            }

            if (this._cfg.type == 1 || !this._cfg.type) {
                this._addClass(element, this._name + " xin" + " " + this._cfg.reverse);
            } else if (this._cfg.type == 2) {
                this._addClass(element, this._name + " xinMix" + " " + this._cfg.reverse);
            } else if (this._cfg.type == 3) {
                this._addClass(element, this._name + " xin3d" + " " + this._cfg.reverse);
            }
        },

        /**
         * Add the css classes to the HTMLElement
         * @param {HTMLElement} Element to which css classes will be added
         * @param {String} Css classes to add
         */
        _addClass : function (element, classes) {
            var elmClass = new ariaUtilsClassList(element);
            elmClass.add(classes);
            elmClass.$dispose();
        },

        /**
         * Remove the css classes from the HTMLElement
         * @param {HTMLElement} Element to which css classes will be removed
         * @param {String} Css classes to remove
         */
        _removeClass : function (element, classes) {
            var elmCss = new ariaUtilsClassList(element);
            elmCss.remove(classes);
            elmCss.$dispose();
        },

        /**
         * Removes from the From HTMLElment all the CSS classes added during the animation
         */
        _cleanFrom : function () {
            this._removeClass(this._cfg.from, "xout xin xreverse xinMix xoutMix xin3d xout3d " + this._name);
            if (this._cfg.hiddenClass) {
                this._addClass(this._cfg.from, this._cfg.hiddenClass);
            } else {
                this._addClass(this._cfg.from, "xanimation-element");
            }

            aria.utils.Event.removeListener(this._cfg.from, this._animationEndEvent());
        },

        /**
         * Toggle some classes to the body
         */
        _toggleClassBody : function () {
            var bodyClass = new ariaUtilsClassList(Aria.$window.document.body);
            bodyClass.toggle("xviewport-xanimation");
            bodyClass.toggle("xviewport-" + this._name);
            bodyClass.$dispose();
        },

        /**
         * Defines if an animation is sequential or not
         */
        _isSequential : function () {
            if (this._name == "xslide" && this._cfg.from && this._cfg.to) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * Returns the right event due to the vendor prefix. Needed it because the browser event is case sensitive.
         */
        _animationEndEvent : function () {
            var vendorPrefix = (ariaUtilsDelegate.vendorPrefix || "").toLowerCase();

            switch (vendorPrefix) {
                case "webkit" :
                    return "webkitAnimationEnd";
                case "moz" :
                    return "animationend";
                case "o" :
                    return "oanimationend";
                case "ms" :
                    return "MSAnimationEnd";
            }
        }
    }
});
