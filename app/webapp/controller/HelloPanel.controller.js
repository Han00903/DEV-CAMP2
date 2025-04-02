sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/DatePicker", // DatePicker 추가
    "sap/m/VBox",
    "sap/m/Label" // Label 추가
], function (Controller, JSONModel, MessageToast, Dialog, Button, Input, DatePicker, VBox, Label) {
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

            // 고유한 요청번호를 자동으로 생성 (timestamp를 사용하여 유니크한 값 생성)
            var requestNumber = Math.floor(new Date().getTime() / 1000); // 밀리초를 초 단위로 변경하여 Integer 범위 내 값 생성

            // 고유한 ID 생성 (예: 'inputRequestNumber-1', 'inputRequestNumber-2' 등)
            var dialogId = new Date().getTime(); // 현재 시간을 기반으로 고유한 ID 생성

            // 사용자 입력을 받을 Dialog 생성
            var oDialog = new Dialog({
                title: "물품 요청 생성",
                content: new VBox({
                    items: [
                        new VBox({
                            items: [
                                new Label({ text: "요청번호:" }),
                                // 자동으로 생성된 요청번호를 Input 필드에 표시
                                new Input({
                                    value: requestNumber.toString(), // 자동 생성된 요청번호를 입력 필드에 설정
                                    id: "inputRequestNumber-" + dialogId,
                                    editable: false // 사용자가 수정할 수 없도록 설정
                                })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청물품:" }),
                                new Input({ placeholder: "Product Name", id: "inputProductName-" + dialogId })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청수량:" }),
                                new Input({ placeholder: "Quantity", id: "inputQuantity-" + dialogId, type: "Number" })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청예상가격:" }),
                                new Input({ placeholder: "Estimated Price", id: "inputPrice-" + dialogId, type: "Number" })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청자:" }),
                                new Input({ placeholder: "Requester Name", id: "inputRequestor-" + dialogId })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청사유:" }),
                                new Input({ placeholder: "Request Reason", id: "inputReason-" + dialogId })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청날짜:" }), // 요청날짜 라벨 추가
                                new DatePicker({
                                    placeholder: "Request Date",
                                    id: "inputRequestDate-" + dialogId
                                })
                            ]
                        })
                    ]
                }),
                beginButton: new Button({
                    text: "저장",
                    press: function () {
                        // 고유 ID를 사용하여 값을 가져옴
                        var iRequestNumber = requestNumber; // 자동 생성된 request_number 사용
                        var sProductName = sap.ui.getCore().byId("inputProductName-" + dialogId).getValue();
                        var iQuantity = parseInt(sap.ui.getCore().byId("inputQuantity-" + dialogId).getValue(), 10);
                        var fPrice = parseFloat(sap.ui.getCore().byId("inputPrice-" + dialogId).getValue());
                        var sRequestor = sap.ui.getCore().byId("inputRequestor-" + dialogId).getValue();
                        var sReason = sap.ui.getCore().byId("inputReason-" + dialogId).getValue();
                        
                        // DatePicker에서 선택된 날짜 가져오기
                        var oRequestDate = sap.ui.getCore().byId("inputRequestDate-" + dialogId).getDateValue();
                        var sRequestDate = oRequestDate ? oRequestDate.toISOString() : new Date().toISOString(); // 날짜가 없으면 현재 날짜 사용

                        // 요청 데이터 생성
                        var oNewRequest = {
                            request_number: iRequestNumber, // 자동 생성된 요청번호
                            request_product: sProductName,
                            request_quantity: iQuantity,
                            request_estimated_price: fPrice,
                            requestor: sRequestor,
                            request_reason: sReason,
                            request_date: sRequestDate, // 선택된 날짜 또는 현재 날짜
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
