# docsgen
This is a fast JSON validator for Node.js API that auto generate JSON schema for validation using the supper fast power of AJV json schem validator.
this package also auto generate json file that mets the OPEN API specification for path operation documantation. 
The Docsgen package abtract the stress of documenting each API endpoints through an automated scripts and allow you to focus on the key business logic of your application

## Installation
> npm install docsgen

## Usage
> at the index of your express application where you intialized the express app, import config function of the docsgen package and configure the docsgen package by parsing the following options:

>> const options ={
>>    app: <the express app- REQUIRE>
>>    title: <the api documentation page title - OPTIONAL>
>>   version: <the version of the api - OPTIONAL>, 
>>   description : <the api documentation page title - OPTIONAL>,
>>    summary : <the api documentation page title - OPTIONAL>,
>>    termsOfService : <the api documentation page title - OPTIONAL>,
>>    license : {
>>      name: <The license name used for the API. if lincense object is provided then the name is REQUIRED>
>>      url: <A URL to the license used for the API. This MUST be in the form of a URL. OPTIONAL>
>>      identifier: <An SPDX license expression for the API. OPTIONAL>
>>    }
>>    contact: {
>>        email: <The email address of the contact person ororganization. This MUST be in the form of an email address.>
>>        name: <The identifying name of the contact person or organization>
>>        url: : <The URL pointing to the contact information. This MUST be in the form of a URL>
>>    },
>>    docsPath: <the path to the API documentation page. if not provided it will be set to defualt of "/api-docs">
>> }
>> **note that if the title and version is not provided the package picks the name and version of the application from the package.json file**

### Example of option passed
