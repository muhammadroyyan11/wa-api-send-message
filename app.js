const express = require('express')
const app = express()
let bodyParser =  require("body-parser")
const port = 3000
const router = require("./routers/wa")

app.use(bodyParser.json());
app.use("/", router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})