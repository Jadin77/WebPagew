param(
  [int]$MaxPages = 40,
  [int]$DelayMs = 2500,
  [int]$MaxDetailLookupsPerRun = 8,
  [int]$DetailDelayMs = 1200,
  [int]$MinIntervalMinutes = 10,
  [int]$BlacklistOwnerPages = 3,
  [int]$BlacklistOwnerDelayMs = 900,
  [int]$MinimumKeepRatio = 35,
  [int]$RetentionDays = 30,
  [int]$MaxVisibleScripts = 3360,
  [switch]$FailOnEmpty,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

if ($MaxPages -lt 1) { throw "MaxPages must be at least 1." }
if ($DelayMs -lt 0) { throw "DelayMs cannot be negative." }
if ($MaxDetailLookupsPerRun -lt 0) { throw "MaxDetailLookupsPerRun cannot be negative." }
if ($DetailDelayMs -lt 0) { throw "DetailDelayMs cannot be negative." }
if ($MinIntervalMinutes -lt 0) { throw "MinIntervalMinutes cannot be negative." }
if ($BlacklistOwnerPages -lt 0) { throw "BlacklistOwnerPages cannot be negative." }
if ($BlacklistOwnerDelayMs -lt 0) { throw "BlacklistOwnerDelayMs cannot be negative." }
if ($MinimumKeepRatio -lt 0 -or $MinimumKeepRatio -gt 100) { throw "MinimumKeepRatio must be between 0 and 100." }
if ($RetentionDays -lt 1 -or $RetentionDays -gt 60) { throw "RetentionDays must be between 1 and 60." }
if ($MaxVisibleScripts -lt 0) { throw "MaxVisibleScripts cannot be negative." }

# Performance-first default: owner enrichment is opt-in (set MaxDetailLookupsPerRun > 0).

function Normalize-OwnerUsername {
  param([object]$Value)
  if (-not ($Value -is [string])) { return "" }
  $username = $Value.Trim()
  if (-not $username) { return "" }
  $lower = $username.ToLowerInvariant()
  if ($lower -eq "unknown" -or $lower -eq "@unknown" -or $lower -eq "n/a" -or $lower -eq "null") { return "" }
  return $username
}

function Normalize-ApiDateUtcString {
  param([object]$Value)
  if ($null -eq $Value) { return "" }
  try {
    $dt = [datetime]$Value
    return $dt.ToUniversalTime().ToString("o")
  } catch {
    $s = [string]$Value
    return $s.Trim()
  }
}

function Get-UtcDateOrNull {
  param([object]$Value)
  if ($null -eq $Value) { return $null }
  try {
    return ([datetime]$Value).ToUniversalTime()
  } catch {
    return $null
  }
}

function Ensure-File {
  param([string]$Path, [string]$DefaultContent = "")
  if (-not (Test-Path $Path)) {
    Set-Content -Path $Path -Value $DefaultContent -Encoding utf8
  }
}

function Read-Lines {
  param([string]$Path)
  Ensure-File -Path $Path
  return @(
    Get-Content $Path |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -and -not $_.StartsWith("#") }
  )
}

function Normalize-ImageUrl {
  param([object]$Value)
  if (-not ($Value -is [string])) { return $null }
  $url = $Value.Trim()
  if (-not $url) { return $null }
  if ($url.StartsWith("//")) { return "https:$url" }
  if ($url.StartsWith("/")) { return "https://scriptblox.com$url" }
  return $url
}

function Normalize-Text {
  param([string]$Text)
  if (-not $Text) { return "" }
  return ([regex]::Replace($Text.ToLowerInvariant(), "[^a-z0-9]+", ""))
}

function Build-KeywordRules {
  param([string[]]$Lines)
  $rules = @()
  foreach ($line in $Lines) {
    $tokens = @(
      ($line -split "\s+") |
      ForEach-Object { Normalize-Text $_ } |
      Where-Object { $_ }
    )
    if ($tokens.Count -gt 0) { $rules += ,$tokens }
  }
  return $rules
}

