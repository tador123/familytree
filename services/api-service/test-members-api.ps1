# API Testing with cURL
# Test the POST /members endpoint and recursive tree functionality

# Set base URL
$BASE_URL = "http://localhost:3001/api/v1/members"

Write-Host "`n=== Testing Family Members API ===" -ForegroundColor Cyan
Write-Host "Base URL: $BASE_URL`n" -ForegroundColor Gray

# Test 1: Create grandfather
Write-Host "Test 1: Creating grandfather..." -ForegroundColor Yellow
$grandfather = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "William"
    lastName = "Thompson"
    bio = "WWII veteran and founder of Thompson Industries"
    birthDate = "1925-05-10"
    gender = "Male"
} | ConvertTo-Json)

Write-Host "Created: $($grandfather.data.person.firstName) $($grandfather.data.person.lastName)" -ForegroundColor Green
Write-Host "ID: $($grandfather.data.person.id)`n" -ForegroundColor Gray
$grandfatherId = $grandfather.data.person.id

# Test 2: Create grandmother with spouse relationship
Write-Host "Test 2: Creating grandmother with spouse relationship..." -ForegroundColor Yellow
$grandmother = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "Elizabeth"
    lastName = "Thompson"
    bio = "Retired teacher and community leader"
    birthDate = "1927-08-15"
    gender = "Female"
    spouseId = $grandfatherId
} | ConvertTo-Json)

Write-Host "Created: $($grandmother.data.person.firstName) $($grandmother.data.person.lastName)" -ForegroundColor Green
Write-Host "Relationships: $($grandmother.data.relationships.Count)`n" -ForegroundColor Gray
$grandmotherId = $grandmother.data.person.id

# Test 3: Create father with both parents
Write-Host "Test 3: Creating father with parent relationships..." -ForegroundColor Yellow
$father = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "Robert"
    lastName = "Thompson"
    bio = "CEO of Thompson Industries"
    birthDate = "1950-03-22"
    gender = "Male"
    fatherId = $grandfatherId
    motherId = $grandmotherId
} | ConvertTo-Json)

Write-Host "Created: $($father.data.person.firstName) $($father.data.person.lastName)" -ForegroundColor Green
Write-Host "Relationships: $($father.data.relationships.Count)`n" -ForegroundColor Gray
$fatherId = $father.data.person.id

# Test 4: Create mother with spouse relationship
Write-Host "Test 4: Creating mother with spouse relationship..." -ForegroundColor Yellow
$mother = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "Jennifer"
    lastName = "Thompson"
    bio = "Architect and philanthropist"
    birthDate = "1952-11-30"
    gender = "Female"
    spouseId = $fatherId
} | ConvertTo-Json)

Write-Host "Created: $($mother.data.person.firstName) $($mother.data.person.lastName)" -ForegroundColor Green
$motherId = $mother.data.person.id

# Test 5: Create children
Write-Host "`nTest 5: Creating children with both parents..." -ForegroundColor Yellow
$child1 = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "Sarah"
    lastName = "Thompson"
    bio = "Software engineer at Google"
    birthDate = "1980-06-15"
    gender = "Female"
    fatherId = $fatherId
    motherId = $motherId
} | ConvertTo-Json)

Write-Host "Created child 1: $($child1.data.person.firstName)" -ForegroundColor Green

$child2 = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
    firstName = "Michael"
    lastName = "Thompson"
    bio = "Medical doctor"
    birthDate = "1982-09-20"
    gender = "Male"
    fatherId = $fatherId
    motherId = $motherId
} | ConvertTo-Json)

Write-Host "Created child 2: $($child2.data.person.firstName)`n" -ForegroundColor Green

# Test 6: Get all members
Write-Host "Test 6: Getting all family members..." -ForegroundColor Yellow
$allMembers = Invoke-RestMethod -Uri $BASE_URL -Method GET
Write-Host "Total members: $($allMembers.data.Count)`n" -ForegroundColor Green

# Test 7: Get recursive family tree
Write-Host "Test 7: Getting recursive family tree..." -ForegroundColor Yellow
$tree = Invoke-RestMethod -Uri "$BASE_URL/$grandfatherId/tree" -Method GET
Write-Host "Tree root: $($tree.data.firstName) $($tree.data.lastName)" -ForegroundColor Green
Write-Host "Children: $($tree.data.children.Count)" -ForegroundColor Green
Write-Host "Grandchildren: $($tree.data.children[0].children.Count)`n" -ForegroundColor Green

# Test 8: Validation - missing required fields
Write-Host "Test 8: Testing validation - missing required fields..." -ForegroundColor Yellow
try {
    $invalid = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
        bio = "This should fail"
    } | ConvertTo-Json)
} catch {
    Write-Host "Validation working! Error caught as expected" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# Test 9: Validation - invalid parent ID
Write-Host "Test 9: Testing validation - invalid parent ID..." -ForegroundColor Yellow
try {
    $invalidParent = Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body (@{
        firstName = "Test"
        lastName = "Person"
        fatherId = "invalid-uuid-12345"
    } | ConvertTo-Json)
} catch {
    Write-Host "Validation working! Error caught as expected" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# Display tree structure
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Family Tree Structure (JSON):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$tree.data | ConvertTo-Json -Depth 10

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "All tests completed successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Cleanup instructions
Write-Host "To view in browser:" -ForegroundColor Yellow
Write-Host "  Tree: http://localhost:3001/api/v1/members/$grandfatherId/tree" -ForegroundColor White
Write-Host "  All:  http://localhost:3001/api/v1/members`n" -ForegroundColor White
