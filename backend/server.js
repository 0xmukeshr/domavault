// Backend API Server for Domain Collateral Analytics
// File: server.js

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting (configurable via env)
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute default
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10); // 30 req/min default
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS
});
app.use('/api/', limiter);

// Doma API Configuration
const DOMA_API_ENDPOINT = process.env.DOMA_API_ENDPOINT || 'https://api-testnet.doma.xyz/graphql';
const DOMA_API_KEY = process.env.DOMA_API_KEY;
const ETH_USD_PRICE = Number(process.env.ETH_USD_PRICE || 2800); // Should fetch from price API in production

// GraphQL Queries
const DOMAIN_QUERY = `
  query GetDomainData($name: String!) {
    name(name: $name) {
      name
      expiresAt
      tokenizedAt
      eoi
      claimedBy
      transferLock
      tokens {
        tokenId
        owner
        networkId
        createdAt
      }
      activities {
        type
        txHash
        sld
        tld
        createdAt
        ... on NameClaimedActivity {
          claimedBy
        }
        ... on NameRenewedActivity {
          expiresAt
        }
        ... on NameTokenizedActivity {
          networkId
        }
        ... on NameDetokenizedActivity {
          networkId
        }
      }
    }
  }
`;

const TOKEN_ACTIVITIES_QUERY = `
  query GetTokenActivities($tokenId: String!) {
    tokenActivities(tokenId: $tokenId, take: 100, sortOrder: DESC) {
      items {
        type
        txHash
        tokenId
        createdAt
        finalized
        ... on TokenTransferredActivity {
          transferredTo
          transferredFrom
        }
        ... on TokenListedActivity {
          orderId
          seller
          buyer
          payment {
            amount
            currency
          }
          startsAt
          expiresAt
        }
        ... on TokenOfferReceivedActivity {
          orderId
          buyer
          seller
          payment {
            amount
            currency
          }
          expiresAt
        }
        ... on TokenPurchasedActivity {
          orderId
          seller
          buyer
          payment {
            amount
            currency
          }
          purchasedAt
        }
        ... on TokenListingCancelledActivity {
          orderId
          reason
        }
        ... on TokenOfferCancelledActivity {
          orderId
          reason
        }
      }
      totalCount
    }
  }
`;

// Fetch data from Doma API
async function fetchDomaData(query, variables, apiKeyOverride) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if provided
    const key = apiKeyOverride || DOMA_API_KEY;
    if (key) {
      headers['Authorization'] = `Bearer ${key}`;
    }
    
    const response = await fetch(DOMA_API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error('Doma API Error:', error);
    throw error;
  }
}

// Scoring Functions
function scoreTokenActivities(activities) {
  const minted = activities.filter(a => a.type === 'MINTED').length;
  const transferred = activities.filter(a => a.type === 'TRANSFERRED').length;
  const listed = activities.filter(a => a.type === 'LISTED').length;
  const offers = activities.filter(a => a.type === 'OFFER_RECEIVED').length;
  const purchased = activities.filter(a => a.type === 'PURCHASED').length;
  const cancelledListings = activities.filter(a => a.type === 'LISTING_CANCELLED').length;
  const cancelledOffers = activities.filter(a => a.type === 'OFFER_CANCELLED').length;

  // Individual scores
  const scores = {
    minted: minted > 0 ? 100 : 0,
    transfer: transferred === 0 ? 50 : transferred <= 5 ? 85 : transferred <= 10 ? 75 : 65,
    listing: listed === 0 ? 60 : listed <= 3 ? 90 : listed <= 8 ? 85 : 95,
    offer: offers === 0 ? 60 : offers <= 3 ? 75 : offers <= 8 ? 85 : offers <= 15 ? 95 : 100,
    purchase: purchased === 0 ? 70 : purchased === 1 ? 80 : purchased <= 4 ? 90 : 95,
    cancelledListing: listed === 0 ? 100 : 100 - (cancelledListings / listed * 30),
    cancelledOffer: offers === 0 ? 100 : 100 - (cancelledOffers / offers * 30)
  };

  // Weighted average
  const score = Math.round(
    scores.minted * 0.1 + scores.transfer * 0.2 + scores.listing * 0.15 + 
    scores.offer * 0.2 + scores.purchase * 0.25 + scores.cancelledListing * 0.05 + 
    scores.cancelledOffer * 0.05
  );

  // Get last price
  const purchases = activities.filter(a => a.type === 'PURCHASED');
  const lastPrice = purchases.length > 0 ? purchases[0].payment?.amount : 'N/A';

  return {
    score,
    breakdown: {
      mintedActivity: { count: minted, score: scores.minted, weight: 10 },
      transferActivity: { count: transferred, score: scores.transfer, weight: 20 },
      listingActivity: { count: listed, score: scores.listing, weight: 15 },
      offerActivity: { count: offers, score: scores.offer, weight: 20 },
      purchaseActivity: { count: purchased, score: scores.purchase, weight: 25, lastPrice },
      cancelledListings: { count: cancelledListings, score: Math.round(scores.cancelledListing), weight: 5 },
      cancelledOffers: { count: cancelledOffers, score: Math.round(scores.cancelledOffer), weight: 5 }
    }
  };
}

