const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const date=require(__dirname+"/date.js");
const app=express();


// var items=["buy food","cook food","eat food"];
// var workitems=[];


app.set("view engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.set('strictQuery',false);
mongoose.connect('mongodb://127.0.0.1/fruitsDB',{useNewUrlParser:true,useUnifiedTopology:true},(err)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log("successful")
    }
});
const itemsSchema=new mongoose.Schema({
    name:String
});
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Welcome to your to-do list"
})
const item2=new Item({
    name:"Hit the + button to add a new item"
})

const item3=new Item({
    name:"<-- Hit this  to delete an item"
})
const defaultitems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
    name:String,
    items: [itemsSchema]
});
const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){
   Item.find(function(err,founditems){
    if(founditems.length===0){
        Item.insertMany(defaultitems,function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("succeessfully saved default items");
            }
        });
        res.redirect("/");


    }
    else{
    res.render("list",{listTitle:"Today",newListitems:founditems});
}})

    
});
app.post("/",function(req,res){
    var itemName=req.body.newItem;
    var listname=req.body.list;
    const item=new Item({
        name:itemName
    })
    if(listname==="Today"){
    item.save();
    res.redirect("/");}
    else{
        List.findOne({name: listname},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listname);
        })
    }

});
app.post("/delete",function(req,res){
    const checkedItem=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItem,function(err){
            if(!err){
                console.log("succesfully deleted checked item");
                res.redirect("/")
            }
            else{
                console.log(err)
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err, foundList){
            if(!err){
                console.log("succesfully deleted checked item");
                res.redirect("/"+ listName);
            }
            else{
                console.log(err)
            }
        })

    }

    })
   

app.get("/:custom",function(req,res){
    const custom=_.capitalize(req.params.custom);
    List.findOne({name: custom},function(err,foundList){
        if(!err){
        if(!foundList){
            const list=new List({
                name:custom,
                items: defaultitems
            });
            list.save();
            
            res.redirect("/" + custom);

        }
        else{
            res.render("list",{listTitle: foundList.name,newListitems: foundList.items})
        }}
        else{
            console.log(err);
        }
    })
    
});

app.listen(3000,function(){
    console.log("server started at port 3000");
});