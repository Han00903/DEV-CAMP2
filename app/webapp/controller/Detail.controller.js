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
            this._loadRequestData(sRequestNumber);
        },

        _loadRequestData: function (sRequestNumber) {
            var oModel = new JSONModel();
            var sUrl = "/odata/v4/request/Request(" + sRequestNumber + ")";

            oModel.attachRequestCompleted((oEvent) => {
                if (oEvent.getParameter("success")) {
                    this.getView().setModel(oModel, "requestDetailModel");
                    console.log("데이터 로드 성공:", oModel.getData());
                } else {
                    console.error("데이터 로드 실패:", oEvent.getParameter("error"));
                    MessageToast.show("데이터를 불러오는 데 실패했습니다.");
                }
            });

            oModel.loadData(sUrl);
        },

        handleClose: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("overview");
        },

        /**
         * 숫자 포맷팅 함수 (쉼표 추가)
         */
        formatNumberWithCommas: function (sValue) {
            if (!sValue) return "0"; // 값이 없으면 기본값 0 반환
            return parseInt(sValue, 10).toLocaleString(); // 숫자로 변환 후 1,000 단위 쉼표 추가
        }
    });
});
