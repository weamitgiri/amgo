#!/usr/bin/env bash
# Project Initialization Verification Script
# Run this script to verify all restructuring is complete

echo "🚀 Project Architecture Verification Script"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
total=0
passed=0

check_file() {
  total=$((total + 1))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    passed=$((passed + 1))
  else
    echo -e "${RED}✗${NC} $1"
  fi
}

check_dir() {
  total=$((total + 1))
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    passed=$((passed + 1))
  else
    echo -e "${RED}✗${NC} $1/"
  fi
}

echo "📁 Checking Directories..."
echo "------------------------"
check_dir "src/api"
check_dir "src/config"
check_dir "src/constants"
check_dir "src/hooks"
check_dir "src/middleware"
check_dir "src/pages"
check_dir "src/store"
check_dir "src/types"
check_dir "src/utils"
check_dir "src/components/common"
check_dir "src/components/layouts"
check_dir "src/components/features"

echo ""
echo "📄 Checking Core Files..."
echo "------------------------"
check_file "src/api/client.ts"
check_file "src/api/errors.ts"
check_file "src/api/index.ts"
check_file "src/config/environment.ts"
check_file "src/constants/index.ts"
check_file "src/store/index.ts"
check_file "src/store/hooks.ts"
check_file "src/store/selectors.ts"
check_file "src/store/slices/authSlice.ts"
check_file "src/store/slices/gamesSlice.ts"
check_file "src/types/api.ts"
check_file "src/types/common.ts"
check_file "src/types/index.ts"
check_file "src/utils/common.ts"
check_file "src/utils/validation.ts"
check_file "src/utils/index.ts"
check_file "src/hooks/useAsync.ts"
check_file "src/hooks/useDebounce.ts"
check_file "src/hooks/useLocalStorage.ts"
check_file "src/hooks/index.ts"
check_file "src/middleware/auth.ts"
check_file "src/middleware/routes.ts"

echo ""
echo "📚 Checking Documentation..."
echo "----------------------------"
check_file "README.md"
check_file "ARCHITECTURE.md"
check_file "SETUP.md"
check_file "CODE_STANDARDS.md"
check_file "MIGRATION.md"
check_file "RESTRUCTURING_SUMMARY.md"
check_file "QUICK_START.md"
check_file ".env.example"

echo ""
echo "📦 Checking Configuration..."
echo "----------------------------"
check_file "package.json"
check_file "tsconfig.json"
check_file ".gitignore"

echo ""
echo "📝 Checking Example Files..."
echo "----------------------------"
check_file "src/components/features/EXAMPLE_GameCard.tsx"
check_file "src/components/features/EXAMPLE_SearchGames.tsx"
check_file "src/pages/EXAMPLE_GamesPage.tsx"

echo ""
echo "==============================="
echo "Results: ${GREEN}${passed}${NC}/${total} checks passed"
echo "==============================="

if [ $passed -eq $total ]; then
  echo -e "${GREEN}✅ All architecture files are in place!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. npm install @reduxjs/toolkit react-redux"
  echo "2. cp .env.example .env.local"
  echo "3. npm run dev"
  echo ""
  echo "Read QUICK_START.md for detailed instructions"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some files are missing!${NC}"
  exit 1
fi
