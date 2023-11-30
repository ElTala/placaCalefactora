let radioSoldar = document.getElementById("radioSoldar")
let radioAbierto = document.getElementById("radioAbierto")
let radioCerrar = document.getElementById("radioCerrar")

let kp = document.getElementById("KP");
let ki = document.getElementById("KI");
let kd = document.getElementById("KD");
let set = document.getElementById("set");

let botonDatos = document.getElementById("envioDatos");

let tempR = document.getElementById('temp')
let bodymsg;

let estado;
let kiValor=0;
let kdValor=0;
let kpValor=0;
let setValor=0;

radioAbierto.addEventListener("click",(e)=>{
    if(radioAbierto.checked){
        radioCerrar.checked =false;
        radioSoldar.checked =false;
        kp.disabled  = true;
        ki.disabled = true;
        kd.disabled = true;
        set.disabled = true;
        estado=2;
    }
})

radioCerrar.addEventListener("click",(e)=>{
    if(radioCerrar.checked){
        radioSoldar.checked =false;
        radioAbierto.checked =false;
        kp.disabled  = false;
        ki.disabled = false;
        kd.disabled = false;
        set.disabled = false;
        estado=0;
    }
})

radioSoldar.addEventListener("click",(e)=>{
    if(radioSoldar.checked){
        radioCerrar.checked =false;
        radioAbierto.checked =false;
        kp.disabled  = true;
        ki.disabled = true;
        kd.disabled = true;
        set.disabled = true;
        estado=1;
    }
})

botonDatos.addEventListener("click",()=>{
    if(estado ==0){
        kpValor= kp.value;
        kiValor=ki.value;
        kdValor=kd.value;
        setValor=set.value;
    }else if(estado ==1){
        kpValor=0;
        kiValor=0;
        kdValor=0;
        setValor=0;
    }else if(estado ==2){
        kpValor=0;
        kiValor=0;
        kdValor=0;
        setValor=0;
    }
    let datos = {
        "estado": estado,
        "kp": parseInt(kpValor),
        "kd": parseInt(kdValor),
        "ki": parseInt(kiValor),
        "setValor": parseInt(setValor)
    };
    let xml = new XMLHttpRequest();
    xml.open("POST","/")
    xml.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xml.send(JSON.stringify(datos));
    
})
window.addEventListener('load',()=>{
    kp.value=100;
    ki.value=200;
    kd.value=10;
    set.value=100;
})

var ctx = document.getElementById('graph');

var misDatos = {
    labels: ['Punto 1', 'Punto 2', 'Punto 3', 'Punto 4', 'Punto 5', 'Punto 6', 'Punto 7', 'Punto 8', 'Punto 9', 'Punto 10'],
    datasets: [{
        label: 'Temperatura',
        data: [1, 10, 20, 30],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.01,
        fill: true,
    }]
};

const config = {
    type: 'line',
    data: misDatos,
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Segundos', // Tu etiqueta del eje x
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Temperatura', // Tu etiqueta del eje y
                }
            }
        }
    }
};


var myChart = new Chart(ctx,config);
setInterval(() => {
    fetch('/datos')
      .then(response => response.json())
      .then(data => {

        const ultimos10DatosTemp = data.temp.slice(-2500);
        tempR.value =ultimos10DatosTemp[9]
        misDatos.datasets[0].data = ultimos10DatosTemp;
        
        const ultimos10DatosTiempo = data.tiempo.slice(-2500);
        misDatos.labels = ultimos10DatosTiempo;

        myChart.update();
      })
      .catch(error => {
        console.error('Error al obtener datos:', error);
      });
      
  }, 10);

