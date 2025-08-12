// utils/errorHandler.js

// 🔧 Converts "firstName" → "First Name"
const toTitleCase = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, " $1");

// ✅ Handles Mongoose Validation and Cast Errors
export const handleValidationError = (error, res) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => {
      const field = toTitleCase(err.path || "Field");

      // Handle nested CastError inside ValidationError
      if (err.name === "CastError") {
        if (err.kind === "number") return `${field} must be a number`;
        if (err.kind === "ObjectId") return `${field} must be a valid ID`;
        return `${field} must be a valid ${err.kind}`;
      }

      return `${field} is invalid: ${err.message}`;
    });

    return res.status(400).json({ message: "Validation failed", errors });
  }

  // ✅ Top-level CastError
  if (error.name === "CastError") {
    const field = toTitleCase(error.path || "Field");
    const kind = error.kind;

    return res.status(400).json({
      message: "Validation failed",
      errors: [`${field} must be a valid ${kind}`],
    });
  }

  return null; // Let fallback handler proceed
};

// ✅ Fallback handler (e.g. duplicate keys, internal errors)
export const handleErrorResponse = (res, error, defaultMessage = "Internal Server Error") => {
  console.error("❌ Error:", error);

  const handled = handleValidationError(error, res);
  if (handled) return;

  // Handle duplicate key error (MongoDB)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  // General fallback
  return res.status(500).json({ message: defaultMessage });
};
