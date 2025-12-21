# QAagentic SDK Publishing Script
# Automates the entire PyPI publishing process

param(
    [string]$Environment = "pypi",  # pypi or testpypi
    [switch]$SkipBuild = $false,
    [switch]$SkipCheck = $false,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    Write-Host "[$Type] $Message" -ForegroundColor $colors[$Type]
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..." "Info"
    
    # Check Python
    try {
        $pythonVersion = python --version 2>&1
        Write-Status "Found: $pythonVersion" "Success"
    } catch {
        Write-Status "Python not found. Please install Python 3.8+" "Error"
        exit 1
    }
    
    # Check build tools
    try {
        python -m pip show build | Out-Null
        Write-Status "build package found" "Success"
    } catch {
        Write-Status "Installing build package..." "Info"
        python -m pip install build
    }
    
    # Check twine
    try {
        python -m pip show twine | Out-Null
        Write-Status "twine package found" "Success"
    } catch {
        Write-Status "Installing twine package..." "Info"
        python -m pip install twine
    }
}

function Clean-BuildArtifacts {
    Write-Status "Cleaning previous build artifacts..." "Info"
    
    $paths = @("dist", "build", "*.egg-info")
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force
            Write-Status "Removed: $path" "Success"
        }
    }
}

function Build-Packages {
    Write-Status "Building distribution packages..." "Info"
    
    try {
        python -m build
        Write-Status "Build completed successfully" "Success"
        
        # List created files
        Write-Status "Created packages:" "Info"
        Get-ChildItem -Path "dist" | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Status "Build failed: $_" "Error"
        exit 1
    }
}

function Check-Packages {
    Write-Status "Checking package integrity..." "Info"
    
    try {
        python -m twine check dist/*
        Write-Status "Package check passed" "Success"
    } catch {
        Write-Status "Package check failed: $_" "Error"
        exit 1
    }
}

function Publish-Packages {
    param([string]$Repo)
    
    $repoUrl = if ($Repo -eq "testpypi") {
        "https://test.pypi.org/legacy/"
    } else {
        "https://upload.pypi.org/legacy/"
    }
    
    Write-Status "Publishing to $Repo ($repoUrl)..." "Info"
    
    if ($DryRun) {
        Write-Status "DRY RUN: Would publish to $Repo" "Warning"
        Write-Status "Run without -DryRun to actually publish" "Warning"
        return
    }
    
    try {
        if ($Repo -eq "testpypi") {
            python -m twine upload --repository testpypi dist/*
        } else {
            python -m twine upload dist/*
        }
        Write-Status "Publishing completed successfully" "Success"
    } catch {
        Write-Status "Publishing failed: $_" "Error"
        exit 1
    }
}

function Get-PackageInfo {
    Write-Status "Package Information:" "Info"
    
    $pyproject = Get-Content "pyproject.toml" -Raw
    
    if ($pyproject -match 'version = "([^"]+)"') {
        $version = $matches[1]
        Write-Host "  Version: $version" -ForegroundColor Cyan
    }
    
    if ($pyproject -match 'name = "([^"]+)"') {
        $name = $matches[1]
        Write-Host "  Package: $name" -ForegroundColor Cyan
    }
    
    if ($pyproject -match 'description = "([^"]+)"') {
        $desc = $matches[1]
        Write-Host "  Description: $desc" -ForegroundColor Cyan
    }
}

function Show-PostPublishingSteps {
    Write-Status "Post-Publishing Steps:" "Info"
    Write-Host ""
    Write-Host "1. Verify on PyPI:"
    Write-Host "   https://pypi.org/project/qagentic-pytest/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Test installation:"
    Write-Host "   pip install qagentic-pytest --upgrade" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Verify CLI:"
    Write-Host "   qagentic --help" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Update GitHub releases with release notes"
    Write-Host "5. Announce on community channels"
    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         QAagentic SDK Publishing Script v0.1.2             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Get-PackageInfo
Write-Host ""

# Confirm before proceeding
if (-not $DryRun) {
    Write-Status "Publishing to: $Environment" "Warning"
    $confirm = Read-Host "Continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Status "Publishing cancelled" "Info"
        exit 0
    }
}

# Execute steps
Test-Prerequisites
Write-Host ""

if (-not $SkipBuild) {
    Clean-BuildArtifacts
    Write-Host ""
    Build-Packages
    Write-Host ""
}

if (-not $SkipCheck) {
    Check-Packages
    Write-Host ""
}

Publish-Packages -Repo $Environment
Write-Host ""

Show-PostPublishingSteps

Write-Status "Publishing workflow completed!" "Success"
