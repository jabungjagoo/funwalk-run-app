// ============================================================
// CODE.GS - BACKEND GOOGLE APPS SCRIPT (VERSION FIX)
// ============================================================

// ============ KONFIGURASI ============
// SPREADSHEET ID (dari URL)
const SPREADSHEET_ID = '1fXldA2xdZnMXduGG1sxTjtSCU0FBKq4ibLIdJWSJNFI';
// =====================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = processData(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Data berhasil disimpan!",
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processData(data) {
  // ==========================================
  // 1. AKSES SPREADSHEET
  // ==========================================
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Data Olahraga');
  
  // Jika sheet "Data Olahraga" belum ada, buat baru
  if (!sheet) {
    sheet = ss.insertSheet('Data Olahraga');
    sheet.appendRow([
      'Timestamp', 'Email', 'Nama', 'Payroll', 'No HP',
      'Departemen', 'Jenis Aktivitas', 'Setoran Ke',
      'Tanggal', 'Waktu', 'Jarak (KM)', 'Waktu Tempuh (Menit)',
      'URL Bukti', 'URL Selfie'
    ]);
  }
  
  // ==========================================
  // 2. UPLOAD FILE KE GOOGLE DRIVE
  // ==========================================
  let buktiUrl = '';
  let selfieUrl = '';
  
  if (data.buktiRekapan && data.buktiRekapan.bytes) {
    try {
      const buktiBlob = Utilities.newBlob(
        data.buktiRekapan.bytes,
        data.buktiRekapan.mimeType || 'image/jpeg',
        `Bukti_${data.nama}_${data.tanggalAktivitas}.${data.buktiRekapan.name ? data.buktiRekapan.name.split('.').pop() : 'jpg'}`
      );
      const buktiFile = DriveApp.createFile(buktiBlob);
      buktiUrl = buktiFile.getUrl();
    } catch (e) {
      Logger.log('⚠️ Gagal upload bukti: ' + e.toString());
    }
  }
  
  if (data.selfie && data.selfie.bytes) {
    try {
      const selfieBlob = Utilities.newBlob(
        data.selfie.bytes,
        data.selfie.mimeType || 'image/jpeg',
        `Selfie_${data.nama}_${data.tanggalAktivitas}.${data.selfie.name ? data.selfie.name.split('.').pop() : 'jpg'}`
      );
      const selfieFile = DriveApp.createFile(selfieBlob);
      selfieUrl = selfieFile.getUrl();
    } catch (e) {
      Logger.log('⚠️ Gagal upload selfie: ' + e.toString());
    }
  }
  
  // ==========================================
  // 3. SIMPAN DATA KE SPREADSHEET
  // ==========================================
  sheet.appendRow([
    new Date().toISOString(),
    data.email || '',
    data.nama || '',
    data.payroll || '',
    data.noHp || '',
    data.departemen || '',
    data.jenisAktivitas || '',
    data.setoranKe || '',
    data.tanggalAktivitas || '',
    data.waktuAktivitas || '',
    parseFloat(data.jarakTempuh) || 0,
    parseInt(data.waktuTempuh) || 0,
    buktiUrl || '',
    selfieUrl || ''
  ]);
  
  return { 
    row: sheet.getLastRow(),
    buktiFile: buktiUrl,
    selfieFile: selfieUrl
  };
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'API is running!',
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet ditemukan: ' + ss.getName());
    return '✅ Sukses! Koneksi ke spreadsheet berhasil.';
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return '❌ Gagal: ' + e.toString();
  }
}
