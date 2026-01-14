// HDin Foto WhatsApp - Script Utama
// Optimasi gambar untuk WhatsApp HD

// ============================
// INISIALISASI APLIKASI
// ============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('HDin Foto WhatsApp HD dimulai...');
    initApp();
});

// ============================
// VARIABEL GLOBAL
// ============================

let originalImage = null;
let enhancedImage = null;
let canvas = null;
let ctx = null;
let isProcessing = false;
let currentFileName = '';
let currentFileType = '';

// ============================
// FUNGSI UTAMA
// ============================

function initApp() {
    console.log('Menginisialisasi aplikasi WhatsApp HD...');
    
    // Setup event listeners
    setupFileUpload();
    setupSliders();
    setupButtons();
    setupPresets();
    setupComparisonSlider();
    
    // Tampilkan notifikasi sambutan
    setTimeout(() => {
        showNotification('📱 Upload foto yang biasanya pecah di WhatsApp!', 'info');
    }, 1000);
    
    console.log('Aplikasi WhatsApp HD siap!');
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Klik pada upload area
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#25D366'; // Warna WhatsApp
        this.style.background = 'rgba(37, 211, 102, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = '#4361ee';
        this.style.background = 'rgba(255, 255, 255, 0.08)';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#4361ee';
        this.style.background = 'rgba(255, 255, 255, 0.08)';
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            handleImageFile(file);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleImageFile(this.files[0]);
        }
    });
}

function setupSliders() {
    // Setup semua slider dengan nilai default yang optimal untuk WhatsApp
    const sliders = [
        { id: 'sharpness', valueId: 'sharpnessValue', defaultValue: 65 },
        { id: 'brightness', valueId: 'brightnessValue', defaultValue: 55 },
        { id: 'contrast', valueId: 'contrastValue', defaultValue: 65 },
        { id: 'saturation', valueId: 'saturationValue', defaultValue: 60 }
    ];
    
    sliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const valueElement = document.getElementById(slider.valueId);
        
        // Set nilai default optimal untuk WhatsApp
        sliderElement.value = slider.defaultValue;
        valueElement.textContent = slider.defaultValue;
        
        // Update nilai saat slider diubah
        sliderElement.addEventListener('input', function() {
            valueElement.textContent = this.value;
            
            // Auto-enhance jika gambar sudah dimuat
            if (originalImage && !isProcessing) {
                clearTimeout(window.autoEnhanceTimeout);
                window.autoEnhanceTimeout = setTimeout(() => {
                    enhanceImage();
                }, 300);
            }
        });
    });
}

function setupButtons() {
    // Tombol Enhance
    document.getElementById('enhanceBtn').addEventListener('click', function() {
        if (!originalImage) {
            showNotification('Silakan unggah foto WhatsApp terlebih dahulu', 'error');
            return;
        }
        
        if (isProcessing) {
            showNotification('Sedang mengoptimalkan foto...', 'info');
            return;
        }
        
        enhanceImage();
    });
    
    // Tombol Reset
    document.getElementById('resetBtn').addEventListener('click', function() {
        resetControls();
    });
    
    // Tombol Download
    document.getElementById('downloadBtn').addEventListener('click', function() {
        if (!enhancedImage) {
            showNotification('Tidak ada foto yang dapat diunduh', 'error');
            return;
        }
        
        downloadImage();
    });
}

function setupPresets() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!originalImage) {
                showNotification('Silakan unggah foto terlebih dahulu', 'error');
                return;
            }
            
            const preset = this.getAttribute('data-preset');
            applyPreset(preset);
        });
    });
}

