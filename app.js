const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const customerRoute = require('./routes/Customer');
const managerRoute = require('./routes/Manager');
const db = process.env.db || "mongodb://thazin:thazin123@ds233596.mlab.com:33596/eibot";
const curl = require('curl')
const Manager = require('./models/Manager');
const Customer = require('./models/Customer');
const ManagerMessenger = require('./models/ManagerMessenger')
const staff = require('./models/Staff')

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDB Connected"));



//Get Started 
app.post('/getStarted',(request,response) => {
    let messengerID = request.body["messenger user id"];
   
    ManagerMessenger.findOne({messengerID},(err,result)=>{
       if(result === null){
            staff.findOne({messengerID},(err,result)=>{
                if(result === null){
                    response.json({
                        "redirect_to_blocks": ["Customer Register Check"]
                      })
                }
                else{
                    response.json({
                        "redirect_to_blocks": ["StaffMenu"]
                      })
                }
            })
       }
       else{
        response.json({
            "redirect_to_blocks": ["ManagerMenu"]
          })
       }
    })
})



app.use('/customer', customerRoute);
app.use('/manager', managerRoute);

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})