function Test-MatchByRules {
  param([string]$Title, [object[]]$Rules)
  $normalizedTitle = Normalize-Text $Title
  if (-not $normalizedTitle) { return $false }
  foreach ($tokens in $Rules) {
    $ok = $true
    foreach ($token in $tokens) {
      if (-not $normalizedTitle.Contains($token)) {
        $ok = $false
        break
      }
    }
    if ($ok) { return $true }
  }
  return $false
}

function Invoke-JsonWithRetry {
  param([string]$Uri, [int]$MaxAttempts = 5)
  $attempt = 0
  while ($attempt -lt $MaxAttempts) {
    try {
      return Invoke-RestMethod -Method Get -Uri $Uri
    } catch {
      $attempt++
      if ($attempt -ge $MaxAttempts) { throw }
      $waitSeconds = [Math]::Min(30, [Math]::Pow(2, $attempt))
      Write-Warning ("Request failed ({0}/{1}). Waiting {2}s. Uri: {3}" -f $attempt, $MaxAttempts, $waitSeconds, $Uri)
      Start-Sleep -Seconds $waitSeconds
    }
  }
  throw "Request failed for $Uri"
}

function Get-BlockedSlugsByOwners {
  param(
    [object]$Users,
    [int]$OwnerPages = 0,
    [int]$DelayMs = 0
  )
  $slugSet = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
  if ($OwnerPages -le 0) { return $slugSet }
  foreach ($owner in $Users) {
    $username = Normalize-OwnerUsername $owner
    if (-not $username) { continue }
    for ($page = 1; $page -le $OwnerPages; $page++) {
      $uri = "https://scriptblox.com/api/script/fetch?mode=free&sortBy=createdAt&order=desc&max=20&owner=" + [uri]::EscapeDataString($username) + "&page=$page"
      $payload = $null
      try {
        $payload = Invoke-JsonWithRetry -Uri $uri -MaxAttempts 2
      } catch {
        break
      }
      $rows = @()
      if ($payload.result -and $payload.result.scripts) { $rows = @($payload.result.scripts) }
      foreach ($row in $rows) {
        $slug = [string]$row.slug
        if ($slug) { [void]$slugSet.Add($slug) }
      }
      if ($rows.Count -eq 0) { break }
      if ($payload.result.nextPage -eq $null) { break }
      if ($DelayMs -gt 0) { Start-Sleep -Milliseconds $DelayMs }
    }
  }
  return $slugSet
}

$statePath = Join-Path $PSScriptRoot "scriptblox-refresh-state.json"
if (-not $Force -and $MinIntervalMinutes -gt 0 -and (Test-Path $statePath)) {
  try {
    $state = Get-Content $statePath -Raw | ConvertFrom-Json
    if ($state.lastRunUtc) {
      $lastRun = [datetime]::Parse($state.lastRunUtc).ToUniversalTime()
      $nextAllowed = $lastRun.AddMinutes($MinIntervalMinutes)
      $nowUtc = (Get-Date).ToUniversalTime()
      if ($nowUtc -lt $nextAllowed) {
        $remaining = [Math]::Ceiling(($nextAllowed - $nowUtc).TotalSeconds)
        Write-Warning ("Skipped refresh to avoid rate limit. Try again in about {0} seconds or use -Force." -f $remaining)
        exit 0
      }
    }
  } catch {
    Write-Warning "Could not read refresh state file; continuing."
  }
}

$moderationDir = Join-Path $PSScriptRoot "moderation"
if (-not (Test-Path $moderationDir)) {
  New-Item -ItemType Directory -Path $moderationDir | Out-Null
}

$settingsPath = Join-Path $moderationDir "settings.json"
$blacklistKeywordsPath = Join-Path $moderationDir "blacklist-keywords.txt"
$trustedKeywordsPath = Join-Path $moderationDir "trusted-keywords.txt"
$blacklistUsersPath = Join-Path $moderationDir "blacklist-users.txt"
$trustedUsersPath = Join-Path $moderationDir "trusted-users.txt"
$autoBlacklistTitlesPath = Join-Path $moderationDir "auto-blacklist-titles.txt"
$autoLogPath = Join-Path $moderationDir "auto-blacklist-log.jsonl"

