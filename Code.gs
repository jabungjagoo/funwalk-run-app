// ============================================================
// CODE.GS - BACKEND GOOGLE APPS SCRIPT
// ============================================================
// Fungsi: Menerima data dari frontend, simpan ke Google Sheets
//          dan upload file ke Google Drive
// ============================================================

// ============ KONFIGURASI ============
// GANTI DENGAN ID SPREADSHEET ANDA!
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
// =====================================

/**
 * Handle POST request dari frontend
 * Ini adalah endpoint API yang dipanggil oleh index.html
 */
function doPost(e) {
  try {
    // Parse data JSON dari request
    const data = JSON.parse(e.postData.contents);
    
    // Proses data ke Spreadsheet dan Drive
    const result = processData(data);
    
    // Kirim response sukses
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Data berhasil disimpan!",
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Kirim response error
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Proses data: Simpan ke Spreadsheet dan upload file ke Drive
 */
function processData(data) {
  // ==========================================
  // 1. SIMPAN DATA KE SPREADSHEET
  // ==========================================
  const sheet = getOrCreateSheet();
  
  // ==========================================
  // 2. UPLOAD FILE KE GOOGLE DRIVE
  // ==========================================
  let buktiUrl = '';
  let selfieUrl = '';
  
  // Upload file bukti
  if (data.buktiRekapan) {
    const buktiBlob = Utilities.newBlob(
      data.buktiRekapan.bytes,
      data.buktiRekapan.mimeType,
      `Bukti_${data.nama}_${data.tanggalAktivitas}.${data.buktiRekapan.name.split('.').pop()}`
    );
    const buktiFile = DriveApp.createFile(buktiBlob);
    buktiUrl = buktiFile.getUrl();
  }
  
  // Upload file selfie
  if (data.selfie) {
    const selfieBlob = Utilities.newBlob(
      data.selfie.bytes,
      data.selfie.mimeType,
      `Selfie_${data.nama}_${data.tanggalAktivitas}.${data.selfie.name.split('.').pop()}`
    );
    const selfieFile = DriveApp.createFile(selfieBlob);
    selfieUrl = selfieFile.getUrl();
  }
  
  // ==========================================
  // 3. APPEND DATA KE SPREADSHEET
  // ==========================================
  sheet.appendRow([
    new Date().toISOString(),           // 1. Timestamp
    data.email,                         // 2. Email
    data.nama,                          // 3. Nama
    data.payroll,                       // 4. Payroll
    data.noHp,                          // 5. No HP
    data.departemen,                    // 6. Departemen
    data.jenisAktivitas,                // 7. Jenis Aktivitas
    data.setoranKe,                     // 8. Setoran Ke
    data.tanggalAktivitas,              // 9. Tanggal
    data.waktuAktivitas,                // 10. Waktu
    parseFloat(data.jarakTempuh),       // 11. Jarak (KM)
    parseInt(data.waktuTempuh),         // 12. Waktu Tempuh (Menit)
    buktiUrl,                           // 13. URL Bukti
    selfieUrl                           // 14. URL Selfie
  ]);
  
  return { 
    row: sheet.getLastRow(),
    buktiFile: buktiUrl,
    selfieFile: selfieUrl
  };
}

/**
 * Mendapatkan atau membuat sheet baru
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Data Olahraga');
  
  // Jika sheet belum ada, buat baru dengan header
  if (!sheet) {
    sheet = ss.insertSheet('Data Olahraga');
    sheet.appendRow([
      'Timestamp',
      'Email',
      'Nama',
      'Payroll',
      'No HP',
      'Departemen',
      'Jenis Aktivitas',
      'Setoran Ke',
      'Tanggal',
      'Waktu',
      'Jarak (KM)',
      'Waktu Tempuh (Menit)',
      'URL Bukti',
      'URL Selfie'
    ]);
  }
  
  return sheet;
}

/**
 * Fungsi untuk test GET (cek apakah API berjalan)
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'API is running!',
      version: '1.0.0',
      endpoints: {
        post: '/exec (POST)',
        get: '/exec (GET)'
      }
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi untuk debugging (bisa dijalankan manual)
 */
function testConnection() {
  Logger.log('Testing connection to Spreadsheet...');
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Connection successful!');
    Logger.log('Sheet name: ' + ss.getName());
    return 'Success!';
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return 'Error: ' + e.toString();
  }
}
