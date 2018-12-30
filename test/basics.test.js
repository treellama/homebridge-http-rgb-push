var expect = require('chai').expect;
var sinon = require('sinon');
var sut = require('../index.js');

// -----------------------------------------------------------------------------
// Hint data
// -----------------------------------------------------------------------------
var TestConfig = function() {
    return {
        "service": "Light",
        "name": "Light A",
        "switch": {
            "status": "http://localhost8080/power/status",
            "notificationID": "notification-id-light-a",
            "notificationPassword": "notification-password",
            "powerOn": "http://localhost:8080/power/set/on",
            "powerOff": "http://localhost:8080/power/set/off"
        },
        "color": {
            "status": "http://localhost:8080/color/status",
            "url": "http://localhost:8080/color/set/%s",
            "brightness": true
        },
        "brightness": {
            "status": "http://localhost:8080/brightness/status",
            "url": "http://localhost:8080/brightness/set/%s"
        }
    };
};

// -----------------------------------------------------------------------------
// Test Suites
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
describe('Homebridge plugin creation', function () {

   beforeEach(function () {
      this.testConfig = new TestConfig();

      // This will also make sure to reset the embedded Sinon stubs.
      this.homebridgeStub = new (require('./homebridge.stub.js'))(this.testConfig);
   });


   it('registers accessory', function () {
      // 1. Arrange
      var spy = sinon.spy(this.homebridgeStub, "registerAccessory");

      // 2. Act
      sut(this.homebridgeStub);

      // 3. Assert
      expect(spy.calledOnce).equal(true);
      expect(spy.getCall(0).args[0]).
             equal('homebridge-http-rgb-push');
      expect(spy.getCall(0).args[1]).
             equal('HTTP-RGB-PUSH');
   });

   it('constructor registers to didFinishLaunching event', function () {
      // 1. Arrange
      // Stub created in homebridge.stub.js already since required for every construct.

      // 2. Act
      // Let SUT pass correct plugin constructor.
      sut(this.homebridgeStub);

      // 3. Assert
      expect(this.homebridgeStub.on.calledOnce).equal(true);
      expect(this.homebridgeStub.on.firstCall.args[0]).equal('didFinishLaunching');
   });

   it('didFinishLaunching callback registers with notification server', function () {
      // 1. Arrange
      // Stub created in homebridge.stub.js already since required for every construct.

      // 2. Act
      // Let SUT pass correct didFinishLaunching callback during construction.
      sut(this.homebridgeStub);
      // Call actual didFinishLaunching callback
      this.homebridgeStub.on.firstCall.lastArg();

      // 3. Assert
      expect(this.homebridgeStub.notificationRegistration.calledOnce).equal(true);
      expect(this.homebridgeStub.notificationRegistration.firstCall.args[0]).equal('notification-id-light-a');
      expect(this.homebridgeStub.notificationRegistration.firstCall.lastArg).equal('notification-password');
   });

   it('sets switch.status.bodyRegEx by default to /1/', function () {
      // 1. Arrange
      // Default TestConfig sets status URL only and should yield default bodyRegEx.

      // 2. Act
      sut(this.homebridgeStub);

      // 3. Assert
      expect(this.homebridgeStub.accessory.switch.status.bodyRegEx).to.eql(new RegExp(/1/));
   });

   it('sets switch.status.bodyRegEx to /"switch": "on"/', function () {
      // 1. Arrange
      this.testConfig.switch.status = {'bodyRegEx': '"switch": "on"' };

      // 2. Act
      sut(this.homebridgeStub);

      // 3. Assert
      expect(this.homebridgeStub.accessory.switch.status.bodyRegEx).to.eql(new RegExp(/"switch": "on"/));
   });

   it('sets switch.status.bodyRegEx to /1/ on incorrect bodyRegEx type', function () {
      // 1. Arrange
      this.testConfig.switch.status = {'bodyRegEx': undefined };

      // 2. Act
      sut(this.homebridgeStub);

      // 3. Assert
      expect(this.homebridgeStub.accessory.switch.status.bodyRegEx).to.eql(new RegExp(/1/));
   });

});


// -----------------------------------------------------------------------------
describe('Get power state', function () {

   beforeEach(function () {
      // 1. Arrange
      this.testConfig = new TestConfig();

      // This will also make sure to reset the embedded Sinon stubs.
      this.homebridgeStub = new (require('./homebridge.stub.js'))(this.testConfig);
      sut(this.homebridgeStub);

      this.homebridgeStub.accessory._httpRequest = sinon.stub();
      this.homebridgeCallback = sinon.stub();

      // 2. Act
      // Allow getPowerState to create HTTP response callback
      this.homebridgeStub.accessory.getPowerState(this.homebridgeCallback);
   });


   it('sends HTTP GET request with correct URL', function () {
      // 3. Assert
      expect(this.homebridgeStub.accessory._httpRequest.firstCall.args[0]).equals(this.testConfig.switch.status);
      expect(this.homebridgeStub.accessory._httpRequest.firstCall.args[1]).to.be.empty; // Body empty.
      expect(this.homebridgeStub.accessory._httpRequest.firstCall.args[2]).equals('GET');
   });

   it('replies "true" to Homebridge on valid HTTP GET device response "1"', function () {
      // 2. Act
      // Call collected HTTP response callback to simulate device response.
      this.homebridgeStub.accessory._httpRequest.firstCall.callback(undefined, undefined, '1');

      // 3. Assert
      expect(this.homebridgeCallback.firstCall.args[1]).equals(true);
      expect(this.homebridgeStub.logger.firstCall.args).deep.equals(['power is currently %s', 'ON']);
   });

   it('replies "false" to Homebridge on valid HTTP GET device response "0"', function () {
      // 2. Act
      // Call collected HTTP response callback to simulate device response.
      this.homebridgeStub.accessory._httpRequest.firstCall.callback(undefined, undefined, '0');

      // 3. Assert
      expect(this.homebridgeCallback.firstCall.args[1]).equals(false);
      expect(this.homebridgeStub.logger.firstCall.args).deep.equals(['power is currently %s', 'OFF']);
   });

   it('replies "true" to Homebridge on valid HTTP GET device response "{"switch": "on"}"', function () {
      // 1. Arrange
      this.homebridgeStub.accessory.switch.status = {bodyRegEx: new RegExp(/"switch": "on"/), url: 'dummy' };

      // 2. Act
      // Call collected HTTP response callback to simulate device response.
      this.homebridgeStub.accessory._httpRequest.firstCall.callback(undefined, undefined, '{"switch": "on"}');

      // 3. Assert
      expect(this.homebridgeCallback.firstCall.args[1]).equals(true);
      expect(this.homebridgeStub.logger.firstCall.args).deep.equals(['power is currently %s', 'ON']);
   });

});
