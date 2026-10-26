const categories = ["Lab report", "Prescription", "Imaging", "Discharge summary", "Other"];
function validateRecord({title,category,recordDate}) {
  if (typeof title !== "string" || title.trim().length < 2 || title.length > 120) return "Enter a document title between 2 and 120 characters.";
  if (!categories.includes(category)) return "Choose a document category.";
  if (typeof recordDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(recordDate) || isNaN(Date.parse(recordDate)) || new Date(recordDate).toISOString().slice(0,10) !== recordDate || recordDate < "1900-01-01" || recordDate > new Date().toISOString().slice(0,10)) return "Choose a valid date that is not in the future.";
  return null;
}
function validateScope(body,uuid) {
  const {recordIds,hours} = body;
  if (!Array.isArray(recordIds) || !recordIds.length || recordIds.length>30 || recordIds.some(id=>typeof id!=="string" || !uuid(id)) || new Set(recordIds).size!==recordIds.length) return "Select between 1 and 30 of your documents.";
  if (![1,6,24,72,168].includes(hours)) return "Choose a supported sharing duration.";
  return null;
}
module.exports={validateRecord,validateScope};
