$js = (Invoke-WebRequest -Uri "https://eventdhara.in/assets/index-CbPChr96.js" -UseBasicParsing).Content
$pattern = '(?<=["\`])([^"\`]*\.(?:webp|png|jpg|jpeg))(?=["\`])'
$found = [regex]::Matches($js, $pattern)
$urls = $found | ForEach-Object { $_.Value } | Where-Object { $_ -match "^/assets/" } | Sort-Object -Unique
$urls | ForEach-Object { "https://eventdhara.in$_" }