function setupComparisonSlider() {
    const sliderThumb = document.querySelector('.slider-thumb');
    const sliderTrack = document.querySelector('.slider-track');
    const originalImgBox = document.querySelector('.image-box:first-child .image-placeholder');
    const enhancedImgBox = document.querySelector('.image-box:last-child .image-placeholder');
    
    let isDragging = false;
    
    sliderThumb.addEventListener('mousedown', function(e) {
        isDragging = true;
        sliderThumb.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const trackRect = sliderTrack.getBoundingClientRect();
        let x = e.clientX - trackRect.left;
        x = Math.max(0, Math.min(x, trackRect.width));
        
        sliderThumb.style.left = `${x}px`;
        
        const percent = x / trackRect.width;
        
        if (originalImage && enhancedImage) {
            originalImgBox.style.clipPath = `inset(0 ${100 - percent * 100}% 0 0)`;
            enhancedImgBox.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        sliderThumb.style.cursor = 'grab';
    });
}

// ============================
// FUNGSI PROSES GAMBAR WHATSAPP HD
// ============================

function handleImageFile(file) {
    console.log('Memproses file untuk WhatsApp HD:', file.name);
    
    // Validasi file
    if (!file.type.startsWith('image/')) {
        showNotification('File harus berupa gambar (JPG, PNG)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Ukuran file maksimal 5MB', 'error');
        return;
    }
    
    currentFileName = file.name.replace(/\.[^/.]+$/, "");
    currentFileType = file.type.split('/')[1];
    
    // Tampilkan loading
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <h3>Memuat foto WhatsApp...</h3>
        <p>${file.name}</p>
        <p class="format-info">Mengoptimalkan untuk kualitas HD...</p>
    `;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            console.log('Foto WhatsApp dimuat:', originalImage.naturalWidth + 'x' + originalImage.naturalHeight);
            displayOriginalImage();
            showNotification('✅ Foto siap dioptimalkan untuk WhatsApp HD!', 'success');
            
            // Otomatis enhance dengan pengaturan optimal
            setTimeout(() => {
                enhanceImage();
            }, 500);
        };
        originalImage.onerror = function() {
            showNotification('❌ Gagal memuat foto', 'error');
            resetUploadArea();
        };
        originalImage.src = e.target.result;
    };
    
    reader.onerror = function() {
        showNotification('❌ Gagal membaca file', 'error');
        resetUploadArea();
    };
    
    reader.readAsDataURL(file);
}

function displayOriginalImage() {
    const originalImageContainer = document.getElementById('originalImageContainer');
    const originalRes = document.getElementById('originalRes');
    const originalSize = document.getElementById('originalSize');
    
    // Clear container
    originalImageContainer.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = originalImage.src;
    img.alt = 'Foto Asli (Sering pecah di WA)';
    originalImageContainer.appendChild(img);
    
    // Update info
    originalRes.textContent = `${originalImage.naturalWidth} × ${originalImage.naturalHeight}`;
    originalSize.textContent = formatFileSize(originalImage.src.length * 0.75);
    
    // Reset enhanced image
    document.getElementById('enhancedImageContainer').innerHTML = '<p>Hasil WhatsApp HD akan muncul di sini</p>';
    document.getElementById('enhancedRes').textContent = '-';
    document.getElementById('enhancedSize').textContent = '-';
    enhancedImage = null;
    
    // Enable enhance button
    document.getElementById('enhanceBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = true;
    
    // Reset upload area
    resetUploadArea();
}

function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Unggah Foto</h3>
        <p class="format-info">Format: JPG, PNG (Maks. 5MB)</p>
    `;
    
    // Re-add click event
    uploadArea.addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
}

function enhanceImage() {
    if (!originalImage || isProcessing) return;
    
    console.log('Memulai optimasi WhatsApp HD...');
    
    isProcessing = true;
    const enhanceBtn = document.getElementById('enhanceBtn');
    enhanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengoptimalkan untuk WA...';
    enhanceBtn.disabled = true;
    
    // Proses optimasi
    setTimeout(() => {
        try {
            optimizeForWhatsApp();
        } catch (error) {
            console.error('Error saat mengoptimalkan foto:', error);
            showNotification('❌ Terjadi kesalahan saat mengoptimalkan', 'error');
            resetEnhanceButton();
        }
    }, 100);
}

function optimizeForWhatsApp() {
    // Ambil nilai slider
    const sharpness = parseInt(document.getElementById('sharpness').value);
    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);
    const saturation = parseInt(document.getElementById('saturation').value);
    
    // Tentukan apakah ini mode WhatsApp HD Extreme
    const isWAHDExtreme = sharpness > 70 || (sharpness > 65 && contrast > 65);
    
    // Buat canvas
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // ANALISIS GAMBAR TERLEBIH DAHULU
    const imageInfo = analyzeImageForWhatsApp();
    
    // OPTIMAL RESOLUSI UNTUK WHATSAPP
    // WhatsApp optimal resolution: 1600x1600 maksimal untuk kualitas baik
    let targetWidth = originalImage.naturalWidth;
    let targetHeight = originalImage.naturalHeight;
    
    // Jika gambar terlalu besar, resize ke ukuran optimal WhatsApp
    const maxDimension = 1600; // WhatsApp handles well up to 1600px
    if (targetWidth > maxDimension || targetHeight > maxDimension) {
        const scale = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
        targetWidth = Math.round(targetWidth * scale);
        targetHeight = Math.round(targetHeight * scale);
    }
    
    // Jika gambar terlalu kecil, upscale moderate
    const minDimension = 800; // Minimum untuk kualitas WhatsApp yang baik
    if (targetWidth < minDimension && targetHeight < minDimension) {
        const scale = Math.min(minDimension / targetWidth, minDimension / targetHeight);
        targetWidth = Math.round(targetWidth * Math.min(scale, 1.5)); // Maks upscale 50%
        targetHeight = Math.round(targetHeight * Math.min(scale, 1.5));
    }
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    console.log(`WhatsApp HD Mode: ${isWAHDExtreme ? 'Extreme' : 'Standard'}`);
    console.log(`Resolusi optimal: ${canvas.width}x${canvas.height}`);
    console.log(`Analisis gambar: ${imageInfo.type}, Compress: ${imageInfo.needsCompression}`);
    
    // Gambar gambar dengan kualitas tinggi
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // Dapatkan data gambar
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // TERAPKAN OPTIMASI KHUSUS WHATSAPP
    applyWhatsAppOptimization(data, brightness, contrast, saturation, sharpness, isWAHDExtreme, imageInfo);
    
    // Kembalikan data ke canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Final touch untuk WhatsApp
    if (isWAHDExtreme) {
        const finalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyFinalWhatsAppEnhancement(finalImageData.data, canvas.width, canvas.height);
        ctx.putImageData(finalImageData, 0, 0);
    }
    
    // Buat gambar hasil dengan kualitas optimal untuk WhatsApp
    enhancedImage = new Image();
    enhancedImage.onload = function() {
        displayEnhancedImage();
        resetEnhanceButton();
        showNotification(
            isWAHDExtreme 
                ? '✅ WhatsApp HD Extreme siap! Foto tidak akan pecah!' 
                : '✅ WhatsApp HD siap! Kualitas terjaga!', 
            'success'
        );
    };
    enhancedImage.onerror = function() {
        showNotification('❌ Gagal membuat foto hasil', 'error');
        resetEnhanceButton();
    };
    
    // QUALITY OPTIMIZATION UNTUK WHATSAPP
    // WhatsApp compress lebih baik dengan quality 0.85-0.92
    const waQuality = isWAHDExtreme ? 0.92 : 0.88;
    enhancedImage.src = canvas.toDataURL('image/jpeg', waQuality);
}

