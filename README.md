# ImgConvert

**ImgConvert** is a simple and powerful image format converter built with Node.js and vanilla JavaScript. It allows users to drag & drop images (JPG, PNG, WEBP), choose a desired output format, and download converted images either individually or all at once in a ZIP file.

---

## 🌟 Features

- Drag & drop interface for uploading images.
- Converts JPG, PNG, and WEBP formats to:
  - JPG, PNG, WEBP, BMP, TIFF, GIF.
- Convert single image or batch convert multiple images.
- Select global output format or per-image format.
- Download:
  - Individually (each image after conversion).
  - All at once (ZIP archive).
- Auto-removal of uploaded files from the server after 30 minutes.
- Clean UI with real-time progress bar.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/bahihegazi/ImgConvert.git
cd ImgConvert
```

### 2. Install Dependencies

Navigate to the backend folder and run:

```bash
cd backend
npm install
```

### 3. Run the Server

```bash
node index.js
```

Server will be running on:

```
http://localhost:3000
```

---

## 🧪 Usage Instructions

1. Open the app in your browser at `http://localhost:3000`
2. Drag and drop one or more images into the upload area.
3. Select the desired output format (globally or per image).
4. Click **Convert Now** or **Convert All Now**.
5. Wait for the progress bar to reach 100%.
6. Download:
   - For one image: A direct download button will appear.
   - For multiple images: Download All button will appear.
7. Each image will also show an individual download icon.
8. Converted images are automatically deleted from the server after 30 minutes.

---

## 📁 Project Structure

```
ImgConvert/
├── backend/
│   ├── uploads/           # Uploaded images (temporary)
│   ├── converted/         # (optional) for saving outputs (if implemented)
│   ├── index.js           # Express server logic
│   ├── package.json
├── frontend/
│   ├── css/               # Styles
│   ├── js/                # Scripts
│   ├── img/               # Static images/icons
│   └── index.html         # Main HTML file
└── .gitignore
```

---

## 🛡️ Notes

- File size and number of uploads are limited by your system and server config.
- Make sure port `3000` is available when starting the server.
- Uses `multer`, `sharp`, and `archiver` for image processing.

---

## 📜 License

This project is licensed under the MIT License. Feel free to use and modify it.

---