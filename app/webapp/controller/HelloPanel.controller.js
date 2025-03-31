sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.HelloPanel", {
        onInit: function () {
            // Invoices.json 파일을 JSON 모델로 로드
            var oModel = new JSONModel("/webapp/Invoices.json");
            this.getView().setModel(oModel, "invoice");
        },

        getPage: function () {
            return this.byId("dynamicPageId");
        },

        onToggleFooter: function () {
            this.getPage().setShowFooter(!this.getPage().getShowFooter());
        }
    });
});
