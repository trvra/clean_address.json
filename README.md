# clean_address.json
A mirror of AWS λ code mimicking the Blackbox clean_address.json endpoint

## Input
Sent as the body of a POST request to /clean_address.json, this is used to validate addresses with the [USPS Verify Address API](https://www.usps.com/business/web-tools-apis/address-information-api.pdf). Built on top of AWS API Gateway and AWS λ, this runs on a random server somewhere, probably solely based on how Jeff Bezos felt that morning.

Example:
```
{
  "country": "US",
  "name": "Barack Obama",
  "address_line_1": "1600 Pennsylvania Ave",
  "address_line_2": "",
  "postal_code": "20006"
}
```

## Response
Includes the additional information about the address in the proper format for future use. Note that the USPS endpoint isn't the ultimate source of truth, this response should be checked by the user to ensure its correctness.

Example:
```
{
  "address_line_1": "1600 PENNSYLVANIA AVE",
  "address_line_2": "",
  "city": "WASHINGTON DC",
  "country": "US",
  "county": "?",
  "po_box_detected": false,
  "postal_code": "20006",
  "region": "DC"}
}
```

## Error
If the input is malformed and the USPS endpoint returns an error, we respond with a 422 UNPROCESSABLE ENTITY and a small error message:

`{"error": "We could not find or clean your address."}`

## Future Improvements
* Figure out how to find `county` from a given address
* Add support for non-USA addresses
* Use [serverless](https://github.com/serverless/serverless) framework to better manage AWS λ programmatically