function analyzeImageForWhatsApp() {
    // Analisis cepat untuk menentukan kebutuhan optimasi
    const info = {
        type: 'standard',
        needsSharpening: false,
        needsCompression: false,
        isLowQuality: false
    };
    
    // Cek resolusi
    if (originalImage.naturalWidth < 800 || originalImage.naturalHeight < 800) {
        info.isLowQuality = true;
        info.type = 'low-res';
    }
    
    // Cek jika gambar terlalu besar
    if (originalImage.naturalWidth > 2000 || originalImage.naturalHeight > 2000) {
        info.needsCompression = true;
        info.type = 'high-res';
    }
    
    // Cek file size (perkiraan)
    const estimatedSize = originalImage.src.length * 0.75;
    if (estimatedSize > 2 * 1024 * 1024) { // >2MB
        info.needsCompression = true;
    }
    
    return info;
}

function applyWhatsAppOptimization(data, brightness, contrast, saturation, sharpness, isWAHDExtreme, imageInfo) {
    const length = data.length;
    
    // PARAMETER OPTIMAL UNTUK WHATSAPP
    // WhatsApp cenderung mengurangi kontras dan saturasi
    // Jadi kita perlu boost sedikit untuk kompensasi
    const brightnessAdj = (brightness - 50) * 1.2; // Lebih halus
    const contrastAdj = (contrast - 50) / 80; // Lebih natural
    const saturationAdj = saturation / 55; // Sedikit lebih tinggi untuk kompensasi WA
    const sharpnessAdj = sharpness / 120; // Lebih halus untuk hindari artefak
    
    // 1. TERAPKAN BRIGHTNESS DENGAN TONE MAPPING
    for (let i = 0; i < length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Adaptive brightness - lebih banyak untuk area gelap
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const adaptiveBrightness = brightnessAdj * (1.2 - luminance / 255);
        
        r += adaptiveBrightness;
        g += adaptiveBrightness;
        b += adaptiveBrightness;
        
        data[i] = clamp(r, 0, 255);
        data[i + 1] = clamp(g, 0, 255);
        data[i + 2] = clamp(b, 0, 255);
    }
    
    // 2. TERAPKAN CONTRAST YANG SMART
    const contrastFactor = (259 * (255 + contrastAdj * 255)) / (255 * (259 - contrastAdj * 255));
    for (let i = 0; i < length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Protect skin tones and highlights
        const avg = (r + g + b) / 3;
        if (avg > 200) { // Highlights - kurangi contrast
            r = r * 0.9 + avg * 0.1;
            g = g * 0.9 + avg * 0.1;
            b = b * 0.9 + avg * 0.1;
        }
        
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
        
        data[i] = clamp(r, 0, 255);
        data[i + 1] = clamp(g, 0, 255);
        data[i + 2] = clamp(b, 0, 255);
    }
    
    // 3. TERAPKAN SATURASI YANG NATURAL
    // WhatsApp mengurangi saturasi, jadi kita perlu boost yang smart
    for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Boost saturasi lebih untuk mid-tones, kurang untuk highlights/shadows
        let adaptiveSaturation = saturationAdj;
        if (luminance < 50 || luminance > 200) {
            adaptiveSaturation *= 0.7; // Kurangi untuk extreme tones
        }
        
        data[i] = clamp(luminance + (r - luminance) * adaptiveSaturation, 0, 255);
        data[i + 1] = clamp(luminance + (g - luminance) * adaptiveSaturation, 0, 255);
        data[i + 2] = clamp(luminance + (b - luminance) * adaptiveSaturation, 0, 255);
    }
    
    // 4. TERAPKAN SHARPENING YANG TIDAK MEMBUAT PECAH
    if (sharpnessAdj > 0.08 && !imageInfo.isLowQuality) {
        applyWhatsAppSafeSharpening(data, canvas.width, canvas.height, sharpnessAdj, isWAHDExtreme);
    }
    
    // 5. TERAPKAN NOISE REDUCTION UNTUK FOTO RENDAH KUALITAS
    if (imageInfo.isLowQuality) {
        applyLightNoiseReduction(data, canvas.width, canvas.height);
    }
}

