//user.js文件负责用户的注册的新增操作以及用户信息的查询操作
var mongo = require('./db');
function User(user) {
   this.name =user.name;
   this.password =user.password;
   this.email = user.email;
}
module.exports=User;
User.prototype.save =function (callback) {
  //收集数据
    var user={
        name:this.name,
        password:this.password,
        email:this.email
    }
    //打开数据库
    mongo.open(function (err,db) {
        //判断数据库打开是否有错，如果有错，将错误的结果返回给回调函数
        if(err){//err错误对象
            return callback(err);
        }
        //读取user集合
        db.collection('users',function(err,collection) {
            //如果在读取集合的时候有错，关闭数据库，并将错误返回给回掉函数
            if (err) {
                //关掉数据
                mongo.close();
                //并将错误返回给回掉函数
                return callback(err);
            }
        //将用户数据插入users集合当中去.
        collection.insert(user,{safe:true},function(err,user) {
            //关闭数据库
            mongo.close();
            //如果有错的话，返回错误结果
            if (err) {
                return callback(err);
            }
            //如果没有错误的话，返回的是插入的那条数据的第一个字段--name用户名
            callback(null, user[0]);//成功的话返回用户名
        })
        })
    })
}
//获取注册信息的方法 name：你要查询的用户名
User.get =function (name,callback) {
   mongo.open(function (err,db) {
     if(err){
       return callback(err)  ;
     }
     db.collection('users',function (err,collection) {
         if(err){
             mongo.close();
             return callback(err);
         }
         //查询name未指定名称的用户信息，返回用户信息
         collection.findOne({name:name},function(err,user){
             mongo.close()
             if(err){
                 return callback(err);
             }
             return callback(null,user);//成功返回查询的用户信息

         })
     })
   })
}
