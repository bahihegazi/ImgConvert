const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const archiver = require('archiver');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // frontend folder

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const name = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${name}`);
  }
});
const upload = multer({ storage });

// رفع الصور
app.post('/upload', upload.array('images'), (req, res) => {
  const files = req.files.map(f => ({ name: path.basename(f.filename) }));
  res.json({ files });
});

// حذف صورة
app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  fs.unlink(filePath, err => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

// تحويل الصور
app.post('/convert', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const convertedFiles = [];

  if (files.length === 1) {
    try {
      const file = files[0];
      const inputPath = path.join(uploadDir, file.name);
      const outputName = file.name.split('_').slice(1).join('_').replace(/\.[^/.]+$/, '');
      const format = file.format.toLowerCase();
      const outputFile = `${outputName}.${format}`;
      const outputPath = path.join(uploadDir, outputFile);

      await sharp(inputPath).toFormat(format).toFile(outputPath);
      return res.download(outputPath, outputFile);
    } catch (err) {
      console.error("Error in single image conversion:", err);
      return res.status(500).json({ error: "Failed to convert image." });
    }
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('converted_images.zip');
  archive.pipe(res);

  try {
    await Promise.all(files.map(async file => {
      const inputPath = path.join(uploadDir, file.name);
      const outputName = file.name.split('_').slice(1).join('_').replace(/\.[^/.]+$/, '');
      const format = file.format.toLowerCase();
      const outputFile = `${outputName}.${format}`;
      const outputPath = path.join(uploadDir, outputFile);

      await sharp(inputPath).toFormat(format).toFile(outputPath);
      archive.file(outputPath, { name: outputFile });
      convertedFiles.push(outputFile);
    }));

    await archive.finalize();
  } catch (err) {
    console.error("Error during multiple image conversion:", err);
    res.status(500).end();
  }
});


// تحميل صورة محوّلة بشكل فردي
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// حذف الصور الأقدم من 30 دقيقة تلقائيًا كل دقيقة
setInterval(() => {
  const now = Date.now();
  const cutoff = now - 30 * 60 * 1000; // 30 دقيقة
  fs.readdir(uploadDir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (stats.mtimeMs < cutoff) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}, 60 * 1000); // كل دقيقة

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
