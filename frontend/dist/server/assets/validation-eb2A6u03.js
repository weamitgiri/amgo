import "clsx";
function validateRequired(value) {
  if (!value || value.trim() === "") {
    return { isValid: false, error: "This field is required" };
  }
  return { isValid: true };
}
function validateUrl(url) {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid URL" };
  }
}
export {
  validateUrl as a,
  validateRequired as v
};