function scoreNameActivities(activities) {
  const claimed = activities.filter(a => a.type === 'CLAIMED').length;
  const renewed = activities.filter(a => a.type === 'RENEWED').length;
  const tokenized = activities.filter(a => a.type === 'TOKENIZED').length;
  const detokenized = activities.filter(a => a.type === 'DETOKENIZED').length;

  const scores = {
    claimed: claimed > 0 ? 100 : 0,
    renewed: renewed === 0 ? 70 : renewed === 1 ? 85 : renewed >= 2 ? 95 : 100,
    tokenized: tokenized > 0 ? 100 : 0,
    detokenized: detokenized === 0 ? 100 : Math.max(0, 100 - (detokenized * 20))
  };

  const score = Math.round(
    scores.claimed * 0.3 + scores.renewed * 0.25 + 
    scores.tokenized * 0.25 + scores.detokenized * 0.2
  );

  return {
    score,
    breakdown: {
      claimedActivity: { count: claimed, score: scores.claimed, weight: 30 },
      renewedActivity: { count: renewed, score: scores.renewed, weight: 25 },
      tokenizedActivity: { count: tokenized, score: scores.tokenized, weight: 25 },
      detokenizedActivity: { count: detokenized, score: scores.detokenized, weight: 20 }
    }
  };
}

function calculateLiquidity(activities) {
  const purchases = activities.filter(a => a.type === 'PURCHASED');
  const offers = activities.filter(a => a.type === 'OFFER_RECEIVED');

  let totalVolume = 0;
  purchases.forEach(p => {
    if (p.payment?.amount) {
      totalVolume += parseFloat(p.payment.amount);
    }
  });

  const uniqueBuyers = new Set(purchases.map(p => p.buyer).filter(Boolean)).size;
  const uniqueSellers = new Set(purchases.map(p => p.seller).filter(Boolean)).size;

  let score = 60;
  if (purchases.length > 0) score += 15;
  if (uniqueBuyers > 2) score += 10;
  if (offers.length > 5) score += 10;

  return {
    score: Math.min(100, score),
    totalVolume: `${totalVolume.toFixed(4)} ETH`,
    uniqueBuyers,
    uniqueSellers
  };
}

function calculateOwnership(activities) {
  const transfers = activities.filter(a => a.type === 'TRANSFERRED');
  
  let score = 70;
  if (transfers.length <= 5) score += 15;
  if (transfers.length <= 3) score += 10;

  const frequency = transfers.length <= 3 ? 'Low' : transfers.length <= 8 ? 'Medium' : 'High';

  return {
    score: Math.min(100, score),
    transferFrequency: frequency,
    transferCount: transfers.length
  };
}

function assessDomainQuality(name) {
  const cleanName = name.split('.')[0];
  const length = cleanName.length;

  let lengthScore = 50;
  if (length <= 3) lengthScore = 100;
  else if (length <= 5) lengthScore = 95;
  else if (length <= 8) lengthScore = 85;
  else if (length <= 12) lengthScore = 75;
  else if (length <= 15) lengthScore = 65;

  const hasNumbers = /\d/.test(cleanName);
  const brandability = hasNumbers ? 70 : 85;
  const memorability = length <= 6 ? 90 : 75;

  const score = Math.round((lengthScore + brandability + memorability + 88) / 4);

  return {
    score,
    length,
    brandability,
    memorability
  };
}

