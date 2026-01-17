# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed." -ForegroundColor Red
    exit 1
}

# Check if inside a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository." -ForegroundColor Red
    exit 1
}

# Get current status
Write-Host "Checking status..." -ForegroundColor Cyan
git status

# Ask for commit message
$message = Read-Host "Enter commit message (Press Enter for 'Update')"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Update"
}

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "Committing with message: '$message'..." -ForegroundColor Cyan
git commit -m "$message"

# Push
Write-Host "Pushing to remote..." -ForegroundColor Cyan
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "Error pushing to GitHub. Please check your remote configuration." -ForegroundColor Red
}

Pause
