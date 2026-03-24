// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Simular variables de entorno para pruebas
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.DEFAULT_MODEL = 'gpt-4'
process.env.MAX_FILE_SIZE = '10485760'
process.env.MAX_TOKENS = '4000'
process.env.TEMPERATURE = '0.3'
