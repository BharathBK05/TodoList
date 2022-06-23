//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://------", {useNewUrlParser : true});

const itemSchema = {
  name : String
};

const listSchema = {
  name : String,
  items : [itemSchema]
}

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name : "Bharath"
});

const item2 = new Item({
  name : "Kumar"
});

const item3 = new Item({
  name : "Kalaimani"
});

const defaultItem =[item1,item2,item3];



app.get("/", function(req, res) {

  Item.find({},function(err, foundItem){
    if(foundItem.length ===0)
    {
      Item.insertMany(defaultItem,function(err){
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("successfully inserted in DB");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
    
  });
 

});

app.get("/:customItemName", function(req,res){
  const customItemListName = _.capitalize(req.params.customItemName);
  
  List.findOne({name:customItemListName}, function(err,foundList)
  {
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customItemListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/" + customItemListName);
      }
      else
      {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") 
  {
    Item.findByIdAndRemove(checkedId, function(err){
      if (!err) 
      {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });

  }
  //Item.findByIdAndRemove(checkedId,function(err){
  //  if(!err)
  //  {
  //    console.log("Successfully deleted");
  //    res.redirect("/");
   // }
  //})

})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
