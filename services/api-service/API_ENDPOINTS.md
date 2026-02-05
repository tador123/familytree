# API Service Endpoints

## Base URL
```
http://localhost:3001/api/v1
```

## Family Members / Members Endpoints

### 1. Create New Family Member
**POST** `/members` or `/family-members`

Creates a new family member with optional parent and spouse relationships. Validates that parent and spouse IDs exist before creating relationships.

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "bio": "A loving father and software engineer...",
  "birthDate": "1980-05-15",
  "birthPlace": "New York, NY",
  "gender": "Male",
  "fatherId": "uuid-of-father",
  "motherId": "uuid-of-mother",
  "spouseId": "uuid-of-spouse"
}
```

#### Required Fields
- `firstName` (string)
- `lastName` (string)

#### Optional Fields
- `middleName` (string)
- `bio` (string) - Stored as `biography` in database
- `birthDate` (ISO date string)
- `birthPlace` (string)
- `gender` (string)
- `fatherId` (UUID) - Validated against existing persons
- `motherId` (UUID) - Validated against existing persons
- `spouseId` (UUID) - Validated against existing persons

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Family member created successfully",
  "data": {
    "person": {
      "id": "generated-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "birthDate": "1980-05-15T00:00:00.000Z",
      "biography": "A loving father and software engineer...",
      "createdAt": "2026-02-05T10:30:00.000Z",
      "updatedAt": "2026-02-05T10:30:00.000Z"
    },
    "relationships": [
      {
        "id": "relationship-uuid-1",
        "personFromId": "father-uuid",
        "personToId": "generated-uuid",
        "relationshipType": "parent"
      },
      {
        "id": "relationship-uuid-2",
        "personFromId": "mother-uuid",
        "personToId": "generated-uuid",
        "relationshipType": "parent"
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "error": "Validation error",
  "message": "firstName and lastName are required"
}
```

**400 Bad Request** - Invalid parent/spouse ID
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Father with id abc-123 does not exist"
}
```

---

### 2. Get All Family Members
**GET** `/members` or `/family-members`

Returns a list of all family members ordered by last name, then first name.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Get all family members",
  "data": [
    {
      "id": "uuid-1",
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "birthDate": "1980-05-15T00:00:00.000Z",
      "deathDate": null,
      "isLiving": true,
      "profilePhotoId": null
    }
  ]
}
```

---

### 3. Get Single Family Member
**GET** `/members/:id` or `/family-members/:id`

Returns detailed information about a specific family member including their relationships.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Get family member abc-123",
  "data": {
    "id": "abc-123",
    "firstName": "John",
    "lastName": "Doe",
    "biography": "A loving father...",
    "relationshipsFrom": [
      {
        "relationshipType": "parent",
        "personTo": {
          "id": "child-uuid",
          "firstName": "Jane",
          "lastName": "Doe"
        }
      }
    ],
    "relationshipsTo": [
      {
        "relationshipType": "child",
        "personFrom": {
          "id": "parent-uuid",
          "firstName": "Robert",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Family member not found"
}
```

---

### 4. Get Recursive Family Tree
**GET** `/members/:id/tree` or `/family-members/:id/tree`

Returns a nested JSON object representing the entire family hierarchy starting from the specified root member. This recursive function builds a complete tree structure including:
- The person's information
- Their parents
- Their spouse(s)
- Their children (recursively with their own trees)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Family tree for John Doe",
  "data": {
    "id": "root-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "birthDate": "1980-05-15T00:00:00.000Z",
    "deathDate": null,
    "isLiving": true,
    "biography": "A loving father...",
    "occupation": "Software Engineer",
    "profilePhotoId": null,
    "personalityTags": [],
    "parents": [
      {
        "id": "parent1-uuid",
        "firstName": "Robert",
        "lastName": "Doe",
        "birthDate": "1955-03-10T00:00:00.000Z",
        "deathDate": null,
        "isLiving": true,
        "profilePhotoId": null
      }
    ],
    "spouses": [
      {
        "id": "spouse-uuid",
        "firstName": "Mary",
        "lastName": "Doe",
        "birthDate": "1982-08-20T00:00:00.000Z",
        "deathDate": null,
        "isLiving": true,
        "profilePhotoId": null
      }
    ],
    "children": [
      {
        "id": "child1-uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "birthDate": "2005-12-01T00:00:00.000Z",
        "parents": [...],
        "spouses": [],
        "children": []
      },
      {
        "id": "child2-uuid",
        "firstName": "Tom",
        "lastName": "Doe",
        "birthDate": "2008-07-15T00:00:00.000Z",
        "parents": [...],
        "spouses": [],
        "children": [
          {
            "id": "grandchild-uuid",
            "firstName": "Emma",
            "lastName": "Doe",
            "birthDate": "2030-01-10T00:00:00.000Z",
            "parents": [...],
            "spouses": [],
            "children": []
          }
        ]
      }
    ]
  }
}
```

#### Features
- **Recursive Structure**: Each child node contains their own complete tree
- **Circular Protection**: Prevents infinite loops with visited tracking
- **Complete Relationships**: Includes parents, spouses, and children at each level
- **Rich Data**: Returns biographical information and metadata for each person

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Root person not found"
}
```

---

## Example Usage

### Create a new family member with parents
```bash
curl -X POST http://localhost:3001/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Smith",
    "bio": "Youngest daughter of the Smith family",
    "birthDate": "2010-06-20",
    "fatherId": "father-uuid-here",
    "motherId": "mother-uuid-here"
  }'
```

### Get the recursive family tree
```bash
curl http://localhost:3001/api/v1/members/root-person-uuid/tree
```

### Get all members
```bash
curl http://localhost:3001/api/v1/members
```

---

## Implementation Details

### Validation Logic
1. **Required Field Validation**: Ensures `firstName` and `lastName` are provided
2. **Parent Existence Validation**: Queries database to verify `fatherId` exists before creating relationship
3. **Mother Existence Validation**: Queries database to verify `motherId` exists before creating relationship
4. **Spouse Existence Validation**: Queries database to verify `spouseId` exists before creating relationship

### Relationship Creation
When a member is created with parent or spouse IDs, the system:
1. Creates the person record
2. Creates bidirectional relationships:
   - **Parent → Child**: Creates `parent` relationship from parent to child
   - **Child → Parent**: Creates `child` relationship from child to parent
   - **Spouse ↔ Spouse**: Creates mutual `spouse` relationships

### Recursive Tree Algorithm
The `getRecursiveFamilyTree` function:
1. **Base Case**: Returns null if person doesn't exist or already visited
2. **Fetch Person**: Loads person with relationships (parents, children, spouses)
3. **Process Children**: Recursively builds tree for each child
4. **Build Node**: Constructs tree node with person data, parents, spouses, and children
5. **Return Tree**: Returns nested JSON structure

**Circular Protection**: Uses a `visited` Set to track processed IDs and prevent infinite loops in case of data anomalies.
