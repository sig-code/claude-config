#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * PRディスクリプション生成コマンド
 * 使用法: /pr-desc <PR番号> [--minimal|--standard]
 */

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ エラー: PR番号を指定してください');
    console.error('使用法: /pr-desc <PR番号> [--minimal|--standard]');
    process.exit(1);
  }

  const prNumber = args[0];
  const forceMode = args.find(arg => arg === '--minimal' || arg === '--standard');
  
  try {
    console.log(`🔍 PR #${prNumber} の情報を取得中...`);
    
    // Step 1: PR基本情報の取得
    const prInfo = getPRInfo(prNumber);
    const prDiff = getPRDiff(prNumber);
    const changedFiles = getChangedFiles(prNumber);
    
    // Step 2: 変更規模の判定
    const analysisResult = analyzeChanges(prInfo, changedFiles, prDiff, forceMode);
    
    // Step 3: 適切なテンプレートでディスクリプション生成
    const description = generateDescription(analysisResult, prInfo, prDiff, changedFiles);
    
    // 結果を出力
    console.log('\n' + '='.repeat(80));
    console.log('📝 生成されたPRディスクリプション');
    console.log('='.repeat(80));
    console.log(description);
    console.log('='.repeat(80));
    
  } catch (error) {
    handleError(error, prNumber);
  }
}

function getPRInfo(prNumber) {
  try {
    const result = execSync(
      `gh pr view ${prNumber} --json title,body,additions,deletions,changedFiles,commits,author,labels,headRefName`,
      { encoding: 'utf8', timeout: 30000 }
    );
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`PR情報の取得に失敗: ${error.message}`);
  }
}

function getPRDiff(prNumber) {
  try {
    return execSync(`gh pr diff ${prNumber}`, { 
      encoding: 'utf8', 
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10 // 10MB
    });
  } catch (error) {
    console.warn('⚠️ PR差分の取得に失敗しました。基本情報のみで生成します。');
    return '';
  }
}

