/**
 * This is gross, but hear me out...
 * We know the response structure and don't want to bundle a bulky XML parser
 * for this quick prototype. Instead, we can slice the value out of the tag
 * with ~* STRING MAGIC *~
 */
function parseXML(response, key) {
  var
    openingTag = '<' + key + '>',
    openingIndex = response.indexOf(openingTag) + openingTag.length,
    closingTag = '</' + key + '>',
    closingIndex = response.indexOf(closingTag);

  if (openingIndex != -1 && closingIndex != -1) {
    return response.slice(openingIndex, closingIndex);
  } else {
    return '';
  }
}

/**
 * When this executes in Lambda, the method is given these input params:
 *  - event Contains data in request body coming from API Gateway
 *  - context Meta information about the current execution in AWS
 *  - callback Return function that expects (error, result) when our work is done
 */
exports.handler = (event, context, callback) => {
  var
    http = require('http'),
    userID = '123YOURID4567', // Your USPS userID to authenticate
    endpoint = 'http://production.shippingapis.com/ShippingAPI.dll?API=Verify&XML=',
    xml = encodeURI('<AddressValidateRequest USERID="' + userID + '">' +
            '<ReturnCarrierRoute>true</ReturnCarrierRoute>' + // Use Carrier Route to determine if address is PO Box
            '<Address ID="0">' +
            '<FirmName/>' +
            '<Address1>' + (event.address_line_2 || '') + '</Address1>' +
            '<Address2>' + event.address_line_1 + '</Address2>' +
            '<City/>' +
            '<State/>' +
            '<Zip5>' + event.postal_code + '</Zip5>' +
            '<Zip4/>' +
            '</Address></AddressValidateRequest>'); // XML payload, URI encoded

  http.get(endpoint + xml, (res) => {
    body = '';
    res.on('data', (chunk) => {
      body += chunk;
    }).on('end', () => {
      if (parseXML(body, 'Error') === '') {
        var
          cleanAddress = {
            address_line_1: parseXML(body, 'Address2'),
            address_line_2: parseXML(body, 'Address1'),
            city: parseXML(body, 'City'),
            country: event.country,
            county: '?',
            po_box_detected: parseXML(body, 'CarrierRoute').match(/C77[\d]/) !== null,
            postal_code: parseXML(body, 'Zip5') + '-' + parseXML(body, 'Zip4'),
            region: parseXML(body, 'State')
          };

        return callback(null, cleanAddress);
      } else {
        return callback('We could not find or clean your address.');
      }
    });
    res.resume();
  });
};
