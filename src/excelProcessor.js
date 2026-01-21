import * as XLSX from "xlsx";

/* ------------------ TRANSLATION CACHE ------------------ */
const translationCache = new Map();

/* ------------------ DELAY HELPER ------------------ */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ------------------ TRANSLATE SINGLE TEXT ------------------ */
async function translateMarathi(text) {
  if (!text) return "";

  // If already English → skip
  if (/^[a-zA-Z\s]+$/.test(text)) return text;

  // Cached?
  if (translationCache.has(text)) {
    return translationCache.get(text);
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=mr|en`
    );
    const data = await response.json();
    const translated = data.responseData?.translatedText || text;

    translationCache.set(text, translated);
    return translated;
  } catch {
    return text;
  }
}

/* ------------------ MAIN EXCEL PROCESSOR ------------------ */
export async function processExcelFile(file, setProgress) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  let totalRows = 0;
  workbook.SheetNames.forEach((s) => {
    totalRows += XLSX.utils.sheet_to_json(workbook.Sheets[s]).length;
  });

  let processed = 0;
  const contacts = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const originalName = row.Name || row.name || "";
      const phone = row.Mobile || row.Phone || row.mobile || "";

      const translatedName = await translateMarathi(originalName);

      contacts.push({
        name: translatedName,
        phone: phone,
      });

      processed++;
      setProgress(Math.floor((processed / totalRows) * 100));

      // 🔥 VERY IMPORTANT: delay per row
      await delay(1500);
    }
  }

  return contacts;
}
