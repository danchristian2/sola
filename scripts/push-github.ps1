$ErrorActionPreference = "Stop"
Set-Location "C:\Users\HP\Projects\sola"
$log = @()

function Log($msg) { $script:log += $msg; Write-Output $msg }

try {
  if (-not (Test-Path .git)) {
    git init -b main
    Log "initialized git"
  }

  $status = git status --porcelain
  if ($status) {
    git add -A
    $staged = git diff --cached --name-only
    $secrets = $staged | Where-Object { $_ -match '\.env' }
    if ($secrets) { throw "Refusing to commit secrets: $($secrets -join ', ')" }
    git commit -m "Improve SOLA platform UI and workflow"
    Log "committed changes"
  } else {
    Log "nothing to commit"
  }

  $remotes = git remote
  if (-not ($remotes -contains "origin")) {
    gh repo create sola --private --source=. --remote=origin --push
    Log "created repo and pushed"
  } else {
    git push -u origin HEAD
    Log "pushed to existing origin"
  }

  $url = gh repo view --json url -q .url 2>$null
  if (-not $url) { $url = (git remote get-url origin) }

  $result = [ordered]@{
    ok = $true
    repoUrl = $url
    branch = (git branch --show-current)
    commitHash = (git rev-parse HEAD)
    newRepo = -not ($remotes -contains "origin")
    log = $log
  }
} catch {
  $result = [ordered]@{
    ok = $false
    error = $_.Exception.Message
    log = $log
  }
}

$result | ConvertTo-Json -Depth 4 | Set-Content -Path "_github_push_result.json" -Encoding utf8
Write-Output ($result | ConvertTo-Json -Depth 4)