Ensure-File -Path $settingsPath -DefaultContent @"
{
  "max_posts_per_window": 3,
  "max_user_posts_per_window": 3,
  "max_new_posts_per_author_per_run": 5,
  "unresolved_new_post_quarantine_minutes": 240,
  "window_minutes": 10
}
"@
Ensure-File -Path $blacklistKeywordsPath -DefaultContent @"
# One keyword phrase per line.
# Any variation containing all words is blocked.
mm2 dupe
"@
Ensure-File -Path $trustedKeywordsPath -DefaultContent @"
# One trusted keyword phrase per line.
drivehub
ragerhub
"@
Ensure-File -Path $blacklistUsersPath -DefaultContent @"
# One username per line (case-insensitive).
prokhenzu
afkk
ccapi1337
palacescriptz
xtvoo
xwxwzxwxwzx
"@
Ensure-File -Path $trustedUsersPath -DefaultContent @"
# One username per line (case-insensitive).
IHeartCoding
"@
Ensure-File -Path $autoBlacklistTitlesPath -DefaultContent "# Auto-generated normalized titles`r`n"
Ensure-File -Path $autoLogPath

$settingsDefault = @{ max_posts_per_window = 3; max_user_posts_per_window = 3; max_new_posts_per_author_per_run = 5; unresolved_new_post_quarantine_minutes = 240; window_minutes = 10 }
$settings = $settingsDefault
try {
  $parsed = Get-Content $settingsPath -Raw | ConvertFrom-Json
  if ($parsed.max_posts_per_window) { $settings.max_posts_per_window = [int]$parsed.max_posts_per_window }
  if ($parsed.max_user_posts_per_window) { $settings.max_user_posts_per_window = [int]$parsed.max_user_posts_per_window }
  if ($parsed.max_new_posts_per_author_per_run) { $settings.max_new_posts_per_author_per_run = [int]$parsed.max_new_posts_per_author_per_run }
  if ($parsed.unresolved_new_post_quarantine_minutes) { $settings.unresolved_new_post_quarantine_minutes = [int]$parsed.unresolved_new_post_quarantine_minutes }
  if ($parsed.window_minutes) { $settings.window_minutes = [int]$parsed.window_minutes }
} catch {
  Write-Warning "Invalid moderation/settings.json; using defaults."
}
$maxPostsPerWindow = [Math]::Max(1, [int]$settings.max_posts_per_window)
$maxUserPostsPerWindow = [Math]::Max(1, [int]$settings.max_user_posts_per_window)
$maxNewPostsPerAuthorPerRun = [Math]::Max(1, [int]$settings.max_new_posts_per_author_per_run)
$unresolvedQuarantineMinutes = [Math]::Max(0, [int]$settings.unresolved_new_post_quarantine_minutes)
$windowMinutes = [Math]::Max(1, [int]$settings.window_minutes)

$blacklistRules = Build-KeywordRules -Lines (Read-Lines -Path $blacklistKeywordsPath)
$trustedRules = Build-KeywordRules -Lines (Read-Lines -Path $trustedKeywordsPath)
$blacklistUsers = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($u in (Read-Lines -Path $blacklistUsersPath)) { [void]$blacklistUsers.Add($u.Trim()) }
$trustedUsers = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($u in (Read-Lines -Path $trustedUsersPath)) { [void]$trustedUsers.Add($u.Trim()) }
$autoTitleKeys = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($line in (Read-Lines -Path $autoBlacklistTitlesPath)) { [void]$autoTitleKeys.Add($line) }
$blockedSlugsByOwner = Get-BlockedSlugsByOwners -Users $blacklistUsers -OwnerPages $BlacklistOwnerPages -DelayMs $BlacklistOwnerDelayMs

