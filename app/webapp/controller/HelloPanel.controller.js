sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/ui/core/Title"
], function (Controller, JSONModel, MessageToast, Dialog, Button, Input, VBox, Title) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.HelloPanel", {
        onInit: function () {
            var oModel = new JSONModel();

            // 서버에서 데이터 가져오기
            oModel.loadData("/odata/v4/request/Request")
                .then(() => {
                    console.log("서버에서 데이터를 성공적으로 가져왔습니다:", oModel.getData());
                })
                .catch((oError) => {
                    console.error("데이터를 가져오는 데 실패했습니다:", oError);
                });

            // 가져온 데이터를 requestModel로 설정
            this.getView().setModel(oModel, "requestModel");
        },

        onCreateRequest: function () {
            var oView = this.getView();
            var oModel = oView.getModel("requestModel");

            // 사용자 입력을 받을 Dialog 생성
            var oDialog = new Dialog({
                title: "물품 요청 생성",
                content: new VBox({
                    items: [
                        new Input({ placeholder: "Request Number", id: "inputRequestNumber", type: "Number" }),
                        new Input({ placeholder: "Product Name", id: "inputProductName" }),
                        new Input({ placeholder: "Quantity", id: "inputQuantity", type: "Number" }),
                        new Input({ placeholder: "Estimated Price", id: "inputPrice", type: "Number" }),
                        new Input({ placeholder: "Requester Name", id: "inputRequestor" }),
                        new Input({ placeholder: "Request Reason", id: "inputReason" })
                    ]
                }),
                beginButton: new Button({
                    text: "저장",
                    press: function () {
                        var iRequestNumber = parseInt(sap.ui.getCore().byId("inputRequestNumber").getValue(), 10);
                        var sProductName = sap.ui.getCore().byId("inputProductName").getValue();
                        var iQuantity = parseInt(sap.ui.getCore().byId("inputQuantity").getValue(), 10);
                        var fPrice = parseFloat(sap.ui.getCore().byId("inputPrice").getValue());
                        var sRequestor = sap.ui.getCore().byId("inputRequestor").getValue();
                        var sReason = sap.ui.getCore().byId("inputReason").getValue();

                        // 요청 데이터 생성
                        var oNewRequest = {
                            request_number: iRequestNumber,
                            request_product: sProductName,
                            request_quantity: iQuantity,
                            request_estimated_price: fPrice,
                            requestor: sRequestor,
                            request_reason: sReason,
                            request_date: new Date().toISOString(), // 현재 날짜
                            request_state: "Pending", // 초기 상태
                            request_reject_reason: "" // 거절 사유 (기본값: 빈 문자열)
                        };

                        // 서버로 POST 요청 보내기
                        $.ajax({
                            url: "/odata/v4/request/Request",
                            type: "POST",
                            contentType: "application/json",
                            data: JSON.stringify(oNewRequest),
                            success: function () {
                                MessageToast.show("물품 요청이 성공적으로 생성되었습니다.");
                                oModel.loadData("/odata/v4/request/Request"); // 데이터 다시 로드
                            },
                            error: function (error) {
                                console.error("POST 요청 실패:", error);
                                MessageToast.show("물품 요청 생성에 실패했습니다.");
                            }
                        });

                        console.log("전송된 요청 데이터:", oNewRequest);

                        oDialog.close();
                    }
                }),
                endButton: new Button({
                    text: "취소",
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            oView.addDependent(oDialog);
            oDialog.open();
        }
    });
});
