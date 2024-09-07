import crypto from "crypto";

export const generateGiftCode = (input) => {
  // Generate a unique value (timestamp + random bytes)
  const uniqueValue = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  // Combine unique value with input
  const combinedInput = `${input}-${uniqueValue}`;

  // Generate SHA-256 hash
  const hash = crypto.createHash("sha256").update(combinedInput).digest("hex");

  // Convert hash to uppercase and return 32 characters
  return hash.toUpperCase().substring(0, 32);
};

const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateRandomValues = () => {
  const uid = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit random int
  const usernamePrefix = "MEMBER";
  const usernameSuffix = generateRandomString(8); // Random alphanumeric string
  const username = usernamePrefix + usernameSuffix;
  const join_code = Math.floor(Math.random() * 9999999999999) + 1000000000000; // 5-digit random int

  return { uid, username, join_code };
};
export const generateOrderId = () => {
  const uid = Math.floor(Math.random() * 9000000000000) + 1000000000000; // 8-digit random int

  return uid;
};
export const generateOtp = () => {
  const otp = Math.floor(Math.random() * 9000) + 1000; // 4-digit random int
  return otp;
};

export const increaseAmountByPercentage = (amount, percentage) => {
  amount = parseInt(amount);
  percentage = parseFloat(percentage);
  if (amount < 0) {
    throw new Error("Amount cannot be negative.");
  }
  if (percentage < 0) {
    throw new Error("Percentage cannot be negative.");
  }
  return Math.round(amount * (1 + percentage / 100));
};

export const setTransactionHistory = (data) => {
  const uid = data.uid;
  const type = data.type;
  const details = data.details;

  pool.query(
    "INSERT INTO transaction_history (uid, type, details) VALUES (?, ?, ?)",
    [uid, type, details],
    (error, results) => {
      if (error) {
        console.error("Database insertion error:", error.message);
        return false;
      }
      return true;
    }
  );
};

export const formatMoney = (
  amount,
  currencySymbol = "₹",
  decimalPlaces = 2
) => {
  // Convert amount to a number (parseFloat works for strings and numbers)
  const numberAmount = parseFloat(amount);

  if (isNaN(numberAmount)) return `${currencySymbol}0.00`;

  // Convert to fixed decimal places
  let formattedAmount = numberAmount.toFixed(decimalPlaces);

  // Add thousands separator
  let parts = formattedAmount.split(".");
  let integerPart = parts[0];
  let decimalPart = parts[1];

  // Use regex to add commas for thousands
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Construct the formatted amount
  return `${currencySymbol}${integerPart}.${decimalPart}`;
};
