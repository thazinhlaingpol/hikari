const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const product = require('../models/Product');
const cart = require('../models/Cart')
const category = require('../models/Category')
const order = require('../models/Order')
const uuidv1 = require('uuid/v1');
const axios = require('axios')



router.post('/registerCheck', (request, response) => {
  let messengerID = request.body["messenger user id"]
  Customer.find({
    messengerID
  }, (err, customers) => {
    if (customers[0] === undefined) {
      response.json({
        "redirect_to_blocks": ["Customer Register"]
      })
    } else {
      response.json({
        "redirect_to_blocks": ["Customer Menu"]
      })
    }
  })
})





router.post('/register', (request, response) => {
  let messengerID = request.body["messenger user id"]
  let customerName = request.body.name;
  let phone = request.body.phone;
  let address = request.body.location;

  Customer.find({
    messengerID
  }, (err, customers) => {
    if (customers[0] === undefined) {
      Customer.create({
        messengerID,
        customerName,
        phone,
        address
      }, (err, result) => {
        if (result) {
          response.json({
            "messages": [{
              "text": "Register Successful"
            }],
            "redirect_to_blocks": ["Customer Menu"]
          })
        }
      })
    } else {
      response.json({
        "messages": [{
          "text": "Customer Already Existed"
        }]
      })
    }
  })
})

router.post('/get_Photo', (request, response) => {
  let image = request.body.photoName
  console.log(image)
})


// Customer search Product

router.post('/search_product', (request, response) => {
  let productName = request.body.pname;
  let messengerID = request.body["messenger user id"];
  Customer.find({
    messengerID
  }, (err, customer) => {

    product.find({
      productName: {
        $regex: productName
      }
    }, (err, products) => {
      if (products[0] === undefined) {
        //If product is not found, search again
        response.json({
          "messages": [{
            "text": "Product is not found"
          }],
          "redirect_to_blocks": ["SearchAgain"]
        });
      } else {

        //If product is found, show product information
        response.json({
          "messages": [

            {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": products.map((current, index, array) => {


                    return {

                      "title": "Name : " + current.productName,
                      "image_url": current.image,
                      "subtitle": "Price : KS " + current.price,
                      "buttons": [{
                          "type": "show_block",
                          "block_names": ["Show More"],
                          "set_attributes": {
                            "id": current.productID
                          },
                          "title": "Show More"
                        },
                        {
                          "type": "show_block",
                          "block_names": ["Add to Cart"],
                          "title": "Add to Cart",
                          "set_attributes": {
                            "id": current.productID
                          }
                        }
                      ]
                    }

                  })



                }
              }
            }
          ]
        })

      }
    })

  })

})


router.post('/add_cart', (request, response) => {
  productID = request.body.id
  response.json({
    "set_attributes": {
      "id": productID

    },

    "redirect_to_blocks": ["AskQty"]
  })

})

router.post('/ask_Qty', (request, response) => {
  let messengerID = request.body["messenger user id"]
  let productID = request.body['id']
  let totalQty = request.body.qty

  product.findOne({
    productID
  }, (err, products) => {


    cart.create({
      messengerID,
      productID,
      totalQty
    }, (err, result) => {
      if (result) {
        console.log(totalQty)
        response.json({
          "messages": [{
            "text": "Added To Cart"
          }],
          "redirect_to_blocks": ["SearchAgain"]
        })
      }

    })



  })


})

//Customer view category

