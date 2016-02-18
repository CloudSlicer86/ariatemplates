/*
 * Copyright 2015 Amadeus s.a.s.
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

Aria.classDefinition({
    $classpath : "test.aria.widgets.wai.popup.WaiPopupTestSuite",
    $extends : "aria.jsunit.TestSuite",
    $constructor : function () {
        this.$TestSuite.constructor.call(this);
        this.addTests("test.aria.widgets.wai.popup.dialog.DialogTestCase");
        this.addTests("test.aria.widgets.wai.popup.dialog.WaiDialogTestCase");
        this.addTests("test.aria.widgets.wai.popup.dialog.modal.ModalDialogTestSuite");
        this.addTests("test.aria.widgets.wai.popup.errortooltip.ErrorTooltipTestCase");
        this.addTests("test.aria.widgets.wai.popup.errortooltip.WaiErrorTooltipTestCase");
    }
});