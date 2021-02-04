const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require( "lodash" );

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// mongodb+srv://ToDoListDB:<password>@cluster0.zleae.mongodb.net/<dbname>?retryWrites=true&w=majority
const DB = "mongodb+srv://ToDoListDB:testdb@1@cluster0.zleae.mongodb.net/ToDoListDB?retryWrites=true&w=majority"

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(function (conn) {
        console.log("DB connected");
        // console.log(conn.connection);
    });

const listItemSchema = {
    listItem: String,
};

const listSchema = {
    name: String,
    listItems: [listItemSchema],
};

const Item = mongoose.model("Item", listItemSchema);
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    // let day = date.getDateHindi();
    let day = date.getDateEnglish();

    Item.find({}, function (err, result) {
        if (result.length === 0) {
            const dailyTask1 = new Item({
                listItem: "Eat Breakfast"
            });
            const dailyTask2 = new Item({
                listItem: "Do 3 LeetCode questions"
            });
            const defaultItems = [dailyTask1, dailyTask2];
            Item.insertMany(defaultItems, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Added successfully.");
            });
            res.redirect("/");
        }
    });

    Item.find({}, function (err, result) {
        if (err)
            console.log("Some error occ");
        else
            res.render('list', { listTitle: "Today", items: result });
    });
});

app.post("/", function (req, res) {
    const newItem = new Item({
        listItem: req.body.newListItem,
    });
    if (req.body.list === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        // const newItem = new Item({
        //     listItem: req.body.newListItem,
        // });
        // const newTask = [newItem];
        // Item.insertMany(newTask, function (err) {
        //     if (err)
        //         console.log(err);
        //     else
        //         console.log("Added successfully.");
        // });  instead of all this just use item.save();
        // newItem.save();
        // res.redirect("/");

        const listName = req.body.list;
        List.findOne({ name: listName }, function (err, results) {
            if (err) {
                console.log("Some error while adding in custom list");
            } else {
                results.listItems.push(newItem);
                results.save();
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customListName", function (req, res) {
    const customListName = lodash.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, results) {
        if (err) {
            console.log("There was some error");
        } else {
            if (!results) {
                const list = new List({
                    name: customListName,
                    listItems: []
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                let day = date.getDateEnglish();
                res.render('list', { listTitle: customListName, items: results.listItems });
            }
        }
    });

});

app.post("/delete", function (req, res) {
    // console.log(req.body.checkboxid);
    const listName = req.body.listName;
    const itemID = req.body.checkboxid;
    if (listName === "Today") {
        Item.findByIdAndDelete(req.body.checkboxid, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                // console.log("Deleted : ", docs); 
            }
        });
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, listFound) {
            if (err) {
                console.log("Custom List item deleting issue");
            } else {
                // listFound.listItems.
                List.findOneAndUpdate({ name: listName }, { $pull: { listItems: { _id: itemID } } }, function (err, foundList) {
                    if (!err) {
                        res.redirect("/" + listName);
                    }
                });
            }
        });
    }
});

app.listen(3000, function () {
    console.log("server is started on port 3000");
})