$baseApi = "https://scriptblox.com/api/script/fetch?mode=free&sortBy=createdAt&order=desc"
$ownerCachePath = Join-Path $PSScriptRoot "scriptblox-owner-cache.json"
$rollingCachePath = Join-Path $PSScriptRoot "scriptblox-rolling-cache.json"
$retentionCutoffUtc = (Get-Date).ToUniversalTime().AddDays(-1 * [double]$RetentionDays)
$rollingCacheItems = @()
$ownerCache = @{}
if (Test-Path $ownerCachePath) {
  try {
    $rawCache = Get-Content $ownerCachePath -Raw | ConvertFrom-Json
    if ($rawCache -and $rawCache.PSObject.Properties) {
      foreach ($prop in $rawCache.PSObject.Properties) { $ownerCache[$prop.Name] = $prop.Value }
    }
  } catch {
    Write-Warning "Could not parse scriptblox-owner-cache.json; starting with empty owner cache."
  }
}
if (Test-Path $rollingCachePath) {
  try {
    $rollingRaw = Get-Content $rollingCachePath -Raw | ConvertFrom-Json
    if ($rollingRaw -and $rollingRaw.scripts) {
      $rollingCacheItems = @($rollingRaw.scripts)
    } elseif ($rollingRaw) {
      $rollingCacheItems = @($rollingRaw)
    }
  } catch {
    Write-Warning "Could not parse scriptblox-rolling-cache.json; continuing without rolling cache."
  }
}

$bySlug = @{}
$totalPages = $null

for ($page = 1; $page -le $MaxPages; $page++) {
  $api = "$baseApi&page=$page"
  $data = $null
  try {
    $data = Invoke-JsonWithRetry -Uri $api -MaxAttempts 5
  } catch {
    Write-Warning ("Stopping at page {0}. Last error: {1}" -f $page, $_.Exception.Message)
    break
  }
  if (-not $data) { break }
  $result = $data.result
  if (-not $totalPages) { $totalPages = [int]$result.totalPages }
  $scripts = @($result.scripts)

  foreach ($s in $scripts) {
    $slug = [string]$s.slug
    if (-not $slug) { continue }
    if ($bySlug.ContainsKey($slug)) { continue }

    $img = Normalize-ImageUrl $s.image
    if (-not $img) { $img = Normalize-ImageUrl $s.imageUrl }
    if (-not $img -and $s.game) { $img = Normalize-ImageUrl $s.game.imageUrl }
    $title = [string]$s.title
    $titleKey = Normalize-Text $title
    $ownerUsername = Normalize-OwnerUsername $s.owner.username
    $ownerProfilePicture = Normalize-ImageUrl $s.owner.profilePicture
    $tags = @()
    if ($s.tags) { $tags = @($s.tags | Where-Object { $_ -ne $null -and "$_".Trim() -ne "" }) }

    $trusted = Test-MatchByRules -Title $title -Rules $trustedRules
    $manualBlacklisted = Test-MatchByRules -Title $title -Rules $blacklistRules
    $trustedByUser = $ownerUsername -and $trustedUsers.Contains($ownerUsername)
    $blockedByUser = ($ownerUsername -and $blacklistUsers.Contains($ownerUsername)) -or ($slug -and $blockedSlugsByOwner.Contains($slug))

    $bySlug[$slug] = [PSCustomObject]@{
      title = $title
      titleKey = $titleKey
      slug = $slug
      views = [int]$s.views
      verified = [bool]$s.verified
      tags = $tags
      image = $img
      createdAt = Normalize-ApiDateUtcString $s.createdAt
      ownerUsername = $ownerUsername
      ownerProfilePicture = $ownerProfilePicture
      trusted = [bool]($trusted -or $trustedByUser)
      trustedByUser = [bool]$trustedByUser
      blocked_user = [bool]$blockedByUser
      blocked_manual_keyword = [bool]$manualBlacklisted
      blocked_spam = $false
      isNewThisRun = $true
    }
  }

  Write-Host ("Fetched page {0}/{1} | page items: {2} | unique scripts: {3}" -f $page, $totalPages, $scripts.Count, $bySlug.Count)
  if ($scripts.Count -eq 0) { break }
  if ($result.nextPage -eq $null) { break }
  if ($page -ge $totalPages) { break }
  if ($DelayMs -gt 0) { Start-Sleep -Milliseconds $DelayMs }
}

