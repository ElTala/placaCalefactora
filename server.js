const express = require("express");
const app = express();
const port = 3000
const path = require('path')
const { SerialPort } = require('serialport')
let Temperatura = [];
let tiempo = [];

const portArduino = new SerialPort({
    path: 'COM7',
    baudRate: 600,

  })
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.send
})
app.get('/datos', (req, res) => {
    const datos = {
      'temp':Temperatura,
      'tiempo': tiempo 
    };
    res.json(datos);
  });
  
app.post('/', (req, res) => {
    let msgBody = `${req.body.estado}&${req.body.kp}&${req.body.ki}&${req.body.kd}&${req.body.setValor}`
    
    portArduino.write(msgBody, function(err) {
        if (err) {
          return console.log('Error on write: ', err.message)
        }
      })
});

let accumulatedData="";
portArduino.on('data', function (data) {
    accumulatedData += data.toString('utf-8');
  if (accumulatedData.endsWith('\n')) {
      Temperatura.push(parseInt(accumulatedData.split(',')[0]))
      tiempo.push( parseFloat(accumulatedData.split(',')[1])/1000 )
    accumulatedData = '';
    }
  });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})