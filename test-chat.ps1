# Quick Chat Test Script
# Test the banking agent with a sample conversation

$baseUrl = "http://localhost:3000"

Write-Host "💬 Testing Yellow Bank Banking Agent" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Test 1: Start conversation
Write-Host "👤 User: 'I want to check my loan details'" -ForegroundColor Yellow
$body = @{
    message = "I want to check my loan details"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -Body $body -ContentType "application/json"
    Write-Host "🤖 Agent: $($response.response.message)" -ForegroundColor Cyan
    Write-Host "   AI Generated: $(if ($response.response.aiGenerated) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($response.response.aiGenerated) { 'Green' } else { 'Red' })
    Write-Host "   State: $($response.state.state)" -ForegroundColor Gray
    Write-Host ""
    
    $sessionId = $response.sessionId
    
    # Test 2: Provide phone number
    Write-Host "👤 User: '9876543210'" -ForegroundColor Yellow
    $body2 = @{
        message = "9876543210"
    } | ConvertTo-Json
    
    $headers = @{
        "X-Session-Id" = $sessionId
    }
    
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -Body $body2 -ContentType "application/json" -Headers $headers
    Write-Host "🤖 Agent: $($response2.response.message)" -ForegroundColor Cyan
    Write-Host "   AI Generated: $(if ($response2.response.aiGenerated) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($response2.response.aiGenerated) { 'Green' } else { 'Red' })
    Write-Host "   State: $($response2.state.state)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "✅ Test completed successfully!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the server is running on $baseUrl" -ForegroundColor Yellow
}