# Mark trending scripts using dedicated endpoint.
$trendingSlugs = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$trendScripts = @()
try {
  $trendPayload = Invoke-JsonWithRetry -Uri "https://scriptblox.com/api/script/trending" -MaxAttempts 3
  if ($trendPayload.result -and $trendPayload.result.scripts) { $trendScripts = @($trendPayload.result.scripts) }
  foreach ($t in $trendScripts) {
    $slug = [string]$t.slug
    if ($slug) { [void]$trendingSlugs.Add($slug) }
  }
} catch {
  Write-Warning "Trending fetch failed this run; continuing without trending marks."
}

# Merge trending scripts into dataset so the Trending tab is never empty.
foreach ($t in $trendScripts) {
  $slug = [string]$t.slug
  if (-not $slug) { continue }
  if ($bySlug.ContainsKey($slug)) { continue }

  $img = Normalize-ImageUrl $t.image
  if (-not $img -and $t.game) { $img = Normalize-ImageUrl $t.game.imageUrl }
  $title = [string]$t.title
  $titleKey = Normalize-Text $title
  $ownerUsername = Normalize-OwnerUsername $t.owner.username
  $ownerProfilePicture = Normalize-ImageUrl $t.owner.profilePicture
  $tags = @()
  if ($t.tags) { $tags = @($t.tags | Where-Object { $_ -ne $null -and "$_".Trim() -ne "" }) }
  $trusted = Test-MatchByRules -Title $title -Rules $trustedRules
  $manualBlacklisted = Test-MatchByRules -Title $title -Rules $blacklistRules
  $trustedByUser = $ownerUsername -and $trustedUsers.Contains($ownerUsername)
  $blockedByUser = ($ownerUsername -and $blacklistUsers.Contains($ownerUsername)) -or ($slug -and $blockedSlugsByOwner.Contains($slug))

  $bySlug[$slug] = [PSCustomObject]@{
    title = $title
    titleKey = $titleKey
    slug = $slug
    views = [int]$t.views
    verified = [bool]$t.verified
    tags = $tags
    image = $img
    createdAt = Normalize-ApiDateUtcString $t.createdAt
    ownerUsername = $ownerUsername
    ownerProfilePicture = $ownerProfilePicture
    trusted = [bool]($trusted -or $trustedByUser)
    trustedByUser = [bool]$trustedByUser
    blocked_user = [bool]$blockedByUser
    blocked_manual_keyword = [bool]$manualBlacklisted
    blocked_spam = $false
    isNewThisRun = $true
  }
}

# Merge rolling cache items so we keep a retention window without deep pulling every run.
foreach ($c in $rollingCacheItems) {
  $slug = [string]$c.slug
  if (-not $slug) { continue }
  if ($bySlug.ContainsKey($slug)) { continue }
  $createdAtUtc = Get-UtcDateOrNull $c.createdAt
  if (-not $createdAtUtc) { continue }
  if ($createdAtUtc -lt $retentionCutoffUtc) { continue }

  $title = [string]$c.title
  $titleKey = if ($c.titleKey) { [string]$c.titleKey } else { Normalize-Text $title }
  $ownerUsername = Normalize-OwnerUsername $c.ownerUsername
  $trustedByUser = [bool]($ownerUsername -and $trustedUsers.Contains($ownerUsername))
  $trustedByKeyword = Test-MatchByRules -Title $title -Rules $trustedRules
  $trusted = [bool]($trustedByKeyword -or $trustedByUser)
  $blockedByUser = [bool](($ownerUsername -and $blacklistUsers.Contains($ownerUsername)) -or ($slug -and $blockedSlugsByOwner.Contains($slug)))
  $manualBlacklisted = [bool](Test-MatchByRules -Title $title -Rules $blacklistRules)

  $tags = @()
  if ($c.tags) { $tags = @($c.tags | Where-Object { $_ -ne $null -and "$_".Trim() -ne "" }) }

  $bySlug[$slug] = [PSCustomObject]@{
    title = $title
    titleKey = $titleKey
    slug = $slug
    views = [int]$c.views
    verified = [bool]$c.verified
    tags = $tags
    image = Normalize-ImageUrl $c.image
    createdAt = Normalize-ApiDateUtcString $createdAtUtc
    ownerUsername = $ownerUsername
    ownerProfilePicture = Normalize-ImageUrl $c.ownerProfilePicture
    trusted = [bool]($trusted -or $trustedByUser)
    trustedByUser = [bool]$trustedByUser
    blocked_user = [bool]$blockedByUser
    blocked_manual_keyword = [bool]$manualBlacklisted
    blocked_spam = [bool]$c.blocked_spam
    isNewThisRun = $false
  }
}

