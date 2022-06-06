# valdocs

This is a fast JSON validator for Node.js API that auto-generates JSON schema for validation using the super-fast power of [AJV](https://www.npmjs.com/package/ajv) JSON schema validator, and also auto-generates JSON file that meets the OPEN API specification for path operation documentation. 


The valdocs package abstracts the stress of documenting each API endpoint through automated scripts that auto-generate a live express swagger UI documentation page and allow you to focus on the key business logic of your application endpoints.

This package is highly inspired by FASTAPI which is a python library that makes the developing API supper fast while using python and such valdocs seeks to introduce the same speed for nodejs backend developers.

## Prerequisites
This package works with
* NPM
* Express
* bodyParser
* nodemone - not necessary but a a handy tool to watch for changes

```
npm install valdocs

```
## Getting Started
*To get this package running with your express application, follow these simple steps.*

- ### 1. Configure the package to your test

> At the index of your express application where you initialized the express app, import config function of the valdocs package and configure the valdocs package by parsing the following options:
```
 const options ={
    app:  the express app -REQUIRED
    title: the api documentation page title - OPTIONAL
    version: the version of the API - OPTIONAL, 
    description : A detailed description of the API documentation page - OPTIONAL,
    summary : A summary of the API documentation page - OPTIONAL,
    termsOfService : A URL to the Terms of Service for the API. This MUST be in the form of a URL. - OPTIONAL,
    license : {
      name: The license name used for the API. if lincense object is provided then the name is REQUIRED>
      url:  A URL to the license used for the API. This MUST be in the form of a URL. OPTIONAL
      identifier: An SPDX license expression for the API. OPTIONAL
    }
    contact: {
        email: The email address of the API creator or organization. This MUST be in the form of an email address. OPTIONAL
        name: The identifying name of the contact person or organization -OPTIONAL
        url: : The URL pointing to the contact information. This MUST be in the form of a URL -OPTIONAL
    }
 }
```
> *note that if the title or the version is not provided the package picks the name or version of the application from the package.json file*

The configuration process will look like this:
```
const express =  require("express")
const bodyParser = require('body-parser')
const {config} = require('valdocs')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
> *note that you need to use the body-parser first as this allows the application to assess the query body on which this package depends on. Secondly, the only required field to be provided to the config option object is the express app*

- ### 2. Use the Validator
> *Import the validator function from the valdocs package and pass it as the middleware function in any path operation you want to validate and generate documentation for*

```
...
const {validator} = require('valdocs')

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
> start your server by either running:
```
node <server name> // for instance node server.js
<!-- or -->
nodemon --ignore "autoGens"  <!-- if you are using nodemon  -->
```
> *the --ignore flag makes sure that nodemon does not restart the application each time a new endpoint JSON SCHEMA document is generated and store in the AutoGens folder*


Each time  an endpoint is tested for the first time, the validator function generate JSON Schema Object for the endpoint validation and same time generate an OPEN API object for a live API documentation page for the endpoint. This process only happen **ONCE** as far as there is no change to the schema of request body or the schema of the query or params. This is to ensure effiency of the package and prevent repeated autogenration of JSON schema, if there is a change in the schema of either the request body, qeury or params, the JSON schema object and OPEN API specification object is updated to account for such change. 

## Validating the path Operation
Using the validator middleware function to validate either the request body,  path params, or query parameters is extremely simple and easy. This process can be done by just defining the schema for each field and passing the defined schema object as a parameter to the validator function.

### Example of Request Body validation
 let's assume that you have a route to register users to an application and the request body fields include: username, height, email, phone, age, and address and you want to validate each field data type then, the schema for this endpoint could look like this:

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
**The provided postUsers schema ensures the following:**
- the **username** must be a string with a character length range from 3 to 13 and it is required
- the **password** must be a string and it is required
- the **email** must match the a regular email pattern and it also required
- the **height** must be a number. Note that `number` data type include both integers and floats (i.e 3, 4.5)
- the **age** must be an integer and it is not required
- the **address** could be an number or a string 

Note that each field can reference another schema like:
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
*the above code shows that the userSchema referenced a list of commentSchema*. An in depth look of the Schema fields and its required validation operation keyworks will be seen later. 

 
### Example of path Params validation
A similar process of defining a schema for the validation of each field of the path params is also used, the only difference is that the schema for the params validation is passed as the second parameter of the validator function as shown below: 

```
const userByCommentIdSchema: {
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
*Note that the first parameter of the validator function is passed as null as there is no need to validate an empty request body since it not a post-operation*

### Example of query parameter validation
The process is very similar to the validation process of both request body and path params. The only difference here is that the schema for the query field parameter  validation is passed as the third argument of the validator function as shown below: 

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
- 3. the query schema - *Used for validating the query parameter object*

## Schema field operation Keywords

### Data type keyword: 
The following are the current supported data types: 
> *string number integer boolean any array enum and object*
string, number, integer, any, and boolean data types are used by just definning them in the string qoute for the field they are needed, as shown bellow:
```
const someSchema = {
 quantity: "number",
 isSold:"boolean"
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

#### The **Object** data type also accept two optional keywords which could be seen in the obj1 field example above:
- required: if true, ensures that the field is not omitted from its parent object 
- additionalProperties: if true, ensures that the object could accept additional fields that are not defined in the object schema

*That is the `required` and `additionalProperties` are not field names for the obj1 object but keywords which means that the obj1 cannot is a required field in its parent object and it can contain other additional fields other than the name and age field it contains. If `additionalProperties` is set to false which is the default setting it then means the object can not accept any other field other than the one already defined in the schema*

#### the enum data type
this data type is used to validate enumerables(that is list of items that can only contain one of the items in the list). It usage is simple just pass the enumerable items as string separated by space for the field that must be an enumerable field, as shown below:
```
const someSchema = {
    level:'PRIMARY SECONDARY TERTIARY',
    ...
}
```
**the above code ensures that only one of the three words *PRIMARY SECONDARY TERTIARY*  will be acceptable for the level field**

### required keyword:
the required keyword is used to ensure that the field **MUST** be included
its usage for any string, number, integer, or boolean field is simple. It is done by passing the keyword `required` string quote of the field as seen below:

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

## The Autogenerated documentation page
At each endpoint, you test a swagger UI documentation page is created and the endpoint documentation for the path will be added to the swagger UI page. So if you navigate to the root URL address of your server/api-docs you see the API documentation page for you application. For instance, let's assume my application is running at 
`http//localhost:8001`, then the documentation page for my API will be at `http//localhost:8001/api-docs`, and when you navigate to the URL you will see your documentation looking like:

1[example of a documentation page](package/images/img_1.png)
