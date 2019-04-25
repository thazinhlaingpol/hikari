const express = require('express');
const router = express.Router();
const product = require('../models/Product');
const ManagerMessenger = require('../models/ManagerMessenger');
const Manager = require('../models/Manager');
const category = require('../models/Category')
const cart = require('../models/Cart')
const order = require('../models/Order')
const axios = require('axios')
const acOrder = require('../models/AcceptedOrders')



router.post('/register_Check', (request, response) => {
  let messengerID = request.body["messenger user id"];

  ManagerMessenger.find({
    messengerID
  }, (err, managers) => {

    if (managers == undefined || managers.length == 0) {
      response.json({
        "redirect_to_blocks": ["ManagerRegistration"]
      })
    } else {
      response.json({

        "redirect_to_blocks": ["ManagerMenu"]

      })


    }
  })
})

router.post('/register', (request, response) => {
  let messengerID = request.body["messenger user id"];
  let managerID = request.body.managerid;
  let mcode = request.body.mcode;





  ManagerMessenger.find({
    managerID
  }, (err, managers) => {

    if (managers == undefined || managers.length == 0) {
      Manager.find({
        managerID
      }, (err, managers) => {

        if (managers[0] === undefined) {
          response.json({
            "messages": [{
              "text": "Your Manager ID is not found"
            }]
          })
        } else {
          if (mcode === managers[0].confirmCode) {
            ManagerMessenger.create({
              messengerID,
              managerID
            }, (err, messenger) => {
              if (messenger) {
                response.json({

                  "messages": [{
                      "text": "Manager Successfully Logged In"
                    },


                  ],
                  "redirect_to_blocks": ["ManagerMenu"],
                })
              }
            })
          } else {
            response.json({
              "messages": [{
                "text": "Invalid Code"
              }]
            })
          }
        }
      })
    } else {
      response.json({
        "messages": [{
          "text": "There is already a messenger account signed in with this ID"
        }]
      })
    }



  })




})

router.post('/update_Category', (request, response) => {
  let productID = request.body.pid;
  let categoryName = request.body.category

  product.updateOne({
    productID
  }, {
    $set: {
      "categoryName": categoryName
    }
  }, (err, result) => {
    if (result.nModified !== 0) {
      response.json({
        "messages": [{
          "text": `Added to category`
        }]
      })
    }
  })
})

router.post('/add_to_category', (request, response) => {
  let productID = request.body.pid;
  category.find({}, (err, result) => {

    response.json({

      "messages": [{
          "text": "What category does the product belong to?"
        },
        {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": result.map((current, index, array) => {
                return {
                  "title": current.categoryName,
                  "image_url": current.image,
                  "buttons": [{
                    "type": "show_block",
                    "block_names": ["UpdateCategory"],
                    "set_attributes": {
                      "pid": productID,
                      "category": current.categoryName
                    },
                    "title": "Add"
                  }]
                }
              })




            }
          }
        }
      ]

    })
  })
})

//Register Product
router.post('/product_register', (request, response) => {
  let messengerID = request.body["messenger user id"];
  let productID = request.body.pid;
  let productName = request.body.pname;
  let price = request.body.pprice;
  let description = request.body.pdescription;
  let image = request.body.pphoto;
  let stock = request.body.stock;
  let categoryName = "";




  ManagerMessenger.find({
    messengerID
  }, (err, manager) => {
    if (manager[0] === undefined) {
      response.json({
        "messages": [{
          "text": "You are not allowed to do this operation"
        }]
      })
    } else {
      product.create({
        productID: productID,
        productName: productName,
        price: price,
        categoryName: categoryName,
        description: description,
        image: image,
        stock: stock
      }, (err, Product) => {
        if (Product) {
          response.json({
            "messages": [{
              "text": "Added Product"
            }],
            "redirect_to_blocks": ["AddToCategory"],

            "set_attributes": {
              "pid": productID
            }
          })
        }
      })
    }
  })
});