function getChangedFiles(prNumber) {
  try {
    const result = execSync(
      `gh pr view ${prNumber} --json files --jq '.files[].path'`,
      { encoding: 'utf8', timeout: 30000 }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.warn('⚠️ 変更ファイル一覧の取得に失敗しました。');
    return [];
  }
}

function analyzeChanges(prInfo, changedFiles, prDiff, forceMode = null) {
  const title = prInfo.title?.toLowerCase() || '';
  const body = prInfo.body?.toLowerCase() || '';
  const labels = prInfo.labels?.map(l => l.name.toLowerCase()) || [];
  const branchName = prInfo.headRefName?.toLowerCase() || '';
  const fileCount = prInfo.changedFiles || changedFiles.length;
  const totalChanges = (prInfo.additions || 0) + (prInfo.deletions || 0);
  
  // 強制モードの確認
  if (forceMode) {
    if (forceMode === '--minimal') {
      scale = 'minimal';
    } else if (forceMode === '--standard') {
      scale = 'standard';
    }
  } else {
    // 基本規模判定
    if (fileCount <= 3 || totalChanges <= 50) {
      scale = 'minimal';
    } else {
      scale = 'standard'; // fullは削除してstandardに統一
    }
  }
  
  // 特別ルール適用
  let changeType = 'その他';
  let isUrgent = false;
  let scaleAdjustment = 0;
  
  // バグ修正・ホットフィックス判定
  const bugKeywords = ['fix', 'bug', 'hotfix', 'patch', '修正', 'バグ'];
  const hasBugKeywords = bugKeywords.some(keyword => 
    title.includes(keyword) || branchName.includes(keyword)
  );
  const hasBugLabels = labels.some(label => ['bug', 'hotfix'].includes(label));
  
  if (hasBugKeywords || hasBugLabels) {
    changeType = 'バグ修正';
    scale = 'minimal'; // 強制的にミニマム版
  }
  
  // 新機能・破壊的変更判定
  const featureKeywords = ['feat', 'feature', 'add', 'breaking', '機能', '追加'];
  const hasFeatureKeywords = featureKeywords.some(keyword => 
    title.includes(keyword) || branchName.includes(keyword)
  );
  const hasFeatureLabels = labels.some(label => 
    ['enhancement', 'feature', 'breaking-change'].includes(label)
  );
  const hasBreakingChange = prDiff.includes('BREAKING CHANGE');
  
  if (hasFeatureKeywords || hasFeatureLabels || hasBreakingChange) {
    changeType = hasBreakingChange ? '破壊的変更' : '新機能';
    scaleAdjustment = 1; // 1段階上げる
  }
  
  // 緊急修正判定
  const urgentKeywords = ['urgent', 'critical', 'emergency', '緊急', '重要'];
  const hasUrgentKeywords = urgentKeywords.some(keyword => 
    title.includes(keyword) || branchName.includes(keyword)
  );
  const hasUrgentLabels = labels.some(label => ['critical', 'urgent'].includes(label));
  
  if (hasUrgentKeywords || hasUrgentLabels) {
    isUrgent = true;
  }
  
  // ファイル種別による調整
  const isDocsOnly = changedFiles.every(file => 
    file.endsWith('.md') || file.startsWith('docs/')
  );
  const isTestOnly = changedFiles.every(file => 
    file.includes('.test.') || file.includes('_test.') || file.startsWith('test/')
  );
  const hasConfigFiles = changedFiles.some(file => 
    file === 'package.json' || file.includes('.config.')
  );
  
  if (isDocsOnly || isTestOnly) {
    scale = 'minimal';
  } else if (hasConfigFiles && scale === 'minimal') {
    scale = 'standard';
  }
  
  // スケール調整を適用（standardまでに制限）
  if (!forceMode && scaleAdjustment > 0 && !hasBugKeywords && !hasBugLabels) {
    if (scale === 'minimal') scale = 'standard';
  }
  
  // チケット番号の抽出
  const ticketMatch = (title + ' ' + branchName + ' ' + body).match(/FON-(\d+)/i);
  const ticketNumber = ticketMatch ? ticketMatch[0] : null;
  
  return {
    scale,
    changeType,
    isUrgent,
    ticketNumber,
    fileCount,
    totalChanges,
    additions: prInfo.additions || 0,
    deletions: prInfo.deletions || 0,
    isDocsOnly,
    isTestOnly,
    hasConfigFiles
  };
}

function generateDescription(analysis, prInfo, prDiff, changedFiles) {
  const { scale, changeType, isUrgent, ticketNumber, fileCount, totalChanges, additions, deletions } = analysis;
  
  // ヘッダー情報
  let header = `🔍 変更規模: ${getScaleLabel(scale)}\n`;
  header += `📊 統計: ${fileCount} files changed, +${additions} -${deletions} lines\n`;
  header += `🏷️ 種別: ${changeType}\n\n`;
  
  // テンプレート選択と生成
  let template;
  switch (scale) {
    case 'minimal':
      template = generateFromTemplate('pr-desc-minimal.md', analysis, prInfo, changedFiles);
      break;
    case 'standard':
      template = generateFromTemplate('pr-desc-standard.md', analysis, prInfo, changedFiles, prDiff);
      break;
    default:
      template = generateFromTemplate('pr-desc-standard.md', analysis, prInfo, changedFiles, prDiff);
      break;
  }
  
  return header + template;
}

function getScaleLabel(scale) {
  const labels = {
    'minimal': 'ミニマム',
    'standard': 'スタンダード'
  };
  return labels[scale] || scale;
}

function generateFromTemplate(templateName, analysis, prInfo, changedFiles, prDiff = '') {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  
  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // テンプレート変数の準備
    const variables = prepareTemplateVariables(analysis, prInfo, changedFiles, prDiff);
    
    // シンプルなテンプレート置換
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key] || '');
    });
    
    // 条件付きブロックの処理
    template = processConditionalBlocks(template, variables);
    
    return template;
  } catch (error) {
    console.warn(`⚠️ テンプレート読み込みエラー: ${error.message}`);
    return generateFallbackTemplate(analysis, prInfo, changedFiles);
  }
}