function applyWhatsAppSafeSharpening(data, width, height, strength, isWAHDExtreme) {
    // Sharpening yang aman untuk WhatsApp - tidak membuat artefak
    const originalData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Edge detection untuk sharpening selective
            let edgeScore = 0;
            for (let c = 0; c < 3; c++) {
                const idx = (y * width + x) * 4 + c;
                const center = originalData[idx];
                
                const top = originalData[((y-1) * width + x) * 4 + c];
                const bottom = originalData[((y+1) * width + x) * 4 + c];
                const left = originalData[(y * width + (x-1)) * 4 + c];
                const right = originalData[(y * width + (x+1)) * 4 + c];
                
                // Laplacian untuk edge detection
                const laplacian = Math.abs(4 * center - top - bottom - left - right);
                edgeScore += laplacian;
            }
            
            edgeScore /= 3;
            
            // Hanya sharpen area dengan edge yang jelas (bukan noise)
            if (edgeScore > 15 && edgeScore < 100) {
                for (let c = 0; c < 3; c++) {
                    const idx = (y * width + x) * 4 + c;
                    const center = originalData[idx];
                    
                    // Unsharp mask yang halus
                    let sum = 0;
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                            sum += originalData[nIdx];
                            count++;
                        }
                    }
                    
                    const blurred = sum / count;
                    const sharpened = center + (center - blurred) * strength * 0.3;
                    
                    data[idx] = clamp(sharpened, 0, 255);
                }
            }
        }
    }
}