//View Accepted Orders
router.post('/viewAccepted',(request,response) => {
  acOrder.find({},(err,orders)=>{
    var arr = []
    orders.forEach(function (order){
      var productInfo = ""
      order.products.forEach(function (product) {
        productInfo += product.productID + " : " + product.totalQty
        productInfo += "\n"
      })

      arr.push({
        "title": "Order ID : " + order.orderID,
        "subtitle": productInfo,
        "image_url": 'https://banner2.kisspng.com/20180406/adq/kisspng-computer-icons-purchase-order-blog-order-5ac73463e55867.3934822515230045159394.jpg',
        

        // })
      })
    })
    response.json({

      "messages": [{
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": arr

          }
        },

      }, ]

    })
  })
})


//Staff Decline Order
router.post('/staffDecline',(request,response) => {
  var orderID = request.body.orderID
  order.findOne({orderID},(err,result2) => {
   
  

  // Send message to manager
  axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

          "recipient": {
            "id": "2647302035341463"
          },
          "message": {
            "text": "There is no stock for Order: " + orderID 
          }

        })
        .then((res) => {
          console.log(`statusCode: ${res.statusCode}`)
          console.log(res.data.recipient_id)
          axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

            "recipient": {
              "id": "2207366956029162"
            },
            "message": {
              "text": "Your order " + orderID + " have been declined."
            }
      
          })
          .then((res) => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res.data.recipient_id)
            order.deleteOne({
              orderID
            }, (err, result) => {
      
      
            })
            response.json({
              "messages": [{
                "text": "Send to managers and customers"
              }]
            })
            
          })
          .catch((error) => {
            console.error(error.response)
          })
          
        })
        .catch((error) => {
          console.error(error.response)
        })
    
    // Send message to customer
  
   
  })
})


// Manager Accept Order

router.post('/accept', (request, response) => {
  var orderID = request.body.orderID
  order.findOne({
    orderID
  }, (err, result2) => {

    acOrder.create({
      orderID: result2.orderID,
      messengerID: result2.messengerID,
      date: result2.date,
      product: result2.products
    })


  })

  axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

      "recipient": {
        "id": "2207366956029162"
      },
      "message": {
        "text": "Your order " + orderID + " have been accepted."
      }

    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res.data.recipient_id)
      order.deleteOne({
        orderID
      }, (err, result) => {


      })
    })
    .catch((error) => {
      console.error(error.response)
    })
  response.json({
    "messages": [{
      "text": "Message Sent"
    }],
    "redirect_to_blocks" : ["ManagerMenu"]
  })

})



//Manger Decline Order
router.post('/decline', (request, response) => {
  var orderID = request.body.orderID
  console.log(orderID)
  axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

      "recipient": {
        "id": "2207366956029162"
      },
      "message": {
        "text": "Your order have been declined."
      }

    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res.data.recipient_id)
      order.deleteOne({
        orderID
      }, (err, result) => {


      })
    })
    .catch((error) => {
      console.error(error.response)
    })
  response.json({
    "messages": [{
      "text": "Message Sent"
    }]
  })

})

//Manager Add Category
router.post('/addCategory', (request, response) => {
  let categoryName = request.body.categoryName
  let image = request.body.imageName

  category.create({
    categoryName,
    image
  }, (err, result) => {
    if (result) {
      response.json({
        "messages": [{
          "text": "Category Added"
        }],
        "redirect_to_blocks": ["ManagerMenu"]
      })
    }
  })
})



