sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sRequestNumber = oEvent.getParameter("arguments").request_number;
            this.sRequestNumber = sRequestNumber; // 삭제 시 사용하기 위해 저장
            this._loadRequestData(sRequestNumber);
        },

        _loadRequestData: function (sRequestNumber) {
            var oModel = new JSONModel();
            var sUrl = "/odata/v4/request/Request(" + sRequestNumber + ")";

            oModel.attachRequestCompleted((oEvent) => {
                if (oEvent.getParameter("success")) {
                    this.getView().setModel(oModel, "requestDetailModel");
                } else {
                    MessageToast.show("데이터를 불러오는 데 실패했습니다.");
                }
            });

            oModel.loadData(sUrl);
        },

        formatNumber: function (value) {
            if (!value || isNaN(value)) return value;
            return new Intl.NumberFormat("en-US").format(value);
        },

        handleDelete: function () {
            var sUrl = "/odata/v4/request/Request(" + this.sRequestNumber + ")";
        
            jQuery.ajax({
                url: sUrl,
                type: "DELETE",
                success: () => {
                    MessageToast.show("삭제되었습니다.");
        
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("helloPanel"); // "HelloPanel" → "helloPanel" 변경
        
                    // 일정 시간 후 데이터 새로고침
                    setTimeout(function () {
                        var oHelloPanelPage = sap.ui.getCore().byId("helloPanel");
                        if (oHelloPanelPage) {
                            oHelloPanelPage.getController().reloadData();
                        }
                    }, 500);
                },
                error: () => {
                    MessageToast.show("삭제 중 오류가 발생했습니다.");
                }
            });
        },
        
        handleClose: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("helloPanel"); // "HelloPanel" → "helloPanel" 변경
        },

        handleEdit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("edit", { request_number: this.sRequestNumber });
        }
    });
});
