/**
 * Utility functions for date and calendar management.
 * Specifically for scheduling doctor appointments and consultations.
 */

/**
 * Checks if a given time slot is within the specified availability range.
 * @param {string} slotStart - Time string (HH:mm:ss)
 * @param {string} slotEnd - Time string (HH:mm:ss)
 * @param {string} availStart - Availability start time (HH:mm:ss)
 * @param {string} availEnd - Availability end time (HH:mm:ss)
 * @returns {boolean}
 */
export const isTimeInRange = (slotStart, slotEnd, availStart, availEnd) => {
  // Simple string comparison works for HH:mm:ss format
  return slotStart >= availStart && slotEnd <= availEnd;
};

/**
 * Formats a date object to YYYY-MM-DD string.
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets the day name (e.g., 'Monday') from a Date object.
 * @param {Date} date 
 * @returns {string}
 */
export const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Standardizes time format to HH:mm:ss.
 * @param {string} time - Time string
 * @returns {string}
 */
export const standardizeTime = (time) => {
  // Handle cases like "9:00" or "09:00"
  if (!time) return '00:00:00';
  const parts = time.split(':');
  if (parts.length < 2) return '00:00:00';
  
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  const s = parts[2] ? parts[2].padStart(2, '0') : '00';
  
  return `${h}:${m}:${s}`;
};
