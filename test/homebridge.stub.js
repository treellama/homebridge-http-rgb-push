// ISC License - Copyright 2018, Sander van Woensel

var sinon = require('sinon');

//! Homebridge stub.
//! Creates the main accessory.
module.exports = function(config) {

   this.logger = sinon.stub();

   this.hap = {
      Service: {
         AccessoryInformation: function() {
            this.setCharacteristic = sinon.stub().returnsThis();
         },
         Lightbulb: function() {
            this.getCharacteristic = sinon.stub().returnsThis();
            this.on = sinon.stub().returnsThis();
            this.addCharacteristic = sinon.stub().returnsThis();
         }
      },

      Characteristic: {
         Manufacturer: 0, SerialNumber: 1, Model: 2, FirmwareRevision: 3,
         On: 4,
         Hue: sinon.stub(),
         Saturation: sinon.stub(),
         Brightness: sinon.stub()
      }
   };

   //! Construct and store accessory for access during test.
   this.registerAccessory = function(pluginName, accessoryName, classFn) {
      this.accessory = new classFn(this.logger, config);
   };

   this.on = sinon.stub();

};
