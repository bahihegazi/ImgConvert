// Initialize AOS library
AOS.init();

// Toggle FAQ
document.querySelectorAll('.faq-question').forEach(item => {
  item.addEventListener('click', () => {
    item.parentElement.classList.toggle('active');
  });
});

// Navbar toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', e => {
  e.stopPropagation();
  navLinks.classList.toggle('show');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('show'));
});

document.addEventListener('click', e => {
  if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    navLinks.classList.remove('show');
  }
});

// Scroll to top
const scrollBtn = document.getElementById('scrollToTop');
const howItWorks = document.getElementById('how-it-works');

window.addEventListener('scroll', () => {
  scrollBtn.style.display = howItWorks.getBoundingClientRect().top <= window.innerHeight * 0.5 ? 'flex' : 'none';
});

scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Active nav on scroll
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll("#nav-links a");

window.addEventListener("scroll", () => {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navItems.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
});

// Image Upload
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const previewArea = document.getElementById('preview-list');
const convertBtn = document.getElementById('chooseFileBtn');

fileInput.type = 'file';
fileInput.accept = 'image/png, image/jpeg, image/webp';
fileInput.multiple = true;

dropArea.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
  });
});

dropArea.addEventListener('drop', e => handleFiles([...e.dataTransfer.files]));
fileInput.addEventListener('change', () => handleFiles([...fileInput.files]));

const controlPanel = document.createElement('div');
controlPanel.className = 'convert-controls';

const globalOutputSelect = document.createElement('select');
globalOutputSelect.className = 'global-output-format';
globalOutputSelect.innerHTML = `
  <option value="jpg">JPG</option>
  <option value="png">PNG</option>
  <option value="webp">WEBP</option>
  <option value="bmp">BMP</option>
  <option value="tiff">TIFF</option>
  <option value="gif">GIF</option>
`;
globalOutputSelect.addEventListener('change', () => {
  document.querySelectorAll('.output-format').forEach(sel => {
    sel.value = globalOutputSelect.value;
  });
});

controlPanel.appendChild(globalOutputSelect);
previewArea.insertAdjacentElement('afterend', controlPanel);

function handleFiles(files) {
  const validFiles = files.filter(file =>
    ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  );

  if (validFiles.length === 0) {
    showToast("Only JPG, PNG, and WEBP files are allowed.", "error");
    return;
  }

  previewArea.innerHTML = '';
  const formData = new FormData();

  validFiles.forEach(file => {
    const cleanedName = file.name.replace(/\s+/g, '_');
    const fileObj = new File([file], cleanedName, { type: file.type });
    formData.append('images', fileObj);

    const reader = new FileReader();
    reader.onload = e => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.setAttribute('data-name', cleanedName);

      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = cleanedName;

      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `
        <div class="name">${cleanedName}</div>
        <div class="size">${(file.size / 1024).toFixed(2)} KB</div>
        <div class="output-label">Output:</div>
      `;

      const outputSelect = document.createElement('select');
      outputSelect.className = 'output-format';
      outputSelect.innerHTML = globalOutputSelect.innerHTML;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'remove-btn';
      removeBtn.addEventListener('click', () => {
        const serverFileName = item.getAttribute('data-server-name');
        if (serverFileName) {
          fetch(`/delete/${serverFileName}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                item.remove();
                showToast("Image deleted successfully.");
              } else {
                showToast("Failed to delete the image from server.", "error");
              }
            })
            .catch(() => showToast("Server error while deleting image.", "error"));
        } else {
          item.remove();
          showToast("Image removed locally.");
        }
      });

      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(outputSelect);
      item.appendChild(removeBtn);
      previewArea.appendChild(item);
    };
    reader.readAsDataURL(fileObj);
  });

  convertBtn.textContent = validFiles.length === 1 ? 'Convert Now' : 'Convert All Now';

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (!data.files || data.files.length === 0) {
        showToast("Upload failed. No images were saved.", "error");
        return;
      }

      data.files.forEach(file => {
        const originalName = file.name.replace(/^.*?_/, '');
        const item = document.querySelector(`.preview-item[data-name="${originalName}"]`);
        if (item) {
          item.setAttribute('data-server-name', file.name);
        }
      });

      showToast("Images uploaded successfully!");
    })
    .catch(() => showToast("Failed to upload images. Please try again.", "error"));
}

convertBtn.addEventListener('click', () => {
  document.querySelectorAll('.download-link, .download-all, .individual-download, .convert-btn').forEach(el => el.remove());
  const items = document.querySelectorAll('.preview-item');
  if (!items.length) {
    showToast("Please upload images first.", "error");
    return;
  }

  const progress = document.createElement('div');
  progress.className = 'progress-bar';
  progress.innerHTML = '<div class="bar"></div>';
  previewArea.parentElement.appendChild(progress);

  let percentage = 0;
  const updateProgress = setInterval(() => {
    percentage += 5;
    progress.querySelector('.bar').style.width = `${percentage}%`;
    if (percentage >= 100) clearInterval(updateProgress);
  }, 80);

  const requestData = Array.from(items).map(item => {
    return {
      name: item.getAttribute('data-server-name'),
      format: globalOutputSelect.value
    };
  });

  fetch('/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: requestData })
  })
    .then(res => res.blob())
    .then(blob => {
      progress.remove();

      if (items.length === 1) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = requestData[0].name.replace(/\.[^.]+$/, '') + '.' + requestData[0].format;
        a.textContent = 'Download';
        a.className = 'btn download-link';
        items[0].appendChild(a);
      } else {
        const allBtn = document.createElement('a');
        allBtn.href = URL.createObjectURL(blob);
        allBtn.download = 'converted_images.zip';
        allBtn.className = 'btn convert-btn';
        allBtn.textContent = 'Download All';
        controlPanel.appendChild(allBtn);

        items.forEach(item => {
          const original = item.getAttribute('data-name').replace(/\.[^.]+$/, '');
          const ext = globalOutputSelect.value;
          const convertedName = `${original}.${ext}`;
          const downloadBtn = document.createElement('a');
          downloadBtn.href = `/download/${convertedName}`;
          downloadBtn.download = convertedName;
          downloadBtn.className = 'btn individual-download';
          downloadBtn.innerHTML = 'Download';
          item.appendChild(downloadBtn);
        });
      }

      showToast("Images converted successfully!");
    })
    .catch(() => {
      progress.remove();
      showToast("Conversion failed.", "error");
    });
});

function showToast(message, type = "success") {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: type === "success" ? "#28a745" : "#dc3545",
    close: true
  }).showToast();
}
