#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- OLED CONFIG ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- WIFI CONFIG ---
const char* ssid = "Naveen's M33";     
const char* password = "04092005"; 

// Project Details
const char* projectId = "aeromed-19d7e";
const char* ambulanceId = "A-101";
const char* droneId = "D-001";

// Hardware
const int DRONE_PIN = 27;

// Simulated GPS Location
double currentLat = 11.918649;
double currentLng = 79.630896;
String currentDroneStatus = "IDLE";
String myStatus = "available"; 

void setup() {
  Serial.begin(115200);
  pinMode(DRONE_PIN, OUTPUT);
  digitalWrite(DRONE_PIN, LOW);
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("SSD1306 allocation failed"));
  }
  
  showSplash();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }  Serial.println("Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    checkMyStatus();    
    updateAmbulance();  
    checkDrone();       
  }
  refreshDisplay();
  delay(3000); 
}

void showSplash() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(20, 20);
  display.println("AEROMED");
  display.display();
}

void refreshDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.print("UNIT: "); display.println(ambulanceId);
  display.drawLine(0, 10, 128, 10, WHITE);
  
  display.setCursor(0, 20);
  display.print("STATUS: "); 
  if (myStatus == "busy") {
     display.setTextColor(BLACK, WHITE);
     display.println(" DISPATCHED ");
     display.setTextColor(WHITE);
  } else {
     display.println("AVAILABLE");
  }
  
  display.setCursor(0, 35);
  display.print("DRONE:  "); 
  if (currentDroneStatus == "launched") {
     display.setTextColor(BLACK, WHITE);
     display.println(" LAUNCHED ");
     display.setTextColor(WHITE);
  } else {
     display.println("IDLE");
  }
  
  display.setCursor(0, 50);
  display.print("GPS: "); 
  display.print(currentLat, 4); display.print(","); display.print(currentLng, 4);
  display.display();
}

void updateAmbulance() {
  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/" + String(projectId) + "/databases/(default)/documents/fleet/" + String(ambulanceId);
  url += "?updateMask.fieldPaths=lat&updateMask.fieldPaths=lng&updateMask.fieldPaths=driverName&updateMask.fieldPaths=type";
  if (myStatus == "available") url += "&updateMask.fieldPaths=status";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  currentLat += (random(-10, 10) / 100000.0);
  
  String jsonPayload = "{ \"fields\": {";
  jsonPayload += "\"driverName\": { \"stringValue\": \"ESP32 Unit\" },";
  jsonPayload += "\"type\": { \"stringValue\": \"ambulance\" },";
  jsonPayload += "\"lat\": { \"doubleValue\": " + String(currentLat, 6) + " },";
  jsonPayload += "\"lng\": { \"doubleValue\": " + String(currentLng, 6) + " }";
  if (myStatus == "available") jsonPayload += ",\"status\": { \"stringValue\": \"available\" }";
  jsonPayload += "} }";

  http.PATCH(jsonPayload);
  http.end();
}

void checkMyStatus() {
  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/" + String(projectId) + "/databases/(default)/documents/fleet/" + String(ambulanceId);
  http.begin(url);
  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    if (payload.indexOf("\"busy\"") > 0) myStatus = "busy";
    else myStatus = "available";
  }
  http.end();
}

void checkDrone() {
  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/" + String(projectId) + "/databases/(default)/documents/fleet/D-001";
  http.begin(url);
  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    if (payload.indexOf("launched") > 0) {
      currentDroneStatus = "launched";
      digitalWrite(DRONE_PIN, HIGH);
    } else {
      currentDroneStatus = "idle";
      digitalWrite(DRONE_PIN, LOW);
    }
  } else {
    Serial.print("Drone Error: ");
    Serial.println(httpCode);
  }
  http.end();
}