// When staff accept order
router.post('/staffAccept',(request,response) => {
  var orderID = request.body.orderID
  console.log(orderID)
  order.findOne({orderID},(err,result2) => {
    acOrder.create({
      orderID: result2.orderID,
      messengerID: result2.messengerID,
      date: result2.date,
      product: result2.products
    })
  

  // Send message to manager
  axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

          "recipient": {
            //Manager ID
            "id": "2434273869940106"
          },
          "message": {
            "text": "There is stock for Order: " + orderID 
          }

        })
        .then((res) => {
          console.log(`statusCode: ${res.statusCode}`)
          console.log(res.data.recipient_id)
          //Send message to customer
          axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

            "recipient": {
              //Customer Menu
              "id": "2207366956029162"
            },
            "message": {
              "text": "Your order " + orderID + " have been accepted."
            }
      
          })
          .then((res) => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res.data.recipient_id)
            order.deleteOne({
              orderID
            }, (err, result) => {
      
      
            })
            response.json({
              "messages": [{
                "text": "Sent to managers and customers"
              }],
              "redirect_to_blocks": ["StaffMenu"]
              
            })
            
          })
          .catch((error) => {
            console.error(error.response)
          })
          
        })
        .catch((error) => {
          console.error(error.response)
        })
    
    // Send message to customer
  
   
  })
  


})

//Ask Staff if there is stock

router.post('/askStaff',(request,response) => {
  var orderID = request.body.orderID

  axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

      "recipient": {
        "id": "1939895329471107"
      },
      "message": {
        "text": "Please check " + orderID + " for quantity"
      }

    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res.data.recipient_id)
      response.json({
        "messages": [{
          "text": "Send to staff"
        }],
        "redirect_to_blocks": ["ManagerMenu"]
      })
      
    })
    .catch((error) => {
      console.error(error.response)
    })

})

// Staff view orders
router.post('/viewStaffOrders',(request,response) =>{
  order.find({}, (err, orders) => {
    var arr = []

    orders.forEach(function (order) {
      var productInfo = ""
      order.products.forEach(function (product) {
        productInfo += product.productID + " : " + product.totalQty
        productInfo += "\n"
      })
      productInfo += "Date : " + order.date

      arr.push({
        "title": "Order ID : " + order.orderID,
        "subtitle": productInfo,
        "image_url": 'https://banner2.kisspng.com/20180406/adq/kisspng-computer-icons-purchase-order-blog-order-5ac73463e55867.3934822515230045159394.jpg',
        "buttons": [{
            "type": "show_block",
            "block_names": ["StaffAccept"],
            "set_attributes": {
              "orderID": order.orderID
            },
            "title": "Accept"
          },
          {
            "type": "show_block",
            "block_names": ["StaffDecline"],
            "set_attributes": {
              "orderID": order.orderID
            },
            "title": "Decline"
          }
        ]

        // })
      })



    })
    response.json({

      "messages": [{
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": arr

          }
        },

      }, ]

    })
  })
  
})

router.post('/viewOrders', (request, response) => {
  order.find({}, (err, orders) => {
    var arr = []

    orders.forEach(function (order) {
      var productInfo = ""
      order.products.forEach(function (product) {
        productInfo += product.productID + " : " + product.totalQty
        productInfo += "\n"
      })
      productInfo += "Date : " + order.date

      arr.push({
        "title": "Order ID : " + order.orderID,
        "subtitle": productInfo,
        "image_url": 'https://banner2.kisspng.com/20180406/adq/kisspng-computer-icons-purchase-order-blog-order-5ac73463e55867.3934822515230045159394.jpg',
        "buttons": [{
            "type": "show_block",
            "block_names": ["Accept"],
            "set_attributes": {
              "orderID": order.orderID
            },
            "title": "Accept"
          },
          {
            "type": "show_block",
            "block_names": ["Decline"],
            "set_attributes": {
              "orderID": order.orderID
            },
            "title": "Decline"
          },
          {
            "type": "show_block",
            "block_names": ["AskStaff"],
            "set_attributes": {
              "orderID": order.orderID
            },
            "title": "Check Godown"
          }
        ]

        // })
      })



    })
    response.json({

      "messages": [{
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": arr

          }
        },

      }, ]

    })
  })
})