$rawScripts = @(
  $bySlug.Values |
    Where-Object {
      $dt = Get-UtcDateOrNull $_.createdAt
      $dt -and $dt -ge $retentionCutoffUtc
    } |
    Sort-Object @{Expression = { $_.createdAt }; Descending = $true }
)
if ($rawScripts.Count -eq 0) {
  Write-Warning "No scripts fetched (likely temporary rate limit). Existing feed files were left unchanged."
  if ($FailOnEmpty) { exit 1 }
  exit 0
}
foreach ($s in $rawScripts) {
  $s | Add-Member -NotePropertyName trending -NotePropertyValue ($trendingSlugs.Contains([string]$s.slug) ) -Force
  $slug = [string]$s.slug
  if (-not $s.ownerUsername -and $slug -and $ownerCache.ContainsKey($slug) -and $ownerCache[$slug].ownerUsername) {
    $s.ownerUsername = Normalize-OwnerUsername $ownerCache[$slug].ownerUsername
  }
  if (-not $s.ownerProfilePicture -and $slug -and $ownerCache.ContainsKey($slug) -and $ownerCache[$slug].ownerProfilePicture) {
    $s.ownerProfilePicture = [string]$ownerCache[$slug].ownerProfilePicture
  }
}

# Enrich missing owner usernames with detail endpoint (rate-limited + cached).
$detailLookupsTried = 0
$detailLookupsSucceeded = 0
if ($MaxDetailLookupsPerRun -gt 0) {
  $needOwner = @($rawScripts | Where-Object { -not $_.ownerUsername } | Select-Object -First $MaxDetailLookupsPerRun)
  foreach ($s in $needOwner) {
    $slug = [string]$s.slug
    if (-not $slug) { continue }
    $detailLookupsTried++
    try {
      $detailUri = "https://scriptblox.com/api/script/" + [uri]::EscapeDataString($slug)
      $detailPayload = Invoke-JsonWithRetry -Uri $detailUri -MaxAttempts 2
      $owner = Normalize-OwnerUsername $detailPayload.result.script.owner.username
      if (-not $owner -and $detailPayload.script) { $owner = Normalize-OwnerUsername $detailPayload.script.owner.username }
      if ($owner) {
        $s.ownerUsername = $owner
        $ownerPfp = Normalize-ImageUrl $detailPayload.result.script.owner.profilePicture
        if (-not $ownerPfp -and $detailPayload.script) { $ownerPfp = Normalize-ImageUrl $detailPayload.script.owner.profilePicture }
        if ($ownerPfp) { $s.ownerProfilePicture = $ownerPfp }
        $ownerCache[$slug] = [PSCustomObject]@{
          ownerUsername = $owner
          ownerProfilePicture = $ownerPfp
          updatedAt = (Get-Date).ToUniversalTime().ToString("o")
        }
        $detailLookupsSucceeded++
      }
    } catch {
      # Ignore per-item failures to avoid breaking feed generation.
    }
    if ($DetailDelayMs -gt 0) { Start-Sleep -Milliseconds $DetailDelayMs }
  }
}

