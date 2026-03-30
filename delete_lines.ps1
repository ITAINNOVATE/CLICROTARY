$lines = Get-Content "assets/js/script.js"
$filteredList = New-Object System.Collections.Generic.List[string]

for ($i=0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    if (($lineNum -ge 51 -and $lineNum -le 628) -or 
        ($lineNum -ge 896 -and $lineNum -le 967) -or 
        ($lineNum -ge 1089 -and $lineNum -le 1278)) {
        continue
    }
    $filteredList.Add($lines[$i])
}

Set-Content "assets/js/script.js" $filteredList -Encoding utf8
