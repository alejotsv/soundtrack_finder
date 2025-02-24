# 🎵 Soundtrack Finder 🎬
An AI-powered web app that **identifies songs from audio and finds the movies and TV shows where they were featured**.

## 🚀 Features
✅ **Live Audio Recognition** – Uses ACRCloud API to identify songs from recorded audio.  
✅ **AI-Powered Search** – Utilizes OpenAI to find where the song was used in movies & TV shows.  
✅ **Google-Enhanced Accuracy** – Integrates Google Search API to improve results.  
✅ **Structured Results** – Displays **movies (title & year)** and **TV shows (title, season, episode, year)**.

---

## 🛠️ Setup & Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/soundtrack-finder.git
cd soundtrack-finder
```

### **2️⃣ Create & Activate a Virtual Environment**
```sh
python -m venv venv
source venv/bin/activate  # MacOS/Linux
venv\Scripts\activate      # Windows
```

### **3️⃣ Install Dependencies**
```sh
pip install -r requirements.txt
```

### **4️⃣ Set Up Environment Variables**
Create a `.env` file in the project root and add your API keys:
```ini
ACR_CLOUD_ACCESS_KEY=your_acrcloud_key
ACR_CLOUD_ACCESS_SECRET=your_acrcloud_secret
ACR_CLOUD_HOST=identify-us-west-2.acrcloud.com
TMDB_API_KEY=your_tmdb_api_key
GOOGLE_CSE_API_KEY=your_google_cse_key
GOOGLE_CSE_ID=your_google_cse_id
OPENAI_API_KEY=your_openai_key
```

---

## 🎤 Usage

### **5️⃣ Run the App**
```sh
python main.py
```
- **Record a song snippet** (10 sec)
- **AI & Google search will process the song**
- **Results will be displayed in the terminal**


---

### **🌟 Show Some Love!**
If you like this project, give it a ⭐ on [GitHub](https://github.com/yourusername/soundtrack-finder)!