try {
  ($ownerCache | ConvertTo-Json -Depth 6) | Set-Content -Path $ownerCachePath -Encoding utf8
} catch {
  Write-Warning "Could not write scriptblox-owner-cache.json"
}
try {
  $rollingOut = [PSCustomObject]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    retentionDays = $RetentionDays
    count = $rawScripts.Count
    scripts = $rawScripts
  }
  $rollingOut | ConvertTo-Json -Depth 8 | Set-Content -Path $rollingCachePath -Encoding utf8
} catch {
  Write-Warning "Could not write scriptblox-rolling-cache.json"
}

# Anti-spam: block only by new-post author burst per refresh run (trusted users bypass).
$runBlockedOwners = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$newOwnerGroups = $rawScripts | Where-Object { $_.isNewThisRun -and $_.ownerUsername } | Group-Object ownerUsername
foreach ($group in $newOwnerGroups) {
  $owner = [string]$group.Name
  if (-not $owner) { continue }
  if ($trustedUsers.Contains($owner)) { continue }
  if ($group.Count -gt $maxNewPostsPerAuthorPerRun) {
    [void]$runBlockedOwners.Add($owner)
  }
}

$visibleScripts = @()
$filteredKeywordCount = 0
$filteredSpamCount = 0
$filteredOwnerBurstCount = 0
$filteredRunAuthorBurstCount = 0
$filteredUnresolvedNewCount = 0
$filteredUserCount = 0
$nowUtc = (Get-Date).ToUniversalTime()
foreach ($s in $rawScripts) {
  $blockedByOwnerSlug = $s.slug -and $blockedSlugsByOwner.Contains([string]$s.slug)
  if ($s.ownerUsername) {
    $s.trustedByUser = [bool]($trustedUsers.Contains([string]$s.ownerUsername))
    $s.blocked_user = [bool](($blacklistUsers.Contains([string]$s.ownerUsername)) -or $blockedByOwnerSlug)
    if ($s.trustedByUser) { $s.trusted = $true }
  } else {
    $s.trustedByUser = [bool]$s.trustedByUser
    $s.blocked_user = [bool]($s.blocked_user -or $blockedByOwnerSlug)
  }

  $ownerBurstBlocked = $s.ownerUsername -and $runBlockedOwners.Contains([string]$s.ownerUsername)

  if ($s.blocked_user -and -not $s.trustedByUser) {
    $filteredUserCount++
    continue
  }
  # Trusted scripts/users bypass manual keyword blacklist.
  if ($s.blocked_manual_keyword -and -not $s.trusted) {
    $filteredKeywordCount++
    continue
  }
  if ($ownerBurstBlocked -and -not $s.trusted) {
    $filteredRunAuthorBurstCount++
    $filteredOwnerBurstCount++
    $filteredSpamCount++
    continue
  }
  if (-not $s.ownerUsername -and -not $s.trusted -and $unresolvedQuarantineMinutes -gt 0) {
    $createdUtc = Get-UtcDateOrNull $s.createdAt
    if ($createdUtc) {
      $ageMin = ($nowUtc - $createdUtc).TotalMinutes
      if ($ageMin -ge 0 -and $ageMin -le $unresolvedQuarantineMinutes) {
        $filteredUnresolvedNewCount++
        $filteredSpamCount++
        continue
      }
    }
  }
  if ($s.blocked_spam -and -not $s.trusted) {
    $filteredSpamCount++
    continue
  }
  $visibleScripts += $s
}
if ($MaxVisibleScripts -gt 0 -and $visibleScripts.Count -gt $MaxVisibleScripts) {
  $visibleScripts = @($visibleScripts | Select-Object -First $MaxVisibleScripts)
}

