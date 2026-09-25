param(
    [string]$CommitMessage = "Update Norwegian learning app"
)

$ErrorActionPreference = "Stop"
$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $repoPath
try {
    $branch = (git branch --show-current).Trim()
    if (-not $branch) {
        throw "Detached HEAD: switch to a branch before pushing."
    }

    $remotes = @(git remote)
    if ($LASTEXITCODE -ne 0 -or $remotes -notcontains "origin") {
        throw "Remote 'origin' was not found. Check the output of: git remote -v"
    }

    $status = @(git status --short)
    if ($LASTEXITCODE -ne 0) { throw "Failed to read Git status." }
    if ($status.Count -eq 0) {
        Write-Host "Working tree is clean. Nothing to push."
        exit 0
    }

    Write-Host "Current branch: $branch"
    Write-Host "Working tree changes:"
    $status | ForEach-Object { Write-Host "  $_" }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw "git diff --check failed. Fix whitespace errors first." }

    git add -A
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage files." }
    git diff --cached --check
    if ($LASTEXITCODE -ne 0) { throw "Staged diff check failed." }

    Write-Host "`nFiles staged for commit:"
    git diff --cached --stat
    if ($LASTEXITCODE -ne 0) { throw "Could not read staged change summary." }
    $confirmation = Read-Host "Commit and push to origin/$branch? Type y to continue"
    if ($confirmation -notmatch "^(y|yes)$") {
        Write-Host "Cancelled. Changes remain staged locally; nothing was committed or pushed."
        exit 0
    }

    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) { throw "Commit failed. Check the Git output." }

    git push -u origin $branch
    if ($LASTEXITCODE -ne 0) { throw "Push failed. The local commit remains; fix access/network and retry git push." }

    Write-Host "`nSuccessfully pushed to origin/$branch."
}
finally {
    Pop-Location
}
