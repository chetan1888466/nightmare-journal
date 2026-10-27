@echo off
title Nightmare Journal
echo =======================================================
echo  Starting Nightmare Journal...
echo  Ollama Model: gemma4:e2b
echo =======================================================
echo.
echo Make sure Ollama is running in another window:
echo   ollama run gemma4:e2b
echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000
node server.js
pause
