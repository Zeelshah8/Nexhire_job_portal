const ConvertDate = (dateValue) => {
  if (!dateValue) return "";
  const timestamp = Number(dateValue);
  const date = new Date(timestamp);
  if (isNaN(date)) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};


export default ConvertDate;