function applyLightNoiseReduction(data, width, height) {
    // Noise reduction ringan untuk foto low-quality
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                const values = [];
                
                // Ambil 3x3 neighborhood
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4 + c;
                        values.push(tempData[idx]);
                    }
                }
                
                // Sort dan ambil median
                values.sort((a, b) => a - b);
                const median = values[4];
                
                const idx = (y * width + x) * 4 + c;
                // Blend dengan original (90% original, 10% median)
                data[idx] = tempData[idx] * 0.9 + median * 0.1;
            }
        }
    }
}

function applyFinalWhatsAppEnhancement(data, width, height) {
    // Final touch untuk WhatsApp - micro-contrast dan color balance
    const length = data.length;
    
    // 1. Micro-contrast enhancement
    for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = (r + g + b) / 3;
        
        // Subtle micro-contrast boost
        data[i] = clamp(r * 0.995 + avg * 0.005, 0, 255);
        data[i + 1] = clamp(g * 0.995 + avg * 0.005, 0, 255);
        data[i + 2] = clamp(b * 0.995 + avg * 0.005, 0, 255);
    }
    
    // 2. Color balance untuk WhatsApp (WhatsApp cenderung membuat warna lebih cool)
    for (let i = 0; i < length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Tambah warmth sedikit untuk kompensasi WhatsApp
        r = clamp(r * 1.01, 0, 255);
        b = clamp(b * 0.99, 0, 255);
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
}

function displayEnhancedImage() {
    const enhancedImageContainer = document.getElementById('enhancedImageContainer');
    const enhancedRes = document.getElementById('enhancedRes');
    const enhancedSize = document.getElementById('enhancedSize');
    
    // Clear container
    enhancedImageContainer.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = enhancedImage.src;
    img.alt = 'Hasil WhatsApp HD (Tidak Pecah)';
    enhancedImageContainer.appendChild(img);
    
    // Update info
    enhancedRes.textContent = `${canvas.width} × ${canvas.height}`;
    enhancedSize.textContent = formatFileSize(enhancedImage.src.length * 0.75);
    
    // Enable download button
    document.getElementById('downloadBtn').disabled = false;
    
    // Update comparison slider
    const originalImgBox = document.querySelector('.image-box:first-child .image-placeholder');
    const enhancedImgBox = document.querySelector('.image-box:last-child .image-placeholder');
    originalImgBox.style.clipPath = 'inset(0 50% 0 0)';
    enhancedImgBox.style.clipPath = 'inset(0 0 0 50%)';
    
    isProcessing = false;
}

function resetEnhanceButton() {
    const enhanceBtn = document.getElementById('enhanceBtn');
    enhanceBtn.innerHTML = '<i class="fas fa-magic"></i> Optimalkan Gambar';
    enhanceBtn.disabled = false;
    isProcessing = false;
}

// ============================
// FUNGSI BANTU WHATSAPP HD
// ============================

