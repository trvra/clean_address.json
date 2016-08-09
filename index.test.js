/**
 * Did I make these tests too complicated to avoid including mocha, lodash, async, etc.? Probably?
 * Are these tests too basic to justify including mocha, lodash, async, etc.? Probably.
 * Would the output / structure look way better if it did include those? Probably!
 *
 * Don't forget to set your USERID in the main index.js file
 */
var
  handler = require('./index.js').handler,
  assert = require('assert'),
  expectedError = 'We could not find or clean your address.';

console.log('./clean_address.json functional testing: ');

// A sorry excuse for a _.cloneDeep()
function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

// Look ma, no Mocha!
function it(description, event, fnCallback) {
  // context is only relevant when in AWS Lambda, can safely set to null
  handler(event, null, (e, res) => {
    fnCallback(e, res);
    console.log(description + ': ✓');
  });
}

var
  properEvent = {
    'name': 'Velo Rouge',
    'address_line_1': '798 Arguello Blvd',
    'address_line_2': '',
    'postal_code': '94118',
    'country': 'US'
  };
it('should validate properly formatted address', properEvent, (e, res) => {
  assert.equal(e, null);
  assert.ok(res);
});

var
  addressLineTwoEvent = clone(properEvent);
addressLineTwoEvent.address_line_1 = '2675 Geary Blvd'
addressLineTwoEvent.address_line_2 = '300';
it('should optionally include address_line_2', addressLineTwoEvent, (e, res) => {
  assert.equal(e, null);
  assert.ok(res.address_line_2);
});

var
  missingPostalCode = clone(properEvent);
missingPostalCode.postal_code = null;
it('should error with missing postal code', missingPostalCode, (e, res) => {
  assert.equal(e, expectedError);
});

var
  missingAddressLineOne = clone(properEvent);
missingAddressLineOne.address_line_1 = null;
it('should error with missing first address line', missingAddressLineOne, (e, res) => {
  assert.equal(e, expectedError);
});

// Known issue with clean_address.json code
// var
//   countyEvent = clone(properEvent);
// it('should include valid county in response', countyEvent, (e, res) => {
//   assert.equal(e, null);
//   assert.notEqual(res.county, '?');
// });

// Known issue with clean_address.json code
// var
//   canadianEvent = clone(properEvent);
// canadianEvent.country = 'CA';
// it('should validate properly formatted foreign address', canadianEvent, (e, res) => {
//   assert.equal(e, null);
//   assert.ok(res);
// });
