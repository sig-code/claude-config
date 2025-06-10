#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: /pr-review <PR番号>');
    return;
  }

  const prNumber = args[0];
  
  try {
    console.log(`🔍 PR #${prNumber} の情報を取得中...`);
    
    // PR情報を取得
    const prInfo = execSync(`gh pr view ${prNumber} --json files`, { encoding: 'utf8' });
    const prData = JSON.parse(prInfo);
    
    // テンプレートを読み込み
    const templatePath = path.join(__dirname, '../templates/pr-review-template.md');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // ファイルリストを生成
    const filesList = prData.files.map(file => `- ${file.path}`).join('\n');
    
    // テンプレートの置換
    const review = template.replace(/\{\{FILES_LIST\}\}/g, filesList);
    
    // クリップボードにコピー
    execSync(`echo "${review}" | pbcopy`);
    console.log('✅ PRレビューをクリップボードにコピーしました');
    
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}