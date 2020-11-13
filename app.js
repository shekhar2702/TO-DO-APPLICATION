//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<dbadmin>:<password>@cluster0.<Mnogo atlas id>.mongodb.net/<dbname>?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const itemsSchema = new mongoose.Schema({
  name : String
});
const Item = mongoose.model("Item",itemsSchema);

const listSchema = mongoose.Schema({
  name : String,
  items : [itemsSchema]
});
const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name: "Task 1 "
});
const item2 = new Item({
  name: "Task 2 "
});
const item3 = new Item({
  name: "Task 3 "
});
const defaultItem = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},function(err,items){
    if(items.length === 0){
      Item.insertMany(defaultItem,function(err){
        if (err) {
          console.log(err);
        }
        else {
          console.log("Inserted successfully");
        }
        res.redirect("/");
      });
    }
    else{
      console.log(items);
    res.render("list", {listTitle: "Today", newListItems: items});
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  console.log(listName);
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listName},function(err, foundList){
      if(!err){
        console.log(foundList.items);
        foundList.items.push(item);
        console.log(foundList.items);
        foundList.save();
        res.redirect("/"+listName);
      }
    }
  );
}

  });

  app.post("/delete",function(req,res){
    const itemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(itemId,function(err){
          if(!err){
            console.log("Item deleted successfully");
            res.redirect("/");
          }
      });
    }
    else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
        if (!err) {
          res.redirect("/"+listName);
        }
      });
    }
  });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });
app.get("/:para",function(req,res){
  const customListName = _.capitalize(req.params.para);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Not exist");
        const list = new List({
          name : customListName,
          items : defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        res.render("list",{listTitle:customListName , newListItems:foundList.items});
      }
    }
  });

});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);
// app.listen(port, function() {
//   console.log("Server started successfully.");
// });
app.listen(process.env.PORT || 3000,function(){
  console.log("Server is running on port 3000");
});
