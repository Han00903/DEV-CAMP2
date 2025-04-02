sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Edit", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("edit").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sRequestNumber = oEvent.getParameter("arguments").request_number;
            this.sRequestNumber = sRequestNumber;
            this._loadRequestData(sRequestNumber);
        },

        _loadRequestData: function (sRequestNumber) {
            var oModel = new JSONModel("/odata/v4/request/Request(" + sRequestNumber + ")");
            this.getView().setModel(oModel, "editModel");
        },

        handleSave: function () {
            var oModel = this.getView().getModel("editModel");
            var sUrl = "/odata/v4/request/Request(" + this.sRequestNumber + ")";

            jQuery.ajax({
                url: sUrl,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(oModel.getData()),
                success: () => {
                    MessageToast.show("수정되었습니다.");
                    this.getOwnerComponent().getRouter().navTo("detail", { request_number: this.sRequestNumber });
                },
                error: () => {
                    MessageToast.show("수정 중 오류가 발생했습니다.");
                }
            });
        },

        handleCancel: function () {
            this.getOwnerComponent().getRouter().navTo("detail", { request_number: this.sRequestNumber });
        }
    });
});