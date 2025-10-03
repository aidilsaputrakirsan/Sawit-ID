┌─────────────────────────────────────────────────┐
│          SAWIT-ID SYSTEM ARCHITECTURE           │
└─────────────────────────────────────────────────┘

Layer 1: PHYSICAL LAYER
┌──────────────────────────────────────┐
│  🌴 Pohon Sawit (Individual Trees)   │
│     └─ RFID Tag (ID Unik)            │
├──────────────────────────────────────┤
│  📡 IoT Sensor Stations (per cluster)│
│     ├─ Soil sensors                  │
│     └─ Weather station               │
└──────────────────────────────────────┘
           ↓
           
Layer 2: DATA COLLECTION LAYER
┌──────────────────────────────────────┐
│  📱 Mobile App + RFID Reader         │
│     ├─ Scan RFID tag                │
│     ├─ Receive IoT data              │
│     ├─ Manual input (harvest, etc)   │
│     └─ Photo capture                 │
└──────────────────────────────────────┘
           ↓
           
Layer 3: COMMUNICATION LAYER
┌──────────────────────────────────────┐
│  🌐 4G/LoRaWAN/WiFi                  │
│     ├─ Real-time transmission        │
│     └─ Offline mode with sync        │
└──────────────────────────────────────┘
           ↓
           
Layer 4: DATA PROCESSING LAYER
┌──────────────────────────────────────┐
│  ☁️ Cloud Platform                   │
│  ├─ Data Integration Engine          │
│  │    └─ Combine: RFID + IoT + Manual│
│  ├─ Machine Learning Engine          │
│  │    ├─ Clustering                  │
│  │    ├─ Classification               │
│  │    └─ Prediction                  │
│  └─ Analytics Engine                 │
│       ├─ Productivity analysis        │
│       ├─ Health monitoring            │
│       └─ Resource optimization        │
└──────────────────────────────────────┘
           ↓
           
Layer 5: PRESENTATION LAYER
┌──────────────────────────────────────┐
│  🖥️ Web Dashboard                    │
│     ├─ GIS Map visualization         │
│     ├─ Analytics & Reports           │
│     ├─ Alerts & Notifications        │
│     └─ Compliance reporting          │
├──────────────────────────────────────┤
│  📲 Mobile App                       │
│     ├─ Task management               │
│     ├─ Quick data entry              │
│     └─ Simple dashboard              │
└──────────────────────────────────────┘
           ↓
           
Layer 6: STAKEHOLDER LAYER
┌──────────────────────────────────────┐
│  👥 Users                            │
│  ├─ Estate Manager                   │
│  ├─ Field Supervisor                 │
│  ├─ Petani/Harvester                 │
│  ├─ Agronomist                       │
│  └─ Auditor (ISPO/RSPO)              │
└──────────────────────────────────────┘