function prepareTemplateVariables(analysis, prInfo, changedFiles, prDiff) {
  const { scale, changeType, isUrgent, ticketNumber, fileCount, totalChanges } = analysis;
  const summary = `${isUrgent ? '🚨 緊急修正: ' : ''}${generateSummary(prInfo.title, changeType)}`;
  
  return {
    summary,
    ticketNumber,
    changesSummary: generateChangesSummary(changedFiles),
    verificationSteps: generateVerificationSteps(changeType, scale),
    background: generateBackground(changeType),
    reviewPoints: generateReviewPoints(changedFiles),
    cautions: generateCautions(analysis, changeType),
    fileCount,
    totalChanges,
    hasCautions: analysis.hasConfigFiles || changeType === '破壊的変更' || analysis.isUrgent
  };
}

function processConditionalBlocks(template, variables) {
  // {{#condition}}...{{/condition}} の処理
  const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/(\w+)}}/g;
  
  return template.replace(conditionalRegex, (match, startTag, content, endTag) => {
    if (startTag !== endTag) return match; // タグが一致しない場合はそのまま
    
    const condition = variables[startTag];
    return condition ? content : '';
  });
}

function generateFallbackTemplate(analysis, prInfo, changedFiles) {
  const { changeType, isUrgent, ticketNumber, fileCount, totalChanges } = analysis;
  
  let content = '## 📋 概要\n';
  content += `${isUrgent ? '🚨 緊急修正: ' : ''}${generateSummary(prInfo.title, changeType)}\n\n`;
  
  if (ticketNumber) {
    content += `**関連**: closes ${ticketNumber}\n\n`;
  }
  
  content += '## 🎯 変更内容\n';
  content += generateChangesSummary(prInfo, changedFiles, 'minimal') + '\n\n';
  
  content += '---\n';
  content += `🤖 Generated with Claude Code | Files: ${fileCount} | Lines: ±${totalChanges}`;
  
  return content;
}



// ヘルパー関数群
function generateSummary(title, changeType) {
  if (!title) return `${changeType}を実施`;
  return title;
}

function generateBackground(prInfo, changeType) {
  const typeDescriptions = {
    'バグ修正': '報告されたバグまたは不具合の修正が必要でした。',
    '新機能': '新しい機能の追加要求がありました。',
    '破壊的変更': 'システムの重要な変更が必要になりました。',
    'その他': '以下の理由により変更が必要でした。'
  };
  
  return typeDescriptions[changeType] || typeDescriptions['その他'];
}


function generateChangesSummary(prInfo, changedFiles, scale) {
  const fileTypes = categorizeFiles(changedFiles);
  let changes = [];
  
  if (fileTypes.api.length > 0) {
    changes.push(`- API関連: ${fileTypes.api.length}ファイル`);
  }
  if (fileTypes.frontend.length > 0) {
    changes.push(`- フロントエンド: ${fileTypes.frontend.length}ファイル`);
  }
  if (fileTypes.database.length > 0) {
    changes.push(`- データベース: ${fileTypes.database.length}ファイル`);
  }
  if (fileTypes.config.length > 0) {
    changes.push(`- 設定ファイル: ${fileTypes.config.length}ファイル`);
  }
  if (fileTypes.test.length > 0) {
    changes.push(`- テスト: ${fileTypes.test.length}ファイル`);
  }
  if (fileTypes.docs.length > 0) {
    changes.push(`- ドキュメント: ${fileTypes.docs.length}ファイル`);
  }
  
  if (changes.length === 0) {
    changes.push('- その他のファイル変更');
  }
  
  return changes.join('\n');
}


