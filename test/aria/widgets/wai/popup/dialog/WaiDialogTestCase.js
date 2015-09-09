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

var Aria = require("ariatemplates/Aria");

module.exports = Aria.classDefinition({
    $classpath : "test.aria.widgets.wai.popup.dialog.WaiDialogTestCase",
    $extends : require("ariatemplates/jsunit/TemplateTestCase"),
    $prototype : {
        runTemplateTest : function () {
            // get widgets to be tested
            this.dialog1 = this.getWidgetInstance("dlg1");
            this.dialog2 = this.getWidgetInstance("dlg2");

            // Check the first dialog (non modal)
            var dom = this.dialog1._domElt;
            this.assertNull(dom.getAttribute('role'), "The role attribute shouldn't be set for a non modal dialog.");

            // Check the first dialog (modal)
            var dom = this.dialog2._domElt;
            this.assertEquals(dom.getAttribute('role'), "dialog", "The role attribute should be set to dialog for a modal dialog.");

            this.end();

        }

    }
});
