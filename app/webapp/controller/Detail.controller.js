sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sRequestNumber = oEvent.getParameter("arguments").request_number;
            var oText = this.getView().byId("detailText");
            oText.setText("Request Number: " + sRequestNumber);
        }
    });
});