#!/bin/bash

# ========================================= #
# DATA BRANCH PROTECTION SETUP             #
# ========================================= #

echo "🔒 Setting up Data Branch Protection..."

# Repository settings
OWNER="plankl"
REPO="ehrenamtskarte_ff_hamberg_v2"
BRANCH="data"

# GitHub API URLs
API_BASE="https://api.github.com/repos/${OWNER}/${REPO}"
BRANCH_PROTECTION_URL="${API_BASE}/branches/${BRANCH}/protection"

echo ""
echo "📋 Repository: ${OWNER}/${REPO}"
echo "🌿 Branch: ${BRANCH}"
echo ""

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "Alternative: Use GitHub web interface:"
    echo "1. Go to: https://github.com/${OWNER}/${REPO}/settings/branches"
    echo "2. Add rule for '${BRANCH}' branch"
    echo "3. Enable: 'Restrict pushes that create files'"
    echo "4. Enable: 'Require a pull request before merging'"
    echo "5. Enable: 'Require review from code owners'"
    exit 1
fi

# Authenticate with GitHub
echo "🔐 Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI:"
    gh auth login
fi

echo ""
echo "⚙️ Setting up branch protection rules..."

# Create branch protection rule
gh api \
  --method PUT \
  -H "Accept: application/vnd.github.v3+json" \
  "${BRANCH_PROTECTION_URL}" \
  --input - << EOF
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": {
    "users": ["${OWNER}"],
    "teams": [],
    "apps": []
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false
}
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Branch protection rules applied successfully!"
    echo ""
    echo "🔒 Current Protection Settings:"
    echo "   • Only you (${OWNER}) can push to '${BRANCH}'"
    echo "   • Pull requests required for changes"
    echo "   • Admin enforcement enabled"
    echo "   • Force pushes blocked"
    echo "   • Branch deletion blocked"
    echo ""
    echo "🌐 Manage settings at:"
    echo "   https://github.com/${OWNER}/${REPO}/settings/branches"
else
    echo ""
    echo "❌ Failed to apply branch protection rules."
    echo "Please set up manually via GitHub web interface."
fi