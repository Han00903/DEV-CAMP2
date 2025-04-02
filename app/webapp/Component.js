sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/f/FlexibleColumnLayoutSemanticHelper"
], (UIComponent, JSONModel, Device, FlexibleColumnLayoutSemanticHelper) => {
    "use strict";

    return UIComponent.extend("ui5.walkthrough.Component", {
        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json"
        },

        init() {
            // 부모 클래스 초기화
            UIComponent.prototype.init.apply(this, arguments);

            // 기본 데이터 모델 설정
            const oData = { recipient: { name: "World" } };
            this.setModel(new JSONModel(oData));

            // Device 모델 설정
            const oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // 라우터 초기화
            this.getRouter().initialize();
        },

        getContentDensityClass() {
            return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
        },

        getHelper() {
            const oRootControl = this.getRootControl();
            if (!oRootControl) {
                console.error("❌ Root control이 아직 로드되지 않았습니다.");
                return null;
            }

            const oFCL = oRootControl.byId("flexibleColumnLayout");
            if (!oFCL) {
                console.error("❌ flexibleColumnLayout ID를 찾을 수 없습니다. App.view.xml에서 ID를 확인하세요.");
                return null;
            }

            return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, {
                defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
                defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded
            });
        }
    });
});
