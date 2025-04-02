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
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // set data model
            const oData = {
                recipient: {
                    name: "World"
                }
            };
            const oModel = new JSONModel(oData);
            this.setModel(oModel);

            // set device model
            const oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // create the views based on the url/hash
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