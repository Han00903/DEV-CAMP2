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

            // 로컬 저장소에서 마지막 요청번호 가져오기
            var lastRequestNumber = parseInt(localStorage.getItem("lastRequestNumber"), 10);
            if (isNaN(lastRequestNumber)) {
                lastRequestNumber = 0; // 초기 값 설정
            }
            this._lastRequestNumber = lastRequestNumber;
        },

        onCreateRequest: function () {
            var oView = this.getView();
            var oModel = oView.getModel("requestModel");

            // 요청번호를 자동으로 증가시키기
            this._lastRequestNumber++;
            var requestNumber = this._lastRequestNumber; // 자동으로 증가된 요청번호 사용

            // 고유한 ID 생성 (예: 'inputRequestNumber-1', 'inputRequestNumber-2' 등)
            var dialogId = new Date().getTime(); // 현재 시간을 기반으로 고유한 ID 생성

            // 사용자 입력을 받을 Dialog 생성
            var oDialog = new Dialog({
                title: "물품 요청 생성",
                content: new VBox({
                    items: [
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
                        
                        // Date 객체에서 년, 월, 일만 추출하여 'YYYY-MM-DD' 형식으로 변환
                        var sRequestDate = oRequestDate ? 
                            oRequestDate.getFullYear() + '-' + 
                            ('0' + (oRequestDate.getMonth() + 1)).slice(-2) + '-' + 
                            ('0' + oRequestDate.getDate()).slice(-2) : 
                            new Date().getFullYear() + '-' + 
                            ('0' + (new Date().getMonth() + 1)).slice(-2) + '-' + 
                            ('0' + new Date().getDate()).slice(-2);  // 날짜가 없으면 현재 날짜 사용

                        // 요청 데이터 생성
                        var oNewRequest = {
                            request_number: iRequestNumber, // 자동 생성된 요청번호
                            request_product: sProductName,
                            request_quantity: iQuantity,
                            request_estimated_price: fPrice,
                            requestor: sRequestor,
                            request_reason: sReason,
                            request_date: sRequestDate, // 선택된 날짜만 저장
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

                        // 요청번호를 로컬 저장소에 저장
                        localStorage.setItem("lastRequestNumber", requestNumber);

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
