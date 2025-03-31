sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.HelloPanel", {
        onInit: function () {
            var oModel = new JSONModel();

            // 서버에서 데이터 가져오기
            oModel.loadData("/odata/v4/request/Request") // 요청할 서버의 엔드포인트
                .then(() => {
                    console.log("서버에서 데이터를 성공적으로 가져왔습니다:", oModel.getData());
                })
                .catch((oError) => {
                    console.error("데이터를 가져오는 데 실패했습니다:", oError);
                });

            // 가져온 데이터를 requestModel로 설정
            this.getView().setModel(oModel, "requestModel");
        },

        getPage: function () {
            return this.byId("dynamicPageId");
        },

        onToggleFooter: function () {
            this.getPage().setShowFooter(!this.getPage().getShowFooter());
        }
    });
});