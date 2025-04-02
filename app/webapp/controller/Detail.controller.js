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

        handleDelete: function () {
            var sUrl = "/odata/v4/request/Request(" + this.sRequestNumber + ")";

            jQuery.ajax({
                url: sUrl,
                type: "DELETE",
                success: () => {
                    MessageToast.show("삭제되었습니다.");
                    
                    // overview 페이지로 이동 후 데이터 새로고침
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("overview", { refresh: true });

                    // 강제 새로고침 (데이터 반영 확실히 하기)
                    sap.ui.getCore().byId("overviewPage").getController().reloadData();
                },
                error: () => {
                    MessageToast.show("삭제 중 오류가 발생했습니다.");
                }
            });
        },

        handleClose: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("overview");
        }
    });
});