$out = [PSCustomObject]@{
  source = "scriptblox"
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  maxPagesRequested = $MaxPages
  totalPagesAtSource = $totalPages
  count = $visibleScripts.Count
  moderation = [PSCustomObject]@{
    max_posts_per_window = $maxPostsPerWindow
    max_user_posts_per_window = $maxUserPostsPerWindow
    max_new_posts_per_author_per_run = $maxNewPostsPerAuthorPerRun
    unresolved_new_post_quarantine_minutes = $unresolvedQuarantineMinutes
    window_minutes = $windowMinutes
    filteredByKeywordCount = $filteredKeywordCount
    filteredByUserCount = $filteredUserCount
    filteredBySpamCount = $filteredSpamCount
    filteredByOwnerBurstCount = $filteredOwnerBurstCount
    filteredByRunAuthorBurstCount = $filteredRunAuthorBurstCount
    filteredByUnresolvedNewCount = $filteredUnresolvedNewCount
    filteredCount = ($filteredKeywordCount + $filteredUserCount + $filteredSpamCount)
    autoBlacklistedTitleCount = $autoTitleKeys.Count
    newlyAutoBlacklistedTitleCount = 0
    burstBlockedOwnerCount = $runBlockedOwners.Count
    trustedKeywordRuleCount = $trustedRules.Count
    blacklistKeywordRuleCount = $blacklistRules.Count
    trustedUserCount = $trustedUsers.Count
    blacklistedUserCount = $blacklistUsers.Count
    blacklistedOwnerSlugCount = $blockedSlugsByOwner.Count
    trendingCount = $trendingSlugs.Count
    ownerResolvedCount = ($rawScripts | Where-Object { $_.ownerUsername } | Measure-Object).Count
    detailLookupsTried = $detailLookupsTried
    detailLookupsSucceeded = $detailLookupsSucceeded
  }
  scripts = $visibleScripts
}

$jsonPath = Join-Path $PSScriptRoot "scriptblox-feed.json"
$jsonBackup = Join-Path $PSScriptRoot "scriptblox-feed.backup.json"
$previousCount = 0
if ((-not $Force) -and (Test-Path $jsonPath)) {
  try {
    $existing = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $previousCount = [int]($existing.count)
    if ($previousCount -le 0 -and $existing.scripts) { $previousCount = [int](@($existing.scripts).Count) }
  } catch {
    $previousCount = 0
  }
}
if ((-not $Force) -and $previousCount -gt 0 -and $MinimumKeepRatio -gt 0) {
  $minimumRequired = [int][Math]::Ceiling($previousCount * ($MinimumKeepRatio / 100.0))
  if ($visibleScripts.Count -lt $minimumRequired) {
    Write-Warning ("Aborting write: new feed count ({0}) is below keep threshold ({1}) from previous count ({2}). Use -Force to override." -f $visibleScripts.Count, $minimumRequired, $previousCount)
    exit 1
  }
}
if (Test-Path $jsonPath) { Copy-Item -Path $jsonPath -Destination $jsonBackup -Force }
$out | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding utf8

$jsPath = Join-Path $PSScriptRoot "scriptblox-feed.js"
$jsBackup = Join-Path $PSScriptRoot "scriptblox-feed.backup.js"
if (Test-Path $jsPath) { Copy-Item -Path $jsPath -Destination $jsBackup -Force }
$jsonMin = $out | ConvertTo-Json -Depth 8 -Compress
"window.SCRIPTBLOX_FEED = $jsonMin;" | Set-Content -Path $jsPath -Encoding utf8

Write-Host "Done. Wrote $($visibleScripts.Count) visible scripts to:"
Write-Host " - $jsonPath"
Write-Host " - $jsPath"
Write-Host ("Filtered by keyword: {0}" -f $filteredKeywordCount)
Write-Host ("Filtered by user: {0}" -f $filteredUserCount)
Write-Host ("Filtered by spam: {0}" -f $filteredSpamCount)
Write-Host ("New auto-blacklisted titles this run: {0}" -f $newAutoTitleKeys.Count)
Write-Host ("Owner lookups tried/succeeded: {0}/{1}" -f $detailLookupsTried, $detailLookupsSucceeded)

$stateOut = [PSCustomObject]@{
  lastRunUtc = (Get-Date).ToUniversalTime().ToString("o")
  maxPagesUsed = $MaxPages
  delayMsUsed = $DelayMs
  minIntervalMinutes = $MinIntervalMinutes
  count = $visibleScripts.Count
  filteredCount = ($filteredKeywordCount + $filteredUserCount + $filteredSpamCount)
}
$stateOut | ConvertTo-Json -Depth 4 | Set-Content -Path $statePath -Encoding utf8
