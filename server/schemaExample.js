const scheaExample = {
    title: 'string required max=5 min=4',
    name: 'string',
    age: 'number|integer required',
    isTrue:'boolean required',
    email:'email',
    additionalProperties: true,
    em:'hello hi',
    obj:{
        additionalProperties: true,
        required:true,
        nadme: 'string required',
        agf: 'integer required',
        er:{
            e:'integer required',
            required:true,
            additionalProperties: true,
        }
    },
    arr:[]
}

const bodyData = {
    age: 3,
    name:'john doe',
    title: "khhf",
    isTrue: true,
    email:"hello@gmail.com",
    em:'hello',
    obj:{
        come:3,
        nadme: 'required',
        agf:3,
        er:{
            e:5,
            come:4,
        }
    },
    arr:[{}]
}