function generateVerificationSteps(changeType, scale) {
  const steps = {
    'バグ修正': [
      '1. 修正前の不具合状況を確認',
      '2. 修正後の動作が正常であることを確認',
      '3. 関連機能に影響がないことを確認'
    ],
    '新機能': [
      '1. 新機能が仕様通り動作することを確認',
      '2. 既存機能に影響がないことを確認',
      '3. エラーハンドリングが適切であることを確認'
    ],
    '破壊的変更': [
      '1. 変更前後の動作を比較確認',
      '2. 影響範囲を徹底的に確認',
      '3. マイグレーション手順を確認'
    ]
  };
  
  const defaultSteps = [
    '1. 変更内容を確認',
    '2. 動作確認を実施',
    '3. エラーが発生しないことを確認'
  ];
  
  let selectedSteps = steps[changeType] || defaultSteps;
  
  if (scale === 'minimal') {
    selectedSteps = selectedSteps.slice(0, 1);
  } else if (scale === 'standard') {
    selectedSteps = selectedSteps.slice(0, 2);
  }
  
  return selectedSteps.join('\n');
}

function generateReviewPoints(changedFiles, changeType) {
  const points = [];
  const fileTypes = categorizeFiles(changedFiles);
  
  if (fileTypes.api.length > 0) {
    points.push('- [ ] APIエンドポイントの実装が適切か');
    points.push('- [ ] エラーハンドリングが適切か');
  }
  
  if (fileTypes.frontend.length > 0) {
    points.push('- [ ] UI/UXが仕様通りか');
    points.push('- [ ] レスポンシブ対応が適切か');
  }
  
  if (fileTypes.database.length > 0) {
    points.push('- [ ] マイグレーションが安全に実行できるか');
    points.push('- [ ] インデックスの設定が適切か');
  }
  
  if (fileTypes.test.length > 0) {
    points.push('- [ ] テストケースが適切か');
    points.push('- [ ] テストが正常に通るか');
  }
  
  if (points.length === 0) {
    points.push('- [ ] 変更内容が要件を満たしているか');
    points.push('- [ ] コード品質が保たれているか');
  }
  
  return points.join('\n');
}


function generateCautions(analysis, changeType) {
  const cautions = [];
  
  if (analysis.hasConfigFiles) {
    cautions.push('設定ファイルの変更があるため、環境変数や設定の更新が必要な場合があります。');
  }
  
  if (changeType === '破壊的変更') {
    cautions.push('破壊的変更のため、デプロイ前に関連システムの影響確認が必要です。');
  }
  
  if (analysis.isUrgent) {
    cautions.push('緊急修正のため、デプロイ後の動作確認を重点的に実施してください。');
  }
  
  return cautions.join('\n');
}


function categorizeFiles(files) {
  return {
    api: files.filter(f => f.includes('controller') || f.includes('service') || f.includes('src/')),
    frontend: files.filter(f => f.includes('.vue') || f.includes('.tsx') || f.includes('components/')),
    database: files.filter(f => f.includes('migration') || f.includes('entity')),
    config: files.filter(f => f.includes('package.json') || f.includes('.config') || f.includes('.yml')),
    test: files.filter(f => f.includes('test') || f.includes('spec') || f.includes('.test.')),
    docs: files.filter(f => f.includes('.md') || f.includes('docs/'))
  };
}

function handleError(error, prNumber) {
  if (error.message.includes('could not find pull request')) {
    console.error(`❌ エラー: PR #${prNumber} が見つかりません\n`);
    console.error('以下を確認してください：');
    console.error('- PR番号が正確か');
    console.error('- 対象リポジトリにアクセス権限があるか'); 
    console.error('- GitHub CLI (gh) が正しく設定されているか');
  } else if (error.message.includes('API rate limit')) {
    console.error('⚠️ 警告: GitHub API制限により一部情報を取得できませんでした\n');
    console.error('基本的なディスクリプションを生成します。');
    console.error('詳細な分析が必要な場合は、しばらく待ってから再実行してください。');
  } else {
    console.error(`❌ エラー: ${error.message}`);
  }
  
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { main, analyzeChanges, generateDescription };