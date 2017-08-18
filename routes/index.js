
//加密模块
var crypto = require('crypto');
//User对象操作类
var User = require('../models/user');

//如果登录了，是无法访问登录和注册页面的
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '不能重复登录!');
       return res.redirect('back');//返回之前的页面
    }
    next();
}
//如果没有登录，是无法访问发表和退出页面的
function checkLogin(req, res, next) {
    if (!req.session.user) {//未登录
        req.flash('error', '请先登录!');
       return res.redirect('back');
    }
    next();
}
module.exports = function(app){
    //首页路由
    app.get('/',function(req,res){
        res.render('index',{
            title:'首页',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        });
    })
    //注册页面
    app.get('/reg',checkNotLogin,function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        });
    })
    //注册行为
    app.post('/reg',checkNotLogin,function (req,res) {
        var name = req.body.name;
        var password =req.body.password;
        var password_re =req.body['password-repeat'];
        var email = req.body.email;
        //1.检查密码是否一致
        if(password != password_re){
            //给出错误提示
            req.flash('error','两次密码不一致');
            //返回到注册页面去
            return res.redirect('/reg');
        }
        //2.对密码进行加密
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //3.实例化User类，赋值
        var newUser = new User({
            name:name,
            password:password,
            email:email
        });
        //检查用户名在数据中
        User.get(newUser.name,function (err,user) {
          if(err){
            req.flash('error,err')  ;
            return res.redirect('/reg');
          }
          //用户名重复了
            if(user){
              req.flash('error','用户名不能重复');
                return res.redirect('/reg');
            }
            //保存到数据库去
            newUser.save(function(err,user){
                if(err){
                    req.flash('error',err);
                    return res.redirect('./reg');
                }
                //用户的信息存入session
                req.session.user = newUser;
                req.flash('success','注册成功');
               return res.redirect('/');
            });
        })
    })
    //登录页面
    app.get('/login',checkNotLogin,function(req,res){
        res.render('login',{
            title:'登录',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        });
    })
    //登录行为
    app.post('/login',checkNotLogin,function (req,res) {
        var md5 =crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //检查用户名是否存在
        User.get(req.body.name,function(err,user){
            if(!user){
                req.flash('error','用户名不存在');
                return res.redirect('/login');
            }
            //检查密码是否一致如果不一样提示密码错误
            if(user.password != password){
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            //都匹配之后，将用户的信息存入session并提示登录成功，跳转首页
            req.session.user = user;
            req.flash('success','登录成功');
            return res.redirect('/');
        })

    })
    //发表页面
    app.get('/post', checkLogin,function(req,res){
       res.render('post',{
            title:'发布文章',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        });
    })
    //发表行为
    app.post('/post', checkLogin,function (req,res) {
    })
    //退出
    app.get('/logout', checkLogin,function (req,res) {
        req.session.user = null;
        req.flash('success', '退出成功!');
       return res.redirect('/');//退出成功后跳转到主页
    })
}
