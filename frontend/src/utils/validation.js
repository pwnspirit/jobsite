// Shared client-side validation helpers.

// Nepal phone numbers: 10 digits, optionally prefixed with +977 (space or dash allowed).
export const PHONE_HINT = 'Enter a 10-digit number, e.g. 9812345678 or +977-9812345678'
const PHONE_REGEX = /^(\+977[\s-]?)?\d{10}$/

// Keep only digits, +, spaces and dashes while typing; cap the length.
export function sanitizePhone(value) {
  return value.replace(/[^\d+\s-]/g, '').slice(0, 18)
}

export function isValidPhone(value) {
  const v = (value || '').trim()
  return v === '' || PHONE_REGEX.test(v)
}

// Password: at least 8 characters, with at least one letter and one number.
export const PASSWORD_HINT = 'At least 8 characters, including a letter and a number'
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function isValidPassword(value) {
  return PASSWORD_REGEX.test(value || '')
}
