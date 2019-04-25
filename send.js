// curl -X POST -H "Content-Type: application/json" -d '{
    // "recipient":{
    //   "id":"2434273869940106"
    // },
    // "message":{
    //   "text":"hello, world!"
    // }
//   }' "https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD"

const axios = require('axios')

axios.post('https://graph.facebook.com/v2.6/me/messages?access_token=EAAEMagZCPmRcBAI38k3zNNgkRv4fRF5ziGH8ZCsRmEQNHQofNXQFtRqzBishEhXnVtD8WLM92WYQZAoqfkxoeURUcd86QcgcCTlgl17FWNxyHq3MNgBfLyiZBXHuPLMDZA3LxPfFPfDUTgeoSZBZCwyrUTwyx3PjXmHA0MIXBm8EwZDZD', {

  "recipient": {
    "id": "2647302035341463"
  },
  "message": {
    "text": "A new order has been placed. "
  }

})
.then((res) => {
  console.log(`statusCode: ${res.statusCode}`)
  console.log(res.data.recipient_id)
})
.catch((error) => {
  console.error(error.response)
})