router.post('/view_Category', (request, response) => {
  category.find({}, (err, result) => {

    response.json({

      "messages": [{
          "text": "What type of products are you looking for?"
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
                    "block_names": ["SearchCategory"],
                    "set_attributes": {
                      "category": current.categoryName
                    },
                    "title": "Search"
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



router.post('/cancel_Order', (request, response) => {
  let messengerID = request.body["messenger user id"]
  let productID = request.body.id
  cart.findOne({
    messengerID,
    productID
  }, (err, carts) => {
    var cartQty = carts.totalQty
    product.findOne({
      productID
    }, (err, products) => {
      var productQty = products.stock

      productQty = productQty + cartQty
      product.updateOne({
        productID
      }, {
        $set: {
          "stock": productQty
        }
      }, (err, result) => {
        if (result) {
          cart.deleteOne({
            messengerID,
            productID
          }, (err, result) => {
            if (result) {
              response.json({
                "messages": [{
                  "text": "Cart Removed"
                }],
                "redirect_to_blocks": ["ViewCart"]
              })

            }
          })
        }
      })
    })

  })

})

//Customer order for product
router.post('/order_Products', (request, response) => {
  let messengerID = request.body["messenger user id"]

  cart.find({
    messengerID
  }, (err, carts) => {

    var date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    var orderID = uuidv1()
    console.log(orderID)


    //Store data in order table
    order.create({
      orderID,
      messengerID,
      date,
      products: carts
    })
    //Remove products from cart
    cart.deleteMany({
      messengerID
    }, (err, result) => {

      // Send message to manager about order
      axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

          "recipient": {
            //Manager ID
            "id": "2434273869940106"
          },
          "message": {
            "text": "A new order " + orderID + " has been placed. "
          }

        })
        .then((res) => {
          console.log(`statusCode: ${res.statusCode}`)
          console.log(res.data.recipient_id)
        })
        .catch((error) => {
          console.error(error.response)
        })

      response.json({
        "messages": [{
          "text": "Your order has been placed. Please wait for confirmation"
        }],
        "redirect_to_blocks": ["Customer Menu"]
      })
    })


  })


})



// Customer View Cart
router.post('/view_cart', (request, response) => {
  let messengerID = request.body["messenger user id"]

  async function getCart(messengerID) {
    var array;
    await cart.find({
      messengerID
    }, (err, carts) => {
      array = carts
    })
    console.log(array)
    return array

  }



  async function getCartPls(messengerID) {
    var array = await getCart(messengerID)
    if (array == undefined || array.length == 0) {
      // If cart is empty, tell user cart is empty
      response.json({
        "redirect_to_blocks": ["EmptyCart"]
      })
    }
   
    //View all products in cart
    
    var productArray = []
    var productID;
    
    array.forEach(function (arr, index, arry) {
      productID = arr.productID
      product.findOne({
        productID
      }, (err, products) => {
        productArray.push({
          "title": "Name : " + products.productName,
          "image_url": products.image,
          "subtitle": "Price : KS " + products.price + "\n" + "Quantity : " + arr.totalQty,
          "buttons": [{
            "type": "show_block",
            "block_names": ["CancelOrder"],
            "title": "Cancel Order",
            "set_attributes": {
              "id": products.productID
            }
          }]
        })
        if (index == array.length - 1) {
          response.json({
            "messages": [{
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": productArray



                }
              }
            }]
          })
        }

      })
    })



  }
  getCartPls(messengerID)



})


router.post('/search_Category', (request, response) => {
  categoryName = request.body.category

  product.find({
    categoryName
  }, (err, products) => {
    if (products == undefined || products.length == 0) {
      response.json({
        "redirect_to_blocks": ["ViewOtherCart"]
      })
    } else {


      response.json({
        "messages": [{

          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": products.map((current, index, array) => {


                return {

                  "title": current.productName,
                  "image_url": current.image,
                  "subtitle": current.price,
                  "buttons": [{
                      "type": "show_block",
                      "block_names": ["Show More"],
                      "set_attributes": {
                        "id": current.productID
                      },
                      "title": "Show More"
                    },
                    {
                      "type": "show_block",
                      "block_names": ["Add to Cart"],
                      "title": "Add to Cart",
                      "set_attributes": {
                        "id": current.productID
                      }
                    }
                  ]
                }

              })



            }
          }
        }]
      })
    }
  })

})

router.post('/create_Pro', (request, response) => {

})

router.post('/readmore', (request, response) => {
  let messengerID = request.body["messenger user id"];
  let productID = request.body.id;
  Customer.find({
    messengerID
  }, (err, customer) => {
    if (customer[0] === undefined) {
      response.json({
        "messages": [{
          "text": "You are not allowed"
        }]
      })
    } else {
      product.find({
        productID
      }, (err, products) => {
        if (products) {
          response.json({
            messages: [{
              "text": `Name:${products[0].productName}\nPrice:${products[0].price}\nDescription: ${products[0].description}\nColor:${products[0].color}`
            }]
          })
        }
      })
    }
  })
})

module.exports = router;