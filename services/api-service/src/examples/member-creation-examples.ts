/**
 * Example usage of the POST /members endpoint
 * Demonstrates creating family members with relationships
 */

// Example 1: Create a root person (grandparent)
const createGrandfather = {
  firstName: "Robert",
  lastName: "Smith",
  middleName: "James",
  bio: "Family patriarch, World War II veteran and carpenter",
  birthDate: "1925-03-15",
  birthPlace: "Boston, Massachusetts",
  gender: "Male"
};

// POST http://localhost:3001/api/v1/members
// Response: { success: true, data: { person: { id: "grandfather-uuid", ... } } }

// Example 2: Create a child with parent relationship
const createFather = {
  firstName: "Michael",
  lastName: "Smith",
  middleName: "Robert",
  bio: "Software engineer and devoted father of three",
  birthDate: "1955-07-22",
  birthPlace: "Boston, Massachusetts",
  gender: "Male",
  fatherId: "grandfather-uuid" // References the grandfather created above
};

// POST http://localhost:3001/api/v1/members
// This will:
// 1. Validate that grandfather-uuid exists
// 2. Create Michael
// 3. Create parent relationship (grandfather -> Michael)
// 4. Create child relationship (Michael -> grandfather)

// Example 3: Create spouse relationship
const createMother = {
  firstName: "Sarah",
  lastName: "Smith",
  maidenName: "Johnson",
  bio: "Elementary school teacher and community volunteer",
  birthDate: "1957-11-30",
  birthPlace: "New York, New York",
  gender: "Female",
  spouseId: "michael-uuid" // References Michael created above
};

// POST http://localhost:3001/api/v1/members
// This will:
// 1. Validate that michael-uuid exists
// 2. Create Sarah
// 3. Create spouse relationship (Sarah -> Michael)
// 4. Create spouse relationship (Michael -> Sarah)

// Example 4: Create child with both parents
const createChild = {
  firstName: "Emily",
  lastName: "Smith",
  bio: "College student studying biology",
  birthDate: "2005-04-10",
  birthPlace: "Boston, Massachusetts",
  gender: "Female",
  fatherId: "michael-uuid",
  motherId: "sarah-uuid"
};

// POST http://localhost:3001/api/v1/members
// This will:
// 1. Validate both parent IDs exist
// 2. Create Emily
// 3. Create parent relationships for both mother and father
// 4. Create child relationships back to both parents

// Example 5: Get the recursive family tree
// GET http://localhost:3001/api/v1/members/grandfather-uuid/tree
// Returns:
// {
//   "success": true,
//   "message": "Family tree for Robert Smith",
//   "data": {
//     "id": "grandfather-uuid",
//     "firstName": "Robert",
//     "lastName": "Smith",
//     "parents": [],
//     "spouses": [...],
//     "children": [
//       {
//         "id": "michael-uuid",
//         "firstName": "Michael",
//         "lastName": "Smith",
//         "parents": [{ ...grandfather }],
//         "spouses": [{ ...sarah }],
//         "children": [
//           {
//             "id": "emily-uuid",
//             "firstName": "Emily",
//             "lastName": "Smith",
//             "parents": [{ ...michael }, { ...sarah }],
//             "spouses": [],
//             "children": []
//           }
//         ]
//       }
//     ]
//   }
// }

// Error handling examples:

// Example 6: Missing required fields
const invalidRequest = {
  bio: "Some bio"
  // Missing firstName and lastName
};
// POST http://localhost:3001/api/v1/members
// Response (400): 
// {
//   "success": false,
//   "error": "Validation error",
//   "message": "firstName and lastName are required"
// }

// Example 7: Invalid parent ID
const invalidParent = {
  firstName: "John",
  lastName: "Doe",
  fatherId: "non-existent-uuid"
};
// POST http://localhost:3001/api/v1/members
// Response (400):
// {
//   "success": false,
//   "error": "Validation error",
//   "message": "Father with id non-existent-uuid does not exist"
// }

/**
 * Full workflow example: Building a three-generation family
 */
async function buildFamilyTreeExample() {
  const baseUrl = 'http://localhost:3001/api/v1/members';
  
  // Step 1: Create grandparents
  const grandfather = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "William",
      lastName: "Anderson",
      birthDate: "1930-01-15",
      bio: "Founder of Anderson Construction Co."
    })
  }).then(r => r.json());
  
  const grandmother = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Margaret",
      lastName: "Anderson",
      birthDate: "1932-05-20",
      bio: "Retired nurse and grandmother of 12",
      spouseId: grandfather.data.person.id
    })
  }).then(r => r.json());
  
  // Step 2: Create parent generation
  const father = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "David",
      lastName: "Anderson",
      birthDate: "1960-08-10",
      bio: "Civil engineer following in father's footsteps",
      fatherId: grandfather.data.person.id,
      motherId: grandmother.data.person.id
    })
  }).then(r => r.json());
  
  const mother = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Jennifer",
      lastName: "Anderson",
      birthDate: "1962-11-25",
      bio: "High school math teacher",
      spouseId: father.data.person.id
    })
  }).then(r => r.json());
  
  // Step 3: Create children generation
  const child1 = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Sophie",
      lastName: "Anderson",
      birthDate: "1990-03-14",
      bio: "Medical student specializing in pediatrics",
      fatherId: father.data.person.id,
      motherId: mother.data.person.id
    })
  }).then(r => r.json());
  
  const child2 = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "Daniel",
      lastName: "Anderson",
      birthDate: "1993-07-22",
      bio: "Software developer and tech entrepreneur",
      fatherId: father.data.person.id,
      motherId: mother.data.person.id
    })
  }).then(r => r.json());
  
  // Step 4: Get the complete family tree
  const treeResponse = await fetch(
    `${baseUrl}/${grandfather.data.person.id}/tree`
  );
  const familyTree = await treeResponse.json();
  
  console.log('Complete Family Tree:', JSON.stringify(familyTree.data, null, 2));
}

// Run the example (uncomment to execute)
// buildFamilyTreeExample();
