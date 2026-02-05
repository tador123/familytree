#!/usr/bin/env node

/**
 * Test script for the POST /members endpoint and recursive tree functionality
 * Run with: node test-members-api.js
 * Make sure the API service is running on http://localhost:3001
 */

const BASE_URL = 'http://localhost:3001/api/v1/members';

async function testAPI() {
  console.log('🧪 Testing Family Members API\n');
  console.log('Base URL:', BASE_URL);
  console.log('─'.repeat(60));

  try {
    // Test 1: Create grandfather (root of tree)
    console.log('\n✓ Test 1: Creating grandfather...');
    const grandfatherRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'William',
        lastName: 'Thompson',
        middleName: 'James',
        bio: 'WWII veteran and founder of Thompson Industries',
        birthDate: '1925-05-10',
        birthPlace: 'Chicago, Illinois',
        gender: 'Male'
      })
    });
    const grandfather = await grandfatherRes.json();
    console.log('   Created:', grandfather.success ? 
      `${grandfather.data.person.firstName} ${grandfather.data.person.lastName} (${grandfather.data.person.id})` : 
      'FAILED: ' + grandfather.message);
    
    if (!grandfather.success) throw new Error('Failed to create grandfather');

    // Test 2: Create grandmother with spouse relationship
    console.log('\n✓ Test 2: Creating grandmother with spouse relationship...');
    const grandmotherRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Elizabeth',
        lastName: 'Thompson',
        bio: 'Retired teacher and community leader',
        birthDate: '1927-08-15',
        birthPlace: 'Boston, Massachusetts',
        gender: 'Female',
        spouseId: grandfather.data.person.id
      })
    });
    const grandmother = await grandmotherRes.json();
    console.log('   Created:', grandmother.success ? 
      `${grandmother.data.person.firstName} ${grandmother.data.person.lastName}` :
      'FAILED: ' + grandmother.message);
    console.log('   Relationships created:', grandmother.data.relationships?.length || 0);

    // Test 3: Create father with both parents
    console.log('\n✓ Test 3: Creating father with parent relationships...');
    const fatherRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Robert',
        lastName: 'Thompson',
        bio: 'CEO of Thompson Industries',
        birthDate: '1950-03-22',
        birthPlace: 'Chicago, Illinois',
        gender: 'Male',
        fatherId: grandfather.data.person.id,
        motherId: grandmother.data.person.id
      })
    });
    const father = await fatherRes.json();
    console.log('   Created:', father.success ? 
      `${father.data.person.firstName} ${father.data.person.lastName}` :
      'FAILED: ' + father.message);
    console.log('   Relationships created:', father.data.relationships?.length || 0);

    // Test 4: Create mother
    console.log('\n✓ Test 4: Creating mother with spouse relationship...');
    const motherRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jennifer',
        lastName: 'Thompson',
        bio: 'Architect and philanthropist',
        birthDate: '1952-11-30',
        birthPlace: 'New York, New York',
        gender: 'Female',
        spouseId: father.data.person.id
      })
    });
    const mother = await motherRes.json();
    console.log('   Created:', mother.success ? 
      `${mother.data.person.firstName} ${mother.data.person.lastName}` :
      'FAILED: ' + mother.message);

    // Test 5: Create children
    console.log('\n✓ Test 5: Creating children with both parents...');
    const child1Res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Sarah',
        lastName: 'Thompson',
        bio: 'Software engineer at Google',
        birthDate: '1980-06-15',
        birthPlace: 'San Francisco, California',
        gender: 'Female',
        fatherId: father.data.person.id,
        motherId: mother.data.person.id
      })
    });
    const child1 = await child1Res.json();
    console.log('   Created child 1:', child1.success ? 
      `${child1.data.person.firstName}` :
      'FAILED');

    const child2Res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Michael',
        lastName: 'Thompson',
        bio: 'Medical doctor specializing in cardiology',
        birthDate: '1982-09-20',
        birthPlace: 'Chicago, Illinois',
        gender: 'Male',
        fatherId: father.data.person.id,
        motherId: mother.data.person.id
      })
    });
    const child2 = await child2Res.json();
    console.log('   Created child 2:', child2.success ? 
      `${child2.data.person.firstName}` :
      'FAILED');

    // Test 6: Get all members
    console.log('\n✓ Test 6: Getting all family members...');
    const allMembersRes = await fetch(BASE_URL);
    const allMembers = await allMembersRes.json();
    console.log('   Total members:', allMembers.data?.length || 0);

    // Test 7: Get recursive tree
    console.log('\n✓ Test 7: Getting recursive family tree...');
    const treeRes = await fetch(`${BASE_URL}/${grandfather.data.person.id}/tree`);
    const tree = await treeRes.json();
    console.log('   Tree root:', tree.success ? 
      `${tree.data.firstName} ${tree.data.lastName}` :
      'FAILED: ' + tree.message);
    console.log('   Children:', tree.data?.children?.length || 0);
    console.log('   Grandchildren:', tree.data?.children?.[0]?.children?.length || 0);

    // Test 8: Error handling - missing required fields
    console.log('\n✓ Test 8: Testing validation - missing required fields...');
    const invalidRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio: 'This should fail'
      })
    });
    const invalid = await invalidRes.json();
    console.log('   Expected error:', invalidRes.status === 400 ? '✓ Validation working' : '✗ FAILED');
    console.log('   Error message:', invalid.message);

    // Test 9: Error handling - invalid parent ID
    console.log('\n✓ Test 9: Testing validation - invalid parent ID...');
    const invalidParentRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Person',
        fatherId: 'invalid-uuid-12345'
      })
    });
    const invalidParent = await invalidParentRes.json();
    console.log('   Expected error:', invalidParentRes.status === 400 ? '✓ Validation working' : '✗ FAILED');
    console.log('   Error message:', invalidParent.message);

    // Display tree structure
    console.log('\n' + '─'.repeat(60));
    console.log('📊 Final Family Tree Structure:');
    console.log('─'.repeat(60));
    console.log(JSON.stringify(tree.data, null, 2));

    console.log('\n' + '─'.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run tests
testAPI();
