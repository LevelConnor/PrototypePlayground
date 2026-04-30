@echo off
REM ============================================================
REM  Publish prototype hub
REM  Double-click this file to commit and push all changes
REM  to GitHub. After ~60 seconds, changes will be live.
REM ============================================================

cd /d "%~dp0"

cls
echo.
echo ============================================================
echo   Publishing prototype hub...
echo ============================================================
echo.

echo Changes to publish:
echo.
git status --short
echo.

REM Check if there are any changes
git diff --quiet --cached
set staged=%errorlevel%
git diff --quiet
set unstaged=%errorlevel%

git status --porcelain >nul 2>&1
for /f %%a in ('git status --porcelain ^| find /c /v ""') do set count=%%a

if "%count%"=="0" (
    echo Nothing to publish. No files have changed.
    echo.
    pause
    exit /b 0
)

set /p MESSAGE="What did you change? (one line, then press enter): "

if "%MESSAGE%"=="" set MESSAGE=Update prototypes

echo.
echo Staging changes...
git add .

echo Committing...
git commit -m "%MESSAGE%"

echo Pushing to GitHub...
git push

echo.
echo ============================================================
echo   Done. Your changes will be live in ~60 seconds.
echo ============================================================
echo.
pause
