sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProductName = oEvent.getParameter("arguments").product;
            if (!sProductName) {
                console.error("❌ 제품명이 없습니다.");
                return;
            }

            var oModel = this.getView().getModel("products");
            var oData = oModel.getProperty("/");

            var oSelectedProduct = oData.find(item => item.Name === sProductName);
            if (!oSelectedProduct) {
                console.error("❌ 해당 제품 데이터를 찾을 수 없습니다.");
                return;
            }

            var orequestModel = new JSONModel(oSelectedProduct);
            this.getView().setModel(orequestModel, "requestModel");
        },

        handleClose: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("overview");
        },

        toggleAreaPriority: function () {
            console.log("✏️ 편집 기능 구현 예정");
        }
    });
});
