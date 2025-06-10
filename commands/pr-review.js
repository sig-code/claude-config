#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function showHelp() {
  console.log(`
Usage: /pr-review <PR番号>

指定されたプルリクエストの内容をレビューします。

Options:
  PR番号    レビューするプルリクエストの番号（例: 6276）
  
Examples:
  /pr-review 6276    # PR #6276をレビュー
`);
}

function getPRInfo(prNumber) {
  try {
    // GitHub CLIを使用してPR情報を取得
    const prInfo = execSync(`gh pr view ${prNumber} --json title,body,headRefName,baseRefName,files,additions,deletions`, { encoding: 'utf8' });
    const prData = JSON.parse(prInfo);
    
    // PR の差分を取得
    const diffContent = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf8' });
    
    return {
      ...prData,
      diffContent
    };
  } catch (error) {
    throw new Error(`PR #${prNumber}の情報取得に失敗しました: ${error.message}`);
  }
}

function analyzeChanges(prData) {
  const { files, additions, deletions, diffContent } = prData;
  
  const fileNames = files.map(file => file.path);
  
  const hasTests = fileNames.some(file => 
    file.includes('test') || 
    file.includes('spec') || 
    file.endsWith('.test.js') || 
    file.endsWith('.spec.js') ||
    file.endsWith('.test.ts') || 
    file.endsWith('.spec.ts')
  );

  const hasTypeScript = fileNames.some(file => file.endsWith('.ts') || file.endsWith('.tsx'));
  const hasJavaScript = fileNames.some(file => file.endsWith('.js') || file.endsWith('.jsx'));
  const hasVue = fileNames.some(file => file.endsWith('.vue'));

  return {
    filesChanged: files.length,
    addedLines: additions,
    removedLines: deletions,
    hasTests,
    hasTypeScript,
    hasJavaScript,
    hasVue,
    files: fileNames
  };
}

function generateReview(prData, analysis) {
  const templatePath = path.join(__dirname, '../templates/pr-review-template.md');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`テンプレートファイルが見つかりません: ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  
  // 技術スタックを判定
  let techStack = [];
  if (analysis.hasTypeScript) techStack.push('TypeScript');
  if (analysis.hasJavaScript) techStack.push('JavaScript');
  if (analysis.hasVue) techStack.push('Vue.js');
  
  const replacements = {
    '{{PR_TITLE}}': prData.title,
    '{{HEAD_BRANCH}}': prData.headRefName,
    '{{BASE_BRANCH}}': prData.baseRefName,
    '{{FILES_CHANGED}}': analysis.filesChanged,
    '{{ADDED_LINES}}': analysis.addedLines,
    '{{REMOVED_LINES}}': analysis.removedLines,
    '{{HAS_TESTS}}': analysis.hasTests ? '✅' : '❌',
    '{{TECH_STACK}}': techStack.join(', ') || 'その他',
    '{{FILES_LIST}}': analysis.files.map(file => `- ${file}`).join('\n')
  };

  let review = template;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    review = review.replace(new RegExp(placeholder, 'g'), value);
  });

  return review;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    return;
  }

  try {
    const prNumber = args[0];
    if (!/^\d+$/.test(prNumber)) {
      throw new Error('PR番号は数字で指定してください');
    }
    
    console.log(`🔍 PR #${prNumber}を分析中...`);
    
    const prData = getPRInfo(prNumber);
    const analysis = analyzeChanges(prData);
    const review = generateReview(prData, analysis);
    
    console.log('\n' + '='.repeat(60));
    console.log(review);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getPRInfo, analyzeChanges, generateReview };