function determineRiskTier(score) {
  if (score >= 800) {
    return {
      riskTier: 'Low Risk',
      maxLTV: 75,
      interestRate: 6.5,
      stakingAPY: 15
    };
  } else if (score >= 600) {
    return {
      riskTier: 'Medium Risk',
      maxLTV: 60,
      interestRate: 9.5,
      stakingAPY: 12
    };
  } else {
    return {
      riskTier: 'High Risk',
      maxLTV: 40,
      interestRate: 13.5,
      stakingAPY: 8
    };
  }
}

// Main Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { domainName } = req.body;

    if (!domainName) {
      return res.status(400).json({ error: 'Domain name is required' });
    }

    console.log(`Analyzing domain: ${domainName}`);

    // Extract optional API key from header or body
    const clientApiKey = req.headers['x-doma-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined) || req.body.apiKey;

    // Fetch domain data
    let nameData;
    try {
      nameData = await fetchDomaData(DOMAIN_QUERY, { name: domainName }, clientApiKey);
    } catch (error) {
      // Demo mode: If API key is missing or invalid, create mock data
      if (error.message.includes('API Key') || error.message.includes('401') || error.message.includes('400')) {
        console.log(`Demo mode: Creating mock data for ${domainName}`);
        nameData = {
          name: {
            name: domainName,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            tokenizedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            eoi: null,
            claimedBy: '0x1234567890abcdef1234567890abcdef12345678',
            transferLock: false,
            tokens: [{
              tokenId: '12345',
              owner: '0x1234567890abcdef1234567890abcdef12345678',
              networkId: 1,
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }],
            activities: [
              {
                type: 'CLAIMED',
                txHash: '0xabcd1234...',
                sld: domainName.split('.')[0],
                tld: domainName.split('.')[1] || 'eth',
                createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
                claimedBy: '0x1234567890abcdef1234567890abcdef12345678'
              },
              {
                type: 'TOKENIZED',
                txHash: '0xefgh5678...',
                sld: domainName.split('.')[0],
                tld: domainName.split('.')[1] || 'eth',
                createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                networkId: 1
              }
            ]
          }
        };
      } else {
        throw error;
      }
    }

    if (!nameData.name) {
      return res.status(404).json({ error: `Domain "${domainName}" not found in Doma registry` });
    }

    // Fetch token activities
    const tokenId = nameData.name.tokens?.[0]?.tokenId;
    let tokenActivities = [];

    if (tokenId) {
      try {
        const tokenData = await fetchDomaData(TOKEN_ACTIVITIES_QUERY, { tokenId }, clientApiKey);
        tokenActivities = tokenData.tokenActivities?.items || [];
      } catch (error) {
        // Demo mode: Create mock token activities
        if (error.message.includes('API Key') || error.message.includes('401') || error.message.includes('400')) {
          console.log(`Demo mode: Creating mock token activities for ${tokenId}`);
          tokenActivities = [
            {
              type: 'TRANSFERRED',
              txHash: '0x1111...',
              tokenId: tokenId,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              finalized: true,
              transferredTo: '0xabcd1234...',
              transferredFrom: '0x1234567890abcdef1234567890abcdef12345678'
            },
            {
              type: 'LISTED',
              txHash: '0x2222...',
              tokenId: tokenId,
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              finalized: true,
              orderId: 'order_123',
              seller: '0xabcd1234...',
              payment: {
                amount: '2.5',
                currency: 'ETH'
              },
              startsAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'OFFER_RECEIVED',
              txHash: '0x3333...',
              tokenId: tokenId,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              finalized: true,
              orderId: 'offer_456',
              buyer: '0xefgh5678...',
              seller: '0xabcd1234...',
              payment: {
                amount: '2.0',
                currency: 'ETH'
              },
              expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
        } else {
          throw error;
        }
      }
    }

    // Calculate scores
    const tokenScore = scoreTokenActivities(tokenActivities);
    const nameScore = scoreNameActivities(nameData.name.activities || []);
    const liquidityScore = calculateLiquidity(tokenActivities);
    const ownershipScore = calculateOwnership(tokenActivities);
    const domainQuality = assessDomainQuality(nameData.name.name);

    // Calculate overall score
    const overallScore = Math.round(
      (tokenScore.score * 0.25 +
       nameScore.score * 0.15 +
       liquidityScore.score * 0.15 +
       ownershipScore.score * 0.10 +
       domainQuality.score * 0.20 +
       75 * 0.10 +  // Market demand
       60 * 0.05)   // Web presence
    ) * 10;

    // Determine risk tier
    const riskInfo = determineRiskTier(overallScore);

    // Calculate collateral value
    const purchases = tokenActivities.filter(a => a.type === 'PURCHASED');
    let avgPrice = 0;
    if (purchases.length > 0) {
      const total = purchases.reduce((sum, p) => sum + parseFloat(p.payment?.amount || 0), 0);
      avgPrice = total / purchases.length;
    }

    const collateralValue = Math.round(
      avgPrice > 0 ? avgPrice * ETH_USD_PRICE : domainQuality.score * 50
    );
    const maxLoanAmount = Math.floor(collateralValue * (riskInfo.maxLTV / 100));

    // Build response
    const response = {
      success: true,
      domainName: nameData.name.name,
      overallScore,
      riskTier: riskInfo.riskTier,
      collateralValue,
      maxLTV: riskInfo.maxLTV,
      maxLoanAmount,
      stakingAPY: riskInfo.stakingAPY,
      onChainMetrics: {
        tokenActivity: tokenScore,
        nameActivity: nameScore,
        liquidityMetrics: liquidityScore,
        ownershipStability: ownershipScore
      },
      offChainMetrics: {
        domainQuality
      },
      recommendations: {
        loanTerms: {
          recommended: overallScore >= 600 ? 'Approved for lending' : 'Requires manual review',
          maxLoan: maxLoanAmount,
          ltv: riskInfo.maxLTV,
          interestRate: riskInfo.interestRate,
          collateralizationRatio: Math.round(10000 / riskInfo.maxLTV)
        },
        stakingTerms: {
          recommended: overallScore >= 500 ? 'Qualified for staking' : 'Not recommended',
          baseAPY: riskInfo.stakingAPY,
          bonusAPY: overallScore >= 800 ? 3 : overallScore >= 600 ? 2 : 1,
          lockPeriod: '30 days',
          earlyWithdrawalPenalty: 5
        },
        riskFactors: [
          {
            factor: `${tokenActivities.filter(a => a.type === 'TRANSFERRED').length} transfers detected`,
            impact: tokenActivities.filter(a => a.type === 'TRANSFERRED').length <= 5 ? 'Positive' : 'Negative',
            severity: 'low'
          },
          {
            factor: `${tokenActivities.filter(a => a.type === 'OFFER_RECEIVED').length} offers received`,
            impact: tokenActivities.filter(a => a.type === 'OFFER_RECEIVED').length > 5 ? 'Positive' : 'Negative',
            severity: 'medium'
          },
          {
            factor: `Domain length: ${domainQuality.length} characters`,
            impact: domainQuality.length <= 8 ? 'Positive' : 'Negative',
            severity: 'low'
          }
        ]
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        dataSource: 'Doma Subgraph',
        apiEndpoint: DOMA_API_ENDPOINT,
        tokenId: tokenId || null,
        totalTokenActivities: tokenActivities.length,
        totalNameActivities: nameData.name.activities?.length || 0
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze domain'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    domaEndpoint: DOMA_API_ENDPOINT
  });
});

// Get supported TLDs
app.get('/api/supported-tlds', (req, res) => {
  res.json({
    tlds: ['eth', 'crypto', 'blockchain', 'nft', 'dao', 'web3'],
    note: 'Availability depends on Doma registry'
  });
});

// Batch analysis endpoint
app.post('/api/analyze-batch', async (req, res) => {
  try {
    const { domains } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Array of domain names is required' });
    }

    if (domains.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 domains per batch' });
    }

    const clientApiKey = req.headers['x-doma-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined) || req.body.apiKey;

    const results = await Promise.allSettled(
      domains.map(async (domain) => {
        const response = await fetch(`http://localhost:${PORT}/api/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(clientApiKey ? { 'x-doma-api-key': clientApiKey } : {})
          },
          body: JSON.stringify({ domainName: domain })
        });
        return response.json();
      })
    );

    const formatted = results.map((result, idx) => ({
      domain: domains[idx],
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));

    res.json({
      success: true,
      total: domains.length,
      results: formatted
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze domains'
    });
  }
});

// Get activity history for a domain
app.get('/api/activities/:domainName', async (req, res) => {
  try {
    const { domainName } = req.params;

    // Fetch domain data
    const clientApiKey = req.headers['x-doma-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined);
    const nameData = await fetchDomaData(DOMAIN_QUERY, { name: domainName }, clientApiKey);

    if (!nameData.name) {
      return res.status(404).json({ error: `Domain "${domainName}" not found` });
    }

    // Fetch token activities
    const tokenId = nameData.name.tokens?.[0]?.tokenId;
    let tokenActivities = [];

    if (tokenId) {
      const tokenData = await fetchDomaData(TOKEN_ACTIVITIES_QUERY, { tokenId }, clientApiKey);
      tokenActivities = tokenData.tokenActivities?.items || [];
    }

    res.json({
      success: true,
      domain: domainName,
      nameActivities: nameData.name.activities || [],
      tokenActivities: tokenActivities,
      summary: {
        totalNameActivities: nameData.name.activities?.length || 0,
        totalTokenActivities: tokenActivities.length,
        tokenId: tokenId || null
      }
    });

  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch activities'
    });
  }
});

// Get quick score (simplified)
app.get('/api/quick-score/:domainName', async (req, res) => {
  try {
    const { domainName } = req.params;

    const clientApiKey = req.headers['x-doma-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined);
    const nameData = await fetchDomaData(DOMAIN_QUERY, { name: domainName }, clientApiKey);

    if (!nameData.name) {
      return res.status(404).json({ error: `Domain "${domainName}" not found` });
    }

    const domainQuality = assessDomainQuality(nameData.name.name);
    const nameScore = scoreNameActivities(nameData.name.activities || []);

    // Quick score calculation (without token activities)
    const quickScore = Math.round((nameScore.score * 0.4 + domainQuality.score * 0.6) * 10);

    res.json({
      success: true,
      domain: domainName,
      quickScore,
      estimatedTier: quickScore >= 800 ? 'Low Risk' : quickScore >= 600 ? 'Medium Risk' : 'High Risk',
      note: 'Quick score based on name activities and domain quality only'
    });

  } catch (error) {
    console.error('Quick score error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate quick score'
    });
  }
});

// Compare domains
app.post('/api/compare', async (req, res) => {
  try {
    const { domains } = req.body;

    if (!Array.isArray(domains) || domains.length < 2 || domains.length > 5) {
      return res.status(400).json({ error: 'Provide 2-5 domains to compare' });
    }

    const clientApiKey = req.headers['x-doma-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined) || req.body.apiKey;

    const analyses = await Promise.all(
      domains.map(async (domain) => {
        try {
          const response = await fetch(`http://localhost:${PORT}/api/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(clientApiKey ? { 'x-doma-api-key': clientApiKey } : {})
            },
            body: JSON.stringify({ domainName: domain })
          });
          return response.json();
        } catch (err) {
          return { success: false, error: err.message, domainName: domain };
        }
      })
    );

    const comparison = {
      domains: analyses.map(a => ({
        name: a.domainName,
        score: a.overallScore,
        riskTier: a.riskTier,
        collateralValue: a.collateralValue,
        maxLoan: a.maxLoanAmount
      })),
      bestDomain: analyses.reduce((best, curr) => 
        curr.overallScore > best.overallScore ? curr : best
      ).domainName,
      averageScore: Math.round(
        analyses.reduce((sum, a) => sum + (a.overallScore || 0), 0) / analyses.length
      )
    };

    res.json({
      success: true,
      comparison
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare domains'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Serve frontend static files
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Domain Collateral Analytics API Server                  ║
║   Status: RUNNING                                         ║
║   Port: ${PORT}                                          ║
║   Doma Endpoint: ${DOMA_API_ENDPOINT.substring(0, 40)}...║
╚═══════════════════════════════════════════════════════════╝

Available Endpoints:
  POST   /api/analyze              - Analyze single domain
  POST   /api/analyze-batch        - Analyze multiple domains
  GET    /api/activities/:domain   - Get domain activities
  GET    /api/quick-score/:domain  - Get quick score
  POST   /api/compare              - Compare domains
  GET    /api/health               - Health check
  GET    /api/supported-tlds       - List supported TLDs

Example:
  curl -X POST http://localhost:${PORT}/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"domainName": "example.eth"}'
  `);
});

module.exports = app;

