export function handleApiError(error, res) {
  console.error('API Error:', error)
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => err.message)
    })
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    })
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate entry found'
    })
  }
  
  // Default error response
  return res.status(500).json({
    message: 'Internal server error'
  })
}

export function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

export function validateEmail(email) {
  const emailRegex = /^[0-9]{2}[A-Z]{3}[0-9]{3}@charusat\.edu\.in$/
  return emailRegex.test(email)
}

export function extractUserInfoFromEmail(email) {
  const match = email.match(/^(\d{2})([A-Z]{3})(\d{3})@charusat\.edu\.in$/)
  if (!match) {
    throw new Error('Invalid email format')
  }
  
  return {
    admissionYear: 2000 + parseInt(match[1]),
    department: match[2],
    rollNumber: match[3]
  }
}
