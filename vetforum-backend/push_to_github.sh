#!/bin/bash

# Initialize repository if not already initialized
if [ ! -d ".git" ]; then
    git init
fi

# Add all files including the new production-ready structure
git add .

# Commit changes
git commit -m "chore: initial commit of production-ready backend structure"

# Set default branch to main
git branch -M main

# Add remote repository
git remote add origin https://github.com/vikasgavandi/vetforum-backend.git

# Push to GitHub
git push -u origin main
