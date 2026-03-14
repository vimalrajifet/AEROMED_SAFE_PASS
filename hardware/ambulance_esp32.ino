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
const char* ssid = "YOUR_WIFI_SSID";     
const char* password = "YOUR_WIFI_PASSWORD"; 

// Project Details
const char* projectId = "aeromed-19d7e";
const char* ambulanceId = "A-101";
const char* droneId = "D-001";

// Hardware
const int DRONE_PIN = 27;

// URLs
String ambulanceUrl = "https://firestore.googleapis.com/v1/projects/" + String(projectId) + "/databases/(default)/documents/fleet/" + String(ambulanceId) + "?updateMask.fieldPaths=status&updateMask.fieldPaths=lat&updateMask.fieldPaths=lng&updateMask.fieldPaths=driverName";
String droneUrl = "https://firestore.googleapis.com/v1/projects/" + String(projectId) + "/databases/(default)/documents/fleet/" + String(droneId);

double currentLat = 12.9716;
double currentLng = 77.5946;
String currentDroneStatus = "IDLE";

void setup() {
  Serial.begin(115200);
  pinMode(DRONE_PIN, OUTPUT);
  digitalWrite(DRONE_PIN, LOW);
  
  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("SSD1306 allocation failed"));
  }
  
  showSplash();
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  updateOLED("WiFi", "Connecting...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  updateOLED("WiFi", "Connected!");
  delay(1000);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    updateAmbulance("available");
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
  display.setTextSize(1);
  display.setCursor(25, 45);
  display.println("FLEET SYSTEM");
  display.display();
  delay(2000);
}

void updateOLED(String head, String msg) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.print("Unit: "); display.println(ambulanceId);
  display.drawLine(0, 12, 128, 12, WHITE);
  
  display.setCursor(0, 25);
  display.print(head); display.print(": ");
  display.println(msg);
  display.display();
}

void refreshDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  
  // Header
  display.setCursor(0,0);
  display.print("AMBULANCE: "); display.println(ambulanceId);
  display.drawLine(0, 10, 128, 10, WHITE);
  
  // Content
  display.setCursor(0, 20);
  display.print("STATUS: "); display.println("ACTIVE");
  
  display.setCursor(0, 35);
  display.print("DRONE:  "); 
  if(currentDroneStatus == "launched") {
    display.setTextColor(BLACK, WHITE); // Invert text
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

void updateAmbulance(String status) {
  HTTPClient http;
  http.begin(ambulanceUrl);
  http.addHeader("Content-Type", "application/json");
  
  currentLat += (random(-10, 10) / 10000.0);
  
  String jsonPayload = "{ \"fields\": {";
  jsonPayload += "\"status\": { \"stringValue\": \"" + status + "\" },";
  jsonPayload += "\"driverName\": { \"stringValue\": \"ESP32 Unit\" },";
  jsonPayload += "\"lat\": { \"doubleValue\": " + String(currentLat, 6) + " },";
  jsonPayload += "\"lng\": { \"doubleValue\": " + String(currentLng, 6) + " }";
  jsonPayload += " } }";

  http.PATCH(jsonPayload);
  http.end();
}

void checkDrone() {
  HTTPClient http;
  http.begin(droneUrl);
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
  }
  http.end();
}
