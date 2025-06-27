let num:number=7
let float:number=1.456

let bool:boolean=true

let str:string="joo"

let arr:string[]=['john','kelly']
let arr1:Array<string>=['collins','cooper']

let arr2:(string|number)[]=[1,'kevin']
let arr3:Array<string|number>=[3,4,'green']

let arr4:any[]=[1.4,'thompson',true,false]

//읽기 전용배열생성(readonly, ReadonlyArray)
let arr5: readonly string[]=['curry','ayesha']
let arr6: ReadonlyArray<Number>=[1,3]

//배열에 push , 수정 시 에러가 발생함.

//tuple
let tuple : [string,number];
tuple =['a',1]
tuple=['a',1,2]
tuple=[1,'b'] // 튜플에서는 순서 바뀌면 에러 발생!

let users:[number,string][]
users=[[1,'jonh'],[2,'doe']]

let tuple2:[string,number]
tuple2=['c',5]
tuple2.push(6)

//any
let any:any ='abc'
any=1
any=[]

//unknown
let unknown:unknown=false
let string1: boolean = unknown // 에러발생
let string2: boolean = unknown as boolean // 이렇게하면 가능

//object
let obj : object ={}
let array: object=[]
let nul: object = null //strict : true 이기때문에 에러가 생
let date = new Date()

const obj1:{id:number,title:string}:{
    id:1,
    title:'title1',
}

//union
let union:(string|number)
union = 'hi'
union=123
union=[]

//function
let function1:(arg1:number,arg2:number)=>number
function1=function(x,y){
    return x*y
}

let func2:()=> void
func2=function(){
    console.log('hi')
}

//null, undefined



//void
function keep():void{
    console.log('hi')
}

//never
const never:never[]=[]

//push 불가능