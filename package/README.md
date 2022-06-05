# docsgen
This is a fast JSON validator for Node.js API that auto generate JSON schema for validation using the super fast power of [AJV](https://www.npmjs.com/package/ajv) json schem validator, and also auto generate json file that mets the OPEN API specification for path operation documantation. 

The Docsgen package abstract the stress of documenting each API endpoints through an automated scripts that auto generate a live express swagger ui documentation page and allow you to focus on the key business logic of your application endpoints.

This package is highly insipred by FASTAPI which is a python library that makes the developing API supper fast while using python and seeks to introduce thesame speed for nodejs backend developers.

## Prerequisites
This package works with node version 14.18.0 and up and npm version 6.14.15 up
* NPM
* Express
* bodyParser
* nodemone - not necessary but a a handy tool to watch for changes

```
npm install docsgen

```
## Getting Started
*To get this package running with your express apllicaton, follow  these simple example steps.*

- ### 1. Configure the package to your test

> At the index of your express application where you intialized the express app, import config function of the docsgen package and configure the docsgen package by parsing the following options:
```
 const options ={
    app:  the express app -REQUIRED
    title: the api documentation page title -OPTIONAL
   version: the version of the API - OPTIONAL, 
   description : the API documentation page title - OPTIONAL,
    summary : the API documentation page title - OPTIONAL,
    termsOfService : A URL to the Terms of Service for the API. This MUST be in the form of a URL. - OPTIONAL,
    license : {
      name: The license name used for the API. if lincense object is provided then the name is REQUIRED>
      url:  A URL to the license used for the API. This MUST be in the form of a URL. OPTIONAL
      identifier: An SPDX license expression for the API. OPTIONAL
    }
    contact: {
        email: The email address of the contact person ororganization. This MUST be in the form of an email address. OPTIONAL
        name: The identifying name of the contact person or organization -OPTIONAL
        url: : The URL pointing to the contact information. This MUST be in the form of a URL -OPTIONAL
    },
    docsPath: the path to the API documentation page. if not provided it will be set to defualt of "/api-docs" -OPTIONAL
 }
```
> *note that if the title and version is not provided the package picks the name and version of the application from the package.json file*

The configuration process will look like this:
```
const express =  require("express")
const bodyParser = require('body-parser')
const {config} = require('docgen')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

const options = {
    app,
    title:"Testing API", 
    version:"1.0.0",
    contact:{
        email: "hello@example.com",
        "name": "Da Santos"
    },
    ...
}
config(options)
...
```
> *note that you need to used the bodyParser first as the assess to the query body depends on it, and the only required field to be provided is the express app*

- ### 2. Use the Validator
> *Import the validator function from the docgen package and pass it as the middleware function in any path operation you want to validate and generate documentation for*

```
...
const {validator} = require('docgen')

app.get('/',validator(), (req, res)=>{
    res.send('welcome')
}) 

<!- OR within the express router -->

...
const {Router} = require("express");

const router =  Router()

router.get('/',validator(), (req, res)=>{
    res.send("hello world")
})
```

### 3. start the application
> start your server by either running at the roo
```
nodemon --ignore "autoGens"
```
> *the --ignore flag makes sure that nodemon does not restart the application each time a new endpoint document is generated*

OR you can start your application without nodemon.

Each time you test an endpoitn the validator function generate a live API documentation page for the endpoint

## Validating the path Operation
Using the validator middleware function to validate either the request body,  path params or query paramenters is extremely simple and easy. This process can be done by just defining the schema for each field and passing it schema object as a parameter to the validator function

### Example of Request Body validation
 let assume that you have a route to register users to an application and the request body fields include: username, height, email, phone, age and address and you want to validate each field data type then, the schema for this endpoint could look like this:

```
const postUsers: {
    username: "string min=3 max=13 required",
    password: "string required",
    email: "email required",
    height: "number",
    age:"integer",
    address:"number|string"
}
router.post('/users',validator(postUsers), (req, res)=>{
    //done some thing
})

```
**The provided postUsers schema makes sure of the following**
- the username must be a string with a character length range from 3 to 13 and it is required
- the password must be a string and it is required
- the email must match the a regular email pattern and it also required
- the height must be a number. Note that `number` data type include both integers and floats (i.e 3, 4.5)
- the age must be an integer and it is not required
- the address could be an number or a string 

Note that each filed can refrence another schema like:
```
const commentSchema:{
    commentId:"string",
    ...
}

const userSchema:{
    name:"string",
    comments:[commentSchema]
    ...
}
```
*the above code show that the userSchema refence a list of commentSchema* an in depth look of the Schema fields and it required validation operation keyworks will be seen later. 

 
### Example of path Params validation
Similar process of definning a schema for the validation of each field of the path params is also used, the only different is that the schema for the params validation is passed as the second parameter of the validator function as show below. 

```
const userByCommentIdSchem: {
    userId: "string required",
    commentId: "string required",
    
}
router.get('/users/:userId/comments/:commentId', validator(null, userByCommentIdSchem), (req, res)=>{
    //done some thing
})
```
**The provided userByCommentIdSchem schema makes sure of the following**
- the userId must be a string and it is required
- the commentId must be a string and it is required
*Note that the first parameter of the validator function is passed as null as there is no need to validate an empty requst body*

### Example of query parameter validation
The process is the very similar to the validation process of both request body and path params. The only difference here is that the shcema for the query field parameter  validation is passed as the third arguement of the validator function as shown below: 

```
const pagenationSchema: {
    skip: "number required",
    limit: "number required",
    
}
router.get('/users', validator(null, null, pagenationSchema), (req, res)=>{
    //done some thing
})

```
**In general the validator function accept three argurments which  are**
- 1. the request body schema - *Used for validating the request body object*
- 2. the path params schema - *Used for validating the path params object*
- 3. the path params schema - *Used for validating the query parameter object*

## Schema field operation Keywords

### Data type keyword: 
The following are the current supported data types: 
> *string number integer boolean any array enum and object*
string, number, integer. any and boolean data types are used by just definning them in the string qoute for the field they are needed, as shown bellow
```
const someSchema = {
 quantity: "number",
 isSold:"true"
 ...
}
```
while array and object data type are defined by their javascript symbols as shown below

```
const someSchema = {
    ...
    obj1:{
        additionalProperties: true,
        required:true,
        name: 'string required',
        age: 'integer required',
    },
    comments:[]
}
```

#### The **array** data type also accept three optional keywords which include:
- minItems: state the minimum number of items that an array can contain
- maxItems: state the maximum number of items that an array can contain
- UniqueItems: ensures that all items in the array are unique 
usage could be seen as 

```
const someSchema = {
    comments:['any uniqueItems minItems=3 maxItems=50']
    ...
}
```
*The above schema ensures that the comments field is an array of any data type whose minimum items must be from 3 and not more than 50*

#### The **Object** data type also accept two optional keywords wchich inlude as could be seen in the obj1 field example above:
- required: if true, ensures that the field is not omitted from it parent 
- additionalProperties: if true, ensures that field could accept additional fields that are not defined in the object schema

*That is the `required` and `additionalProperties` are not field names for the obj1 object but keywords that means that the obj1 cannot is a required field in its parent object and it can contain other additional fileds other than the name and age field it contains. If `additionalProperties` is set to false whcich is the default setting it then means the object can not accept any other field other than the one already defied in the schema*

#### the enum data type
this data type is used to validate enumerables(that is list of items that can only contain one of the items in the list). It usage is simple just pass the enumerable items as string separated by space for the field that must be an enumerable field, as shown below:
```
const someSchema = {
    ebumerableLevel:'PRIMARY SECONDARY TERTIARY',
    ...
}
```
**the above code ensures that only one of the three words *PRIMARY SECONDARY TERTIARY*  will be acceptable for the ebumerableLevel field**

### required keyword:
the required keyword is used to ensure that the field **MUST** be included
it usage for string, number, integer or boolean field id simple. It is done by passing the keyword `required` string qoate of the field as seen below:

```
{
    name: 'string required',
    age: 'integer required',
    ...
}
```

### pattern keyword:
this keyword is used to define a javascript string form of a regular expression for a field. It is used as:

```
{
    alphaNumeric: 'pattern=[a-zA-Z0-9] required',
    email: 'email required',
    ...
}
```
*It is worthy to note that this pattern keyword is used to form the `email` data type you see above*