// Delete Product
router.post('/delete', (request, response) => {
  let messengerID = request.body["messenger user id"];
  let productID = request.body.id;
  ManagerMessenger.find({
    messengerID
  }, (err, manager) => {
    if (manager[0] === undefined) {
      response.json({
        "messages": [{
          "text": "You are not allowed to do"
        }]
      })
    } else {
      product.find({
        productID
      }, (err, products) => {
        if (products[0] === undefined) {
          response.json({
            "messages": [{
              "text": "Product ID is not found"
            }]
          })
        } else {
          product.deleteOne({
            productID
          }, (err, result) => {
            if (result) {
              cart.deleteOne({
                productID
              }, (err, result) => {
                if (result) {
                  response.json({
                    "messages": [{
                      "text": "Delete Successful"
                    }],
                    "redirect_to_blocks": ["ManagerMenu"]
                  })
                }
              })
            }
          })

        }
      })
    }
  })
})


//Manager update one product
router.post('/product-update/one', (request, response) => {
  let messengerID = request.body["messenger user id"]
  let productID = request.body.id;
  let type = (request.body.type).toLowerCase();
  let value = request.body.value;
  console.log(value)


  ManagerMessenger.find({
    messengerID
  }, (err, manager) => {
    if (manager[0] === undefined) {
      response.json({
        "messages": [{
          "text": "You can't do this operation"
        }]
      })
    } else {

      switch (type) {
        case "name":
          product.updateOne({
            productID
          }, {
            $set: {
              "productName": value
            }
          }, (err, result) => {
            if (result.nModified === 0) {
              response.json({
                "messages": [{
                  "text": `Product is not found`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            } else {
              response.json({
                "messages": [{
                  "text": `${type} is updated`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            }
          })
          break;
        case "price":
          product.updateOne({
            productID
          }, {
            $set: {
              "price": value
            }
          }, (err, result) => {
            if (result.nModified === 0) {
              response.json({
                "messages": [{
                  "text": `Product is not found`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            } else {
              response.json({
                "messages": [{
                  "text": `${type} is updated`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            }
          })
          break;
        case "description":
          product.updateOne({
            productID
          }, {
            $set: {
              "description": value
            }
          }, (err, result) => {
            if (result.nModified === 0) {
              response.json({
                "messages": [{
                  "text": `Product is not found`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            } else {
              response.json({
                "messages": [{
                  "text": `${type} is updated`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            }
          })
          break;
        case "image":
          product.updateOne({
            productID
          }, {
            $set: {
              "image": value
            }
          }, (err, result) => {
            if (result.nModified === 0) {
              response.json({
                "messages": [{
                  "text": `Product is not found`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            } else {
              response.json({
                "messages": [{
                  "text": `${type} is updated`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            }
          })
          break;
        case "stock":
          product.updateOne({
            productID
          }, {
            $set: {
              "stock": value
            }
          }, (err, result) => {
            if (result.nModified === 0) {
              response.json({
                "messages": [{
                  "text": `Product is not found`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            } else {
              response.json({
                "messages": [{
                  "text": `${type} is updated`
                }],
                "redirect_to_blocks": ["ManagerMenu"]
              })
            }
          })
          break;

        default:
          response.json({
            "messages": [{
              "text": "The updated Type not found"
            }],
            "redirect_to_blocks": ["ManagerMenu"]
          })
      }
    }
  })


})


// Manager update all columns
router.post('/product-update/all', (request, response) => {
  let productID = request.body.pid;
  let productName = request.body.pname;
  let price = request.body.pprice;
  let description = request.body.pdescription;
  let image = request.body.pimage;
  let stock = request.body.stock;
  let messengerID = request.body["messenger user id"];

  ManagerMessenger.find({
    messengerID
  }, (err, manager) => {
    if (manager[0] === undefined) {
      response.json({
        "messages": [{
          "text": "You are not allowed to do"
        }]
      })
    } else {
      product.updateMany({
        productID
      }, {
        $set: {
          productName,
          price,
          description,
          image,
          stock
        }
      }, (err, products) => {
        if (products["nModified"] === 0) {
          response.json({
            "messages": [{
              "text": "Product is Inavaiable"
            }]
          })

        } else {
          response.json({
            "messages": [{
              "text": "Update is successful"
            }],
            "redirect_to_blocks": ["ManagerMenu"]
          })
        }
      })
    }
  })


})



module.exports = router;