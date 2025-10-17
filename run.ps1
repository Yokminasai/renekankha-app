param(
	[switch]$NoInstall
)

# Move to script directory
Set-Location -Path $PSScriptRoot

# Bypass policy for this process only
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force | Out-Null

# Check node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Error 'Node.js not found. Install from https://nodejs.org/'
	exit 1
}

if (-not $NoInstall) {
	Write-Host 'Installing dependencies...'
	npm install
	if ($LASTEXITCODE -ne 0) {
		Write-Warning 'npm install failed. Trying: npx --yes corepack enable; npm install'
		npx --yes corepack enable
		npm install
	}
}

Start-Process 'http://localhost:3000'

Write-Host 'Starting server...'
$env:NODE_ENV = 'development'
node server.js

