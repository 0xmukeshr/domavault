#!/usr/bin/env node

/**
 * Domain Analytics API Test Script
 * Tests the API implementation with and without API keys
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_DOMAINS = ['crypto.eth', 'test.eth', 'vitalik.eth', 'web3.io'];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'blue');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'gray');
}

async function testHealthCheck() {
  logHeader('TEST 1: Health Check');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      logSuccess('Server is healthy');
      logInfo(`Timestamp: ${data.timestamp}`);
      logInfo(`Doma Endpoint: ${data.domaEndpoint}`);
      return true;
    } else {
      logError('Health check failed');
      return false;
    }
  } catch (error) {
    logError(`Health check error: ${error.message}`);
    return false;
  }
}

async function testSupportedTLDs() {
  logHeader('TEST 2: Supported TLDs');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/supported-tlds`);
    const data = await response.json();
    
    if (response.ok && data.tlds) {
      logSuccess(`Found ${data.tlds.length} supported TLDs`);
      logInfo(`TLDs: ${data.tlds.join(', ')}`);
      return true;
    } else {
      logError('Failed to fetch supported TLDs');
      return false;
    }
  } catch (error) {
    logError(`Supported TLDs error: ${error.message}`);
    return false;
  }
}

async function testDomainAnalysis(domain, apiKey = null) {
  logHeader(`TEST 3: Domain Analysis - ${domain}`);
  
  if (apiKey) {
    logInfo('Using API key for real data');
  } else {
    logWarning('No API key provided - will use mock data');
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['x-doma-api-key'] = apiKey;
    }
    
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ domainName: domain })
    });
    const duration = Date.now() - startTime;
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logSuccess(`Analysis completed in ${duration}ms`);
      
      // Display key metrics
      console.log('\n📊 Key Metrics:');
      logInfo(`  Domain: ${data.domainName}`);
      logInfo(`  Overall Score: ${data.overallScore}/1000`);
      logInfo(`  Risk Tier: ${data.riskTier}`);
      logInfo(`  Collateral Value: $${data.collateralValue.toLocaleString()}`);
      logInfo(`  Max LTV: ${data.maxLTV}%`);
      logInfo(`  Max Loan: $${data.maxLoanAmount.toLocaleString()}`);
      logInfo(`  Staking APY: ${data.stakingAPY}%`);
      
      // Display on-chain metrics
      console.log('\n⛓️  On-chain Metrics:');
      logInfo(`  Token Activity Score: ${data.onChainMetrics.tokenActivity.score}/100`);
      logInfo(`  Name Activity Score: ${data.onChainMetrics.nameActivity.score}/100`);
      logInfo(`  Liquidity Score: ${data.onChainMetrics.liquidityMetrics.score}/100`);
      logInfo(`  Ownership Stability: ${data.onChainMetrics.ownershipStability.score}/100`);
      
      // Display off-chain metrics
      console.log('\n🌐 Off-chain Metrics:');
      logInfo(`  Domain Quality Score: ${data.offChainMetrics.domainQuality.score}/100`);
      logInfo(`  Length: ${data.offChainMetrics.domainQuality.length} chars`);
      logInfo(`  Brandability: ${data.offChainMetrics.domainQuality.brandability}/100`);
      logInfo(`  Memorability: ${data.offChainMetrics.domainQuality.memorability}/100`);
      
      // Display recommendations
      console.log('\n💡 Recommendations:');
      logInfo(`  Loan Status: ${data.recommendations.loanTerms.recommended}`);
      logInfo(`  Interest Rate: ${data.recommendations.loanTerms.interestRate}%`);
      logInfo(`  Staking Status: ${data.recommendations.stakingTerms.recommended}`);
      
      // Check data source
      if (data.metadata) {
        console.log('\n📝 Metadata:');
        logInfo(`  Data Source: ${data.metadata.dataSource || 'N/A'}`);
        logInfo(`  Analyzed At: ${data.metadata.analyzedAt}`);
        if (data.metadata.tokenId) {
          logInfo(`  Token ID: ${data.metadata.tokenId}`);
        }
      }
      
      return { success: true, data };
    } else {
      logError(`Analysis failed: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    logError(`Analysis error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testBatchAnalysis(domains, apiKey = null) {
  logHeader('TEST 4: Batch Analysis');
  
  if (apiKey) {
    logInfo(`Using API key for ${domains.length} domains`);
  } else {
    logWarning('No API key - will use mock data');
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['x-doma-api-key'] = apiKey;
    }
    
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/analyze-batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ domains })
    });
    const duration = Date.now() - startTime;
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logSuccess(`Batch analysis completed in ${duration}ms`);
      logInfo(`Total domains: ${data.total}`);
      
      console.log('\n📊 Results:');
      data.results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.data.success) {
          logSuccess(`  ${result.domain}: Score ${result.data.overallScore} - ${result.data.riskTier}`);
        } else {
          logError(`  ${result.domain}: ${result.error || 'Failed'}`);
        }
      });
      
      return { success: true, data };
    } else {
      logError(`Batch analysis failed: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    logError(`Batch analysis error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testQuickScore(domain, apiKey = null) {
  logHeader(`TEST 5: Quick Score - ${domain}`);
  
  try {
    const headers = {};
    
    if (apiKey) {
      headers['x-doma-api-key'] = apiKey;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quick-score/${domain}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logSuccess('Quick score retrieved');
      logInfo(`  Quick Score: ${data.quickScore}/1000`);
      logInfo(`  Estimated Tier: ${data.estimatedTier}`);
      return { success: true, data };
    } else {
      logError(`Quick score failed: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    logError(`Quick score error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testCompareDomains(domains, apiKey = null) {
  logHeader('TEST 6: Compare Domains');
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['x-doma-api-key'] = apiKey;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/compare`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ domains })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logSuccess('Comparison completed');
      
      console.log('\n📊 Comparison Results:');
      data.comparison.domains.forEach((domain, index) => {
        logInfo(`  ${index + 1}. ${domain.name}: ${domain.score}/1000 (${domain.riskTier})`);
        logInfo(`     Collateral: $${domain.collateralValue.toLocaleString()}, Max Loan: $${domain.maxLoan.toLocaleString()}`);
      });
      
      console.log('');
      logSuccess(`Best Domain: ${data.comparison.bestDomain}`);
      logInfo(`Average Score: ${data.comparison.averageScore}`);
      
      return { success: true, data };
    } else {
      logError(`Comparison failed: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    logError(`Comparison error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  const apiKey = process.env.DOMA_API_KEY || null;
  
  logHeader('DOMAYIELD - AI DOMAIN ANALYTICS API TEST SUITE');
  log(`API Base URL: ${API_BASE_URL}`, 'blue');
  
  if (apiKey) {
    log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`, 'blue');
  } else {
    logWarning('No API key detected - tests will use mock data');
    logInfo('Set DOMA_API_KEY environment variable to test with real data');
  }
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test 1: Health Check
  results.total++;
  const test1 = await testHealthCheck();
  if (test1) results.passed++; else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 2: Supported TLDs
  results.total++;
  const test2 = await testSupportedTLDs();
  if (test2) results.passed++; else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 3: Domain Analysis (single)
  results.total++;
  const test3 = await testDomainAnalysis('crypto.eth', apiKey);
  if (test3.success) results.passed++; else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Batch Analysis
  results.total++;
  const test4 = await testBatchAnalysis(['test.eth', 'web3.io'], apiKey);
  if (test4.success) results.passed++; else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 5: Quick Score
  results.total++;
  const test5 = await testQuickScore('vitalik.eth', apiKey);
  if (test5.success) results.passed++; else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 6: Compare Domains
  results.total++;
  const test6 = await testCompareDomains(['crypto.eth', 'defi.com', 'web3.io'], apiKey);
  if (test6.success) results.passed++; else results.failed++;
  
  // Summary
  logHeader('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  
  const passRate = Math.round((results.passed / results.total) * 100);
  console.log('');
  if (passRate === 100) {
    logSuccess(`🎉 ALL TESTS PASSED! (${passRate}%)`);
  } else if (passRate >= 80) {
    logWarning(`⚠️  MOST TESTS PASSED (${passRate}%)`);
  } else {
    logError(`❌ TESTS FAILED (${passRate}%)`);
  }
  
  console.log('\n');
  return results;
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.clear();
  
  // Check if server is running
  logInfo('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    logError(`\nServer is not running at ${API_BASE_URL}`);
    logInfo('\nTo start the server:');
    logInfo('  1. cd /home/toji/doma/project/backend');
    logInfo('  2. npm install');
    logInfo('  3. npm start');
    logInfo('\nOr with custom port:');
    logInfo('  PORT=3000 npm start\n');
    process.exit(1);
  }
  
  logSuccess('Server is running!\n');
  
  // Run all tests
  const results = await runAllTests();
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
})();
