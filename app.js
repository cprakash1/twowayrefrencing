const mongoose=require('mongoose');
const Schema=mongoose.Schema
const express=require('express');
const app=express()
const path = require('path');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs');
app.engine('ejs',ejsMate);
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
})


mongoose.connect('mongodb://127.0.0.1:27017/relationshipdemo',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connected Successfully")
}).catch(err=>{
    console.log("NOT CONNECTED");
    console.log(err)
})

const FarmSchema=new Schema({
    name:String,
    location:String,
    products:[{
        type:Schema.Types.ObjectId,
        ref:'Product'
    }]
})

const ProductSchema=new Schema({
    name:String,
    price:Number,
    farms:[{
        type:Schema.Types.ObjectId,
        ref:'Farm'
    }]
})

const Product=mongoose.model('Product',ProductSchema);
const Farm=mongoose.model('Farm',FarmSchema);

app.get('/',async(req,res)=>{
    const farms=await Farm.find({});
    const products=await Product.find({});
    res.status(200).render('home',{farms,products});
})
app.get('/newfarm',(req,res)=>{
    res.status(200).render('newFarm')
})
app.post('/newfarm',async(req,res)=>{
    const {name,location}=req.body;
    const newFarm=new Farm({name,location});
    await newFarm.save();
    // console.log(newFarm);
    res.redirect('/')
})
app.get('/newproduct',(req,res)=>{
    res.status(200).render('newproduct')
})
app.post('/newproduct',async(req,res)=>{
    const {name,price}=req.body;
    const newProduct=new Product({name,price});
    await newProduct.save();
    // console.log(newProduct);
    res.redirect('/')
})
app.get('/farm/:id',async(req,res)=>{
    const farm=await Farm.findById(req.params.id).populate('products');
    console.log(farm)
    res.status(200).render('farmpage',{farm})
})
app.get('/addproduct/:id',async(req,res)=>{
    const farm=await Farm.findById(req.params.id);
    res.status(200).render('addproduct',{farm})
})
app.post('/addproduct/:id',async(req,res)=>{
    const farm=await Farm.findById(req.params.id);
    const product=await Product.findOne({name:req.body.name});
    await farm.products.push(product);
    await product.farms.push(farm);
    await farm.save();
    await product.save();
    let c='/farm/'.concat(req.params.id);
    res.redirect(c);
})
app.get('/product/:id',async(req,res)=>{
    const product=await Product.findById(req.params.id).populate('farms');
    res.status(200).render('productpage',{product})
})
app.get('/addfarm/:id',async(req,res)=>{
    const product=await Product.findById(req.params.id);
    res.status(200).render('addfarm',{product})
})
app.post('/addfarm/:id',async(req,res)=>{
    const product=await Product.findById(req.params.id);
    const farm=await Farm.findOne({name:req.body.name});
    console.log(farm)
    console.log(product)
    await farm.products.push(product);
    await product.farms.push(farm);
    await farm.save();
    await product.save();
    let c='/product/'.concat(req.params.id);
    res.redirect(c);
})

app.listen(80,()=>{
    console.log('http://127.0.0.1:80/');
})