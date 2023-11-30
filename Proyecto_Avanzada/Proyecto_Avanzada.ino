String cadena;
String configuracion[5];
int estado =4;
volatile float valor=0;
float setpoint=100, temp=0; 
float delta =10;
float maxv =7500.0;
float tiempo=0,tiempoAnterior=0;

float Kp = 100.0; // Coeficiente proporcional
float Ki = 200.0; // Coeficiente integral
float Kd = 10.00; // Coeficiente derivativo

float errorIntegral = 0 , errorDiferencial=0;
float errorActual =0, errorAnterior=0;

unsigned long muestras =1;

void interrupcion() {
  delayMicroseconds(valor);
  digitalWrite(3, HIGH);
  delayMicroseconds(200);
  digitalWrite(3, LOW);
}

void setup() {
  valor =maxv;
  Serial.begin(600);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, OUTPUT);
  pinMode(A0,INPUT);
  pinMode(A1,INPUT);
  
  attachInterrupt(digitalPinToInterrupt(2), interrupcion, FALLING);
}

void loop() {
    if (Serial.available() > 0 ) {  

    cadena = Serial.readStringUntil('\n');
    split(cadena,'&',configuracion,5);
    estado = configuracion[0].toInt();
    Kp = configuracion[1].toInt();
    Ki = configuracion[2].toInt();
    Kd = configuracion[3].toInt();
    setpoint = configuracion[4].toInt();
    Serial.flush();
  }
  
  temp = leerTemp();
    switch (estado) {
      case 0:
       pid();
      break;
      case 1:
        soldar();
      break;
      case 2:
        lazoAbierto();
      break;
    }
  Serial.print(temp);
  Serial.print(",");
  Serial.println(millis());
  
  
}

void pid(){
  temp = leerTemp();
  tiempo = millis();
  if( (tiempo - tiempoAnterior) >delta){
    errorActual = setpoint-temp;
    errorIntegral = ((errorActual + errorAnterior)*delta)/2;
    errorDiferencial = (errorActual - errorAnterior)/delta;
    
    valor = Kp * errorActual + Ki * errorIntegral + Kd * errorDiferencial;
    
    if(valor>maxv) valor = maxv;
    else if(valor<0) valor =0;
    
    tiempoAnterior = tiempo;
    errorAnterior = errorActual;
    valor = maxv - valor;
  }
  //Serial.println(temp);
}

void lazoAbierto(){
  int valPot = analogRead(A1);
  //Serial.println(valPot);
  valor = map(valPot,0,1023,0,maxv); 
}

void soldar(){
  Kp = 100.0; // Coeficiente proporcional
  Ki = 200.0; // Coeficiente integral
  Kd = 10.00; // Coeficiente derivativo
  setpoint=30;
  float tiempoSoldar = millis();
  do {
    pid();
    if((millis()-tiempoSoldar) <3000 ) setpoint = 60;
    if( ((millis()-tiempoSoldar) >3000) && ((millis()-tiempoSoldar) <=9000) ) setpoint =95;
    if( ((millis()-tiempoSoldar) >9000) && ((millis()-tiempoSoldar) <=12000) ) setpoint =125;
    if( ((millis()-tiempoSoldar) >12000) && ((millis()-tiempoSoldar) <=15000) ) setpoint =130;
    if( ((millis()-tiempoSoldar) >15000) && ((millis()-tiempoSoldar) <=21000) ) setpoint =150;
    delay(10);
    if( temp >140){
      setpoint =0;  
      estado=4; 
      valor = maxv;
      break;
    }
  Serial.print(temp);
  Serial.print(",");
  Serial.println(millis());
  }while (true); 
}

float leerTemp(){
  float R1 = 10000, Vo;
  float logR2, R2, T;
  float c1 = 1.009249522e-03, c2 = 2.378405444e-04, c3 = 2.019202697e-07;
  Vo = analogRead(A0);
  R2 = R1 * (1023.0 / (float)Vo - 1.0);
  logR2 = log(R2);
  T = (1.0 / (c1 + c2*logR2 + c3*logR2*logR2*logR2));
  T = T - 221.15;
  return T;
}


void split(const String &input, char delimiter, String parts[], int maxParts) {
  int partIndex = 0;
  int startIndex = 0;
  
  for (int i = 0; i < input.length(); i++) {
    if (input.charAt(i) == delimiter) {
      parts[partIndex++] = input.substring(startIndex, i);
      startIndex = i + 1;

      // Break if we reached the maximum number of parts
      if (partIndex == maxParts) {
        break;
      }
    }
  }

  // Add the last part
  parts[partIndex] = input.substring(startIndex);
}
