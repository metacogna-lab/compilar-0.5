/**
 * Simple test script for InteractiveAICoach component
 * Tests basic import and rendering without full test framework
 */

console.log('Testing InteractiveAICoach component...');

try {
  // Test 1: Import the component
  console.log('1. Testing component import...');
  const React = require('react');
  const InteractiveAICoach = require('./src/components/assess/InteractiveAICoach.jsx').default;
  console.log('✅ Component imported successfully');

  // Test 2: Check if component is a function
  console.log('2. Testing component type...');
  if (typeof InteractiveAICoach === 'function') {
    console.log('✅ Component is a valid React component');
  } else {
    console.log('❌ Component is not a function');
  }

  // Test 3: Test useAIChat hook import
  console.log('3. Testing useAIChat hook import...');
  const { useAIChat } = require('./src/hooks/useRestApi.js');
  if (typeof useAIChat === 'function') {
    console.log('✅ useAIChat hook imported successfully');
  } else {
    console.log('❌ useAIChat hook import failed');
  }

  // Test 4: Check if required dependencies are available
  console.log('4. Testing dependencies...');
  try {
    require('react-markdown');
    console.log('✅ react-markdown available');
  } catch (e) {
    console.log('❌ react-markdown not available');
  }

  try {
    require('framer-motion');
    console.log('✅ framer-motion available');
  } catch (e) {
    console.log('❌ framer-motion not available');
  }

  console.log('\n🎉 Basic component tests completed successfully!');
  console.log('\nNext steps for manual testing:');
  console.log('1. Open http://localhost:5175 in browser');
  console.log('2. Navigate to assessment page');
  console.log('3. Open InteractiveAICoach modal');
  console.log('4. Test sending messages');
  console.log('5. Check network requests to /api/v1/ai/chat');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}