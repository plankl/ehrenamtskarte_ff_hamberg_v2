@echo off
REM ========================================= 
REM DATA BRANCH PROTECTION SETUP (Windows)   
REM ========================================= 

echo 🔒 Setting up Data Branch Protection...

set OWNER=plankl
set REPO=ehrenamtskarte_ff_hamberg_v2
set BRANCH=data

echo.
echo 📋 Repository: %OWNER%/%REPO%
echo 🌿 Branch: %BRANCH%
echo.

REM Check if GitHub CLI is available
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI (gh) is not installed.
    echo Please install it from: https://cli.github.com/
    echo.
    echo Alternative: Use GitHub web interface:
    echo 1. Go to: https://github.com/%OWNER%/%REPO%/settings/branches
    echo 2. Add rule for '%BRANCH%' branch
    echo 3. Enable: 'Restrict pushes that create files'
    echo 4. Enable: 'Require a pull request before merging'
    echo 5. Enable: 'Require review from code owners'
    pause
    exit /b 1
)

echo 🔐 Checking GitHub authentication...
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo Please authenticate with GitHub CLI:
    gh auth login
)

echo.
echo ⚙️ Setting up branch protection rules...

REM Create temporary JSON file
echo { > protection.json
echo   "required_status_checks": null, >> protection.json
echo   "enforce_admins": true, >> protection.json
echo   "required_pull_request_reviews": { >> protection.json
echo     "required_approving_review_count": 1, >> protection.json
echo     "dismiss_stale_reviews": true, >> protection.json
echo     "require_code_owner_reviews": true, >> protection.json
echo     "require_last_push_approval": true >> protection.json
echo   }, >> protection.json
echo   "restrictions": { >> protection.json
echo     "users": ["%OWNER%"], >> protection.json
echo     "teams": [], >> protection.json
echo     "apps": [] >> protection.json
echo   }, >> protection.json
echo   "allow_force_pushes": false, >> protection.json
echo   "allow_deletions": false, >> protection.json
echo   "block_creations": false >> protection.json
echo } >> protection.json

REM Apply protection rules
gh api --method PUT -H "Accept: application/vnd.github.v3+json" "/repos/%OWNER%/%REPO%/branches/%BRANCH%/protection" --input protection.json

if %errorlevel% equ 0 (
    echo.
    echo ✅ Branch protection rules applied successfully!
    echo.
    echo 🔒 Current Protection Settings:
    echo    • Only you (%OWNER%^) can push to '%BRANCH%'
    echo    • Pull requests required for changes
    echo    • Admin enforcement enabled
    echo    • Force pushes blocked
    echo    • Branch deletion blocked
    echo.
    echo 🌐 Manage settings at:
    echo    https://github.com/%OWNER%/%REPO%/settings/branches
) else (
    echo.
    echo ❌ Failed to apply branch protection rules.
    echo Please set up manually via GitHub web interface.
)

del protection.json
pause