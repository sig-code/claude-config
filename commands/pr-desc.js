#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: /pr-desc <PR番号>');
    return;
  }

  const prNumber = args[0];
  
  try {
    console.log(`🔍 PR #${prNumber} の情報を取得中...`);
    
    // PR情報を取得
    const prInfo = execSync(`gh pr view ${prNumber} --json title`, { encoding: 'utf8' });
    const prData = JSON.parse(prInfo);
    
    // テンプレートを読み込み
    const templatePath = path.join(__dirname, '../templates/pr-description.md');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // テンプレートの置換
    let description = template
      .replace(/\{\{summary\}\}/g, prData.title || '')
      .replace(/\{\{ticketNumber\}\}/g, '[チケット番号]')
      .replace(/\{\{background\}\}/g, '[背景・理由を記載]')
      .replace(/\{\{changesSummary\}\}/g, '[具体的な変更内容を記載]')
      .replace(/\{\{verificationSteps\}\}/g, '[動作確認手順を記載]')
      .replace(/\{\{reviewPoints\}\}/g, '[レビューポイントを記載]')
      .replace(/\{\{#hasCautions\}\}/g, '')
      .replace(/\{\{\/hasCautions\}\}/g, '')
      .replace(/\{\{cautions\}\}/g, '[注意事項がある場合は記載]');
    
    // クリップボードにコピー
    execSync(`echo "${description}" | pbcopy`);
    console.log('✅ PRディスクリプションをクリップボードにコピーしました');
    
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}