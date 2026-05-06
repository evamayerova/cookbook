$recipesPath = Join-Path -Path $PSScriptRoot -ChildPath "recipes"
$files = Get-ChildItem -Path $recipesPath -Filter *.json
$allRecipes = @()

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
    $allRecipes += $content
}

# Sort by id
$allRecipes = $allRecipes | Sort-Object id

# Format JSON manually or use ConvertTo-Json
$jsonString = ConvertTo-Json -InputObject $allRecipes -Depth 10

$jsContent = "// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.`n// Edit the individual .json files in the /recipes folder instead.`n`nwindow.recipesData = " + $jsonString + ";"

Set-Content -Path (Join-Path -Path $PSScriptRoot -ChildPath "recipes-data.js") -Value $jsContent -Encoding UTF8
Write-Host "Successfully built recipes-data.js with $($allRecipes.Count) recipes."
