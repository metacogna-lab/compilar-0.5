// Simple test script to verify backend is running
import { fetch } from 'bun'

async function testHealth() {
  try {
    const response = await fetch('http://localhost:3001/health')
    const data = await response.json()
    console.log('✅ Health check passed:', data)
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  }
}

testHealth()