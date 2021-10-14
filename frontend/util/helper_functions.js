export const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export const anyEmptyFields = (...fields) => fields.some((value) => value === undefined || value.trim() === "");