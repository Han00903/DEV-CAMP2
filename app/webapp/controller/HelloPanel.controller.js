sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/DatePicker", // DatePicker 추가
    "sap/m/VBox",
    "sap/m/Label", // Label 추가
    "sap/m/ComboBox",
    "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageToast, Dialog, Button, Input, DatePicker, VBox, Label, ComboBox) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.HelloPanel", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var oModel = new JSONModel();
        
            // 서버에서 데이터 가져오기 (초기 로드)
            this._loadRequestData(oModel);
        
            // 가져온 데이터를 requestModel로 설정
            this.getView().setModel(oModel, "requestModel");
        
            // 로컬 저장소에서 마지막 요청번호 가져오기
            var lastRequestNumber = parseInt(localStorage.getItem("lastRequestNumber"), 10);
            if (isNaN(lastRequestNumber)) {
                lastRequestNumber = 0; // 초기 값 설정
            }
            this._lastRequestNumber = lastRequestNumber;
        
            // "helloPanel" 페이지에 다시 접근할 때 데이터를 새로 불러오기
            oRouter.getRoute("helloPanel").attachPatternMatched(this._onHelloPanelMatched, this);
        },
        
        /**
         * HelloPanel 페이지 접근 시 데이터를 다시 불러오는 함수
         */
        _onHelloPanelMatched: function () {
            var oModel = this.getView().getModel("requestModel");
            this._loadRequestData(oModel);
        },
        
        /**
         * 데이터를 서버에서 불러오는 함수
         */
        _loadRequestData: function (oModel) {
            oModel.loadData("/odata/v4/request/Request")
                .then(() => {
                    let aData = oModel.getData();
        
                    // 요청번호를 기준으로 내림차순 정렬
                    aData.sort((a, b) => b.request_number - a.request_number);
        
                    // 정렬된 데이터를 모델에 설정
                    oModel.setData(aData);
        
                    console.log("서버에서 데이터를 성공적으로 가져왔습니다:", oModel.getData());
                })
                .catch((oError) => {
                    console.error("데이터를 가져오는 데 실패했습니다:", oError);
                });
        },        

        formatNumber: function (value) {
            if (!value || isNaN(value)) return value;
            return new Intl.NumberFormat("en-US").format(value);
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
                                new Label({ text: "요청날짜:" }),
                                new DatePicker({
                                    placeholder: "Request Date",
                                    id: "inputRequestDate-" + dialogId
                                })
                            ]
                        }),
                        new VBox({
                            items: [
                                new Label({ text: "요청상태:" }),
                                new ComboBox({
                                    id: "inputRequestState-" + dialogId,
                                    items: [
                                        { key: "대기", text: "대기" },  // "Pending" = 0
                                        { key: "승인", text: "승인" },  // "Approved" = 1
                                        { key: "반려", text: "반려" }   // "Rejected" = 2
                                    ],
                                    selectedKey: "대기" // Default value is "Pending"
                                })
                            ]
                        })
                    ]
                }),
                beginButton: new Button({
                    text: "저장",
                    press: function () {
                        // 고유 ID를 사용하여 값을 가져옴
                        var iRequestNumber = requestNumber; // 자동 생성된 요청번호 사용
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

                        // 상태를 ComboBox에서 가져오기 (숫자값으로)
                        var sRequestState = sap.ui.getCore().byId("inputRequestState-" + dialogId).getSelectedKey();

                        // 요청 데이터 생성
                        var oNewRequest = {
                            request_number: iRequestNumber, // 자동 생성된 요청번호
                            request_product: sProductName,
                            request_quantity: iQuantity,
                            request_estimated_price: fPrice,
                            requestor: sRequestor,
                            request_reason: sReason,
                            request_date: sRequestDate, // 선택된 날짜만 저장
                            request_state: sRequestState, // 숫자 값으로 상태 저장
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
        },

        onRequestStateChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedState = oComboBox.getSelectedKey();
            var oBindingContext = oComboBox.getBindingContext("requestModel");
            var oModel = this.getView().getModel("requestModel");
        
            if (!oBindingContext) {
                console.error("바인딩 컨텍스트 없음");
                return;
            }
        
            var oRequest = oBindingContext.getObject();
            var sRequestNumber = oRequest.request_number; // 변경할 요청의 ID
        
            // 변경된 상태를 서버에 업데이트 요청
            $.ajax({
                url: "/odata/v4/request/Request(" + sRequestNumber + ")",
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify({ request_state: sSelectedState }),
                success: function () {
                    MessageToast.show("요청 상태가 변경되었습니다.");
                    oModel.loadData("/odata/v4/request/Request"); // 변경된 데이터 다시 로드
                },
                error: function (error) {
                    console.error("요청 상태 업데이트 실패:", error);
                    MessageToast.show("요청 상태 변경에 실패했습니다.");
                }
            });
        },

        onListItemPress: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter(); // 라우터 가져오기
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            
            var oBindingContext = oEvent.getSource().getBindingContext("requestModel");
            if (!oBindingContext) {
                console.error("❌ 바인딩 컨텍스트를 찾을 수 없습니다.");
                return;
            }
        
            var product = oBindingContext.getProperty("request_number"); // request_number 사용
            console.log("✅ 선택된 request_number:", product); // 값 확인
        
            if (!product) {
                console.error("❌ 요청 번호를 찾을 수 없습니다.");
                return;
            }
        
            console.log("🔄 라우팅 시작 - 이동할 URL: /detail/" + product);
            oRouter.navTo("detail", {
                layout: oNextUIState.layout,
                request_number: product
            });
        },        

        onSearch: function (oEvent) {
            var aFilters = [];
            var oTable = this.byId("idRequestTable");
            var oBinding = oTable.getBinding("items");
            var oFilterBar = this.byId("filterbar");
        
            // 필터 바에서 모든 필터 가져오기
            oFilterBar.getFilterGroupItems().forEach(function (oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                var sFilterName = oFilterGroupItem.getName();
        
                if (oControl) {
                    if (oControl instanceof sap.m.Input) {
                        var sValue = oControl.getValue().trim();
                        if (sValue) {
                            // 숫자 필터인지 확인하고 적절한 비교 연산자 적용
                            if (!isNaN(sValue)) {
                                aFilters.push(new sap.ui.model.Filter(sFilterName, sap.ui.model.FilterOperator.EQ, sValue));
                            } else {
                                aFilters.push(new sap.ui.model.Filter(sFilterName, sap.ui.model.FilterOperator.Contains, sValue));
                            }
                        }
                    } else if (oControl instanceof sap.m.DatePicker) {
                        var sDateValue = oControl.getDateValue();
                        if (sDateValue) {
                            aFilters.push(new sap.ui.model.Filter(sFilterName, sap.ui.model.FilterOperator.EQ, sDateValue));
                        }
                    } else if (oControl instanceof sap.m.MultiComboBox) {
                        var aSelectedKeys = oControl.getSelectedKeys();
                        if (aSelectedKeys.length > 0) {
                            var aStateFilters = aSelectedKeys.map(function (sKey) {
                                return new sap.ui.model.Filter(sFilterName, sap.ui.model.FilterOperator.EQ, sKey);
                            });
                            aFilters.push(new sap.ui.model.Filter({ filters: aStateFilters, and: false }));
                        }
                    }
                }
            });
        
            // 필터 적용
            oBinding.filter(aFilters, "Application");
        },

        onResetFilters: function () {
            var oView = this.getView();
            var oFilterBar = oView.byId("filterbar"); // 필터 바 ID 확인
        
            if (!oFilterBar) {
                console.warn("필터 바를 찾을 수 없습니다.");
                return;
            }
        
            // 필터 바의 모든 필터 초기화
            oFilterBar.getFilterGroupItems().forEach(function (oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl) {
                    if (oControl instanceof sap.m.Input || oControl instanceof sap.m.DatePicker) {
                        oControl.setValue(""); // 입력값 초기화
                    } else if (oControl instanceof sap.m.MultiComboBox || oControl instanceof sap.m.ComboBox) {
                        oControl.setSelectedKeys([]); // 선택값 초기화
                    }
                }
            });
        
            // 테이블 필터 제거
            var oTable = oView.byId("idRequestTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([]); // 필터 제거
                }
            }
        },        

        onSort: function () {
            this._bDescendingSort = !this._bDescendingSort;
            var oTable = this.getView().byId("idRequestTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    var oSorter = new sap.ui.model.Sorter("request_number", this._bDescendingSort);
                    oBinding.sort(oSorter);
                } else {
                    console.warn("테이블 바인딩이 존재하지 않습니다.");
                }
            } else {
                console.warn("idRequestTable을 찾을 수 없습니다.");
            }
        }
    });
});
