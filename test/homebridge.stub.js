var sinon = require('sinon');

//! Homebridge stub.
//! Creates the main accessory.
module.exports = function(config) {

   this.logger = sinon.stub();

   this.hap = {
      Service: null,
      Characteristic: null
   };

   //! Construct and store accessory for access during test.
   this.registerAccessory = function(pluginName, accessoryName, classFn) {
      this.accessory = new classFn(this.logger, config);
   };

   this.on = sinon.stub();

   this.notificationRegistration = sinon.stub();

};