function applyPreset(preset) {
    let sharpnessVal, brightnessVal, contrastVal, saturationVal;
    let presetName = '';
    
    switch(preset) {
        case 'portrait':
            sharpnessVal = 60;  // Sedang, hindari oversharpening
            brightnessVal = 58; // Sedikit terang
            contrastVal = 62;   // Kontras sedang
            saturationVal = 48; // Saturasi natural
            presetName = 'Potrait WA';
            break;
        case 'landscape':
            sharpnessVal = 68;  // Lebih tajam
            brightnessVal = 62; // Lebih terang
            contrastVal = 70;   // Kontras lebih
            saturationVal = 65; // Warna lebih hidup
            presetName = 'Pemandangan WA';
            break;
        case 'vintage':
            sharpnessVal = 45;  // Soft
            brightnessVal = 52; // Natural
            contrastVal = 58;   // Kontras rendah
            saturationVal = 40; // Desaturated
            presetName = 'Vintage WA';
            break;
        case 'hd':
            sharpnessVal = 75;  // Optimal untuk WA
            brightnessVal = 65; // Brightness optimal
            contrastVal = 72;   // Kontras optimal
            saturationVal = 62; // Warna optimal
            presetName = 'WA HD Extreme';
            break;
        default:
            return;
    }
    
    // Update slider values
    document.getElementById('sharpness').value = sharpnessVal;
    document.getElementById('brightness').value = brightnessVal;
    document.getElementById('contrast').value = contrastVal;
    document.getElementById('saturation').value = saturationVal;
    
    // Update display values
    document.getElementById('sharpnessValue').textContent = sharpnessVal;
    document.getElementById('brightnessValue').textContent = brightnessVal;
    document.getElementById('contrastValue').textContent = contrastVal;
    document.getElementById('saturationValue').textContent = saturationVal;
    
    // Apply enhancements
    enhanceImage();
    
    showNotification(`✅ Preset "${presetName}" diterapkan!`, 'info');
}

function resetControls() {
    // Reset slider values to default optimal untuk WhatsApp
    document.getElementById('sharpness').value = 65;
    document.getElementById('brightness').value = 55;
    document.getElementById('contrast').value = 65;
    document.getElementById('saturation').value = 60;
    
    // Update display values
    document.getElementById('sharpnessValue').textContent = '65';
    document.getElementById('brightnessValue').textContent = '55';
    document.getElementById('contrastValue').textContent = '65';
    document.getElementById('saturationValue').textContent = '60';
    
    if (originalImage) {
        showNotification('⚙️ Pengaturan direset ke optimal WhatsApp', 'info');
        enhanceImage();
    } else {
        showNotification('⚙️ Pengaturan direset', 'info');
    }
}

function downloadImage() {
    if (!enhancedImage) return;
    
    try {
        // Buat nama file khusus WhatsApp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `whatsapp-hd-${currentFileName || 'foto'}-${timestamp}.jpg`;
        
        // Buat link download
        const link = document.createElement('a');
        link.href = enhancedImage.src;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`📥 Foto WhatsApp HD siap! Simpan dan kirim via WA!`, 'success');
        
        // Tips untuk WhatsApp
        setTimeout(() => {
            showNotification('💡 Tips: Kirim sebagai "Document" di WA untuk kualitas terbaik!', 'info');
        }, 2000);
        
    } catch (error) {
        console.error('Error downloading image:', error);
        showNotification('❌ Gagal mengunduh foto', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    // Set text
    notificationText.textContent = message;
    
    // Set color berdasarkan type
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else if (type === 'success') {
        notification.style.background = '#25D366'; // Warna WhatsApp
    } else if (type === 'info') {
        notification.style.background = '#3498db';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 4 seconds (lebih lama untuk tips)
    const hideTime = type === 'info' ? 5000 : 4000;
    setTimeout(() => {
        notification.classList.remove('show');
    }, hideTime);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Fungsi tambahan untuk kualitas WhatsApp
function getWhatsAppCompressionInfo() {
    return {
        maxDimension: 1600,
        optimalQuality: 0.88,
        maxFileSize: 16 * 1024 * 1024, // 16MB (WhatsApp limit)
        recommendedSize: 2 * 1024 * 1024 // 2MB untuk kualitas baik
    };
}