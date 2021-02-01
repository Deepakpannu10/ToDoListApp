const express = require( "express" );
const date = require( __dirname + "/date.js" );

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use( express.static("public") );
app.set('view engine', 'ejs');

let items = [];
let works = [];

app.get( "/", function( req, res ){
    // let day = date.getDateHindi();
    let day = date.getDateEnglish();

    res.render('list' ,{ listTitle : day, items : items });
} );

app.post( "/", function( req, res ){
    if(req.body.list==="Work"){
        works.push( req.body.newListItem );
        res.redirect( "/work" );
    }else{ 
        items.push( req.body.newListItem );
        res.redirect("/");
    }    
} );

app.get( "/work", function( req, res ){
    res.render('list' ,{ listTitle : "Work Day", items : works });
} );

app.post( "/work", function( req, res ){
    works.push( req.body.newListItem );
    res.redirect("/work");    
} );

app.listen( 3000, function(){
    console.log( "server is started on port 3000" );
} )

