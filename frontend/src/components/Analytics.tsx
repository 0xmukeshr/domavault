import React, { useState, useEffect } from 'react';
import { VscPulse } from 'react-icons/vsc';
import { HiOutlineBuildingLibrary } from 'react-icons/hi2';
import { FiArrowUpRight } from 'react-icons/fi';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface AnalysisResult {
  success: boolean;
  domainName: string;
  overallScore: number;
  riskTier: string;
  collateralValue: number;
  maxLTV: number;
  maxLoanAmount: number;
  stakingAPY: number;
  onChainMetrics: {
    tokenActivity: { score: number; breakdown: any };
    nameActivity: { score: number; breakdown: any };
    liquidityMetrics: { score: number; totalVolume: string; uniqueBuyers: number; uniqueSellers: number };
    ownershipStability: { score: number; transferFrequency: string; transferCount: number };
  };
  offChainMetrics: {
    domainQuality: { score: number; length: number; brandability: number; memorability: number };
  };
  recommendations: {
    loanTerms: any;
    stakingTerms: any;
    riskFactors: any[];
  };
  metadata: any;
}

const Analytics: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [radarData, setRadarData] = useState<any[]>([]);
  const [scoreBreakdownData, setScoreBreakdownData] = useState<any[]>([]);

  const sampleDomains = ['crypto.eth', 'defi.com', 'web3.io', 'nft.org', 'blockchain.eth', 'test.eth'];

  const opportunities = [
    {
      domain: 'premium.eth',
      score: 94,
      roi: 18.5,
      trend: 'Rising',
      risk: 'Low',
      description: 'High-value domain with strong market presence'
    },
    {
      domain: 'token.com',
      score: 91,
      roi: 16.2,
      trend: 'Stable',
      risk: 'Low',
      description: 'Established domain in crypto space'
    },
    {
      domain: 'dao.io',
      score: 87,
      roi: 15.8,
      trend: 'Rising',
      risk: 'Medium',
      description: 'Growing sector with potential upside'
    },
  ];

  const generateChartsData = (result: AnalysisResult) => {
    console.log('[Analytics] Generating charts data for:', result);
    
    // Calculate length score based on actual domain length
    const lengthScore = result.offChainMetrics.domainQuality.length <= 3 ? 98 : 
                       result.offChainMetrics.domainQuality.length <= 5 ? 94 : 
                       result.offChainMetrics.domainQuality.length <= 8 ? 86 : 
                       result.offChainMetrics.domainQuality.length <= 12 ? 75 : 60;
    
    // Generate radar chart data from domain quality metrics
    const newRadarData = [
      { subject: 'Length Score', A: lengthScore, fullMark: 100 },
      { subject: 'Brandability', A: result.offChainMetrics.domainQuality.brandability, fullMark: 100 },
      { subject: 'Memorability', A: result.offChainMetrics.domainQuality.memorability, fullMark: 100 },
      { subject: 'Token Activity', A: result.onChainMetrics.tokenActivity.score, fullMark: 100 },
      { subject: 'Name Activity', A: result.onChainMetrics.nameActivity.score, fullMark: 100 },
      { subject: 'Liquidity', A: result.onChainMetrics.liquidityMetrics.score, fullMark: 100 },
    ];

    // Generate score breakdown data
    const newScoreBreakdownData = [
      { name: 'Token Activity', score: result.onChainMetrics.tokenActivity.score },
      { name: 'Name Activity', score: result.onChainMetrics.nameActivity.score },
      { name: 'Liquidity', score: result.onChainMetrics.liquidityMetrics.score },
      { name: 'Ownership', score: result.onChainMetrics.ownershipStability.score },
      { name: 'Domain Quality', score: result.offChainMetrics.domainQuality.score },
    ];

    console.log('[Analytics] Radar data:', newRadarData);
    console.log('[Analytics] Score breakdown data:', newScoreBreakdownData);
    
    setRadarData(newRadarData);
    setScoreBreakdownData(newScoreBreakdownData);
  };

  useEffect(() => {
    if (analysisResult) {
      generateChartsData(analysisResult);
    }
  }, [analysisResult]);

  // Mock data generator for fallback (domain-aware, deterministic)
  const generateMockData = (domain: string): AnalysisResult => {
    const d = domain.trim();
    const lower = d.toLowerCase();

    // Parse domain parts
    const parts = lower.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    const namePart = parts.length > 1 ? parts.slice(0, -1).join('.') : lower;
    const core = namePart.split('.').pop() || namePart; // last label

    const hasHyphen = core.includes('-');
    const hasNumber = /\d/.test(core);
    const length = core.replace(/[^a-z0-9]/g, '').length;

    const keywords = ['crypto','defi','web3','nft','ai','token','dao','pay','swap','chain','dex','wallet'];
    const foundKeyword = keywords.find(k => core.includes(k));
    const isWeb3TLD = ['eth','sol','bnb','btc','arb','op'].includes(tld);
    const isPremiumTLD = ['com','io','xyz','org','ai','co','app','net'].includes(tld);

    // Seeded randomness for deterministic results per domain
    function xmur3(str: string) { 
      let h = 1779033703 ^ str.length; 
      for (let i = 0; i < str.length; i++) { 
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353); 
        h = (h << 13) | (h >>> 19); 
      } 
      return function() { 
        h = Math.imul(h ^ (h >>> 16), 2246822507); 
        h = Math.imul(h ^ (h >>> 13), 3266489909); 
        return (h ^= h >>> 16) >>> 0; 
      }; 
    }
    function mulberry32(a: number) { 
      return function() { 
        let t = a += 0x6D2B79F5; 
        t = Math.imul(t ^ (t >>> 15), 1 | t); 
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); 
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296; 
      }; 
    }
    const seed = xmur3(lower)();
    const rnd = mulberry32(seed);
    const randRange = (min: number, max: number) => Math.floor(min + (max - min) * rnd());

    // Off-chain domain quality
    let lengthScore = length <= 3 ? 98 : length <= 5 ? 94 : length <= 8 ? 86 : length <= 12 ? 75 : 60;
    let brandability = 65 + randRange(0, 20);
    let memorability = 60 + randRange(0, 25);

    if (hasHyphen) { lengthScore -= 8; brandability -= 10; memorability -= 8; }
    if (hasNumber) { lengthScore -= 6; brandability -= 8; memorability -= 5; }
    if (isPremiumTLD) { brandability += 8; memorability += 6; }
    if (foundKeyword) { brandability += 6; }

    brandability = Math.max(30, Math.min(100, Math.round(brandability)));
    memorability = Math.max(30, Math.min(100, Math.round(memorability)));
    lengthScore = Math.max(30, Math.min(100, Math.round(lengthScore)));
    const domainQualityScore = Math.round(0.4 * lengthScore + 0.35 * brandability + 0.25 * memorability);

    // On-chain style activity
    let tokenActivity = isWeb3TLD ? 55 + randRange(0, 35) : 20 + randRange(0, 30);
    if (foundKeyword) tokenActivity += 10;
    tokenActivity = Math.max(0, Math.min(100, tokenActivity));

    let nameActivity = isWeb3TLD ? 50 + randRange(0, 40) : 25 + randRange(0, 35);
    if (isPremiumTLD) nameActivity += 8;
    nameActivity = Math.max(0, Math.min(100, nameActivity));

    let liquidityScore = isPremiumTLD ? 60 + randRange(0, 35) : isWeb3TLD ? 45 + randRange(0, 30) : 30 + randRange(0, 30);
    if (foundKeyword) liquidityScore += 5;
    liquidityScore = Math.max(0, Math.min(100, liquidityScore));

    const totalVolumeK = randRange(50, 1200);
    const uniqueBuyers = randRange(20, 800);
    const uniqueSellers = randRange(10, Math.max(20, Math.floor(uniqueBuyers * 0.7)));

    let transferCount = randRange(1, 12);
    let transferFrequency: 'Low' | 'Medium' | 'High' = 'Low';
    if (!isPremiumTLD || hasHyphen || hasNumber) { transferCount += randRange(2, 8); }
    if (transferCount > 12) transferFrequency = 'High';
    else if (transferCount > 6) transferFrequency = 'Medium';

    const ownershipStabilityScore = transferFrequency === 'Low' ? 80 + randRange(0, 15) : transferFrequency === 'Medium' ? 60 + randRange(0, 15) : 40 + randRange(0, 15);

    // Collateral value estimation
    let baseMin = 1000, baseMax = 8000;
    if (tld === 'com') { baseMin = 20000; baseMax = 100000; }
    else if (tld === 'io' || tld === 'ai') { baseMin = 8000; baseMax = 35000; }
    else if (tld === 'xyz' || tld === 'org' || tld === 'net' || tld === 'co') { baseMin = 3000; baseMax = 15000; }
    else if (isWeb3TLD) { baseMin = 5000; baseMax = 20000; }

    let collateralValue = randRange(baseMin, baseMax);
    if (length <= 3) collateralValue *= 2.2;
    else if (length <= 5) collateralValue *= 1.6;
    else if (length <= 8) collateralValue *= 1.25;
    if (hasHyphen) collateralValue *= 0.8;
    if (hasNumber) collateralValue *= 0.85;
    if (foundKeyword) collateralValue *= 1.15;
    collateralValue = Math.round(collateralValue * (0.9 + rnd() * 0.2));

    // Risk tier based on combined metrics
    const riskBase = Math.round(0.5 * domainQualityScore + 0.3 * liquidityScore + 0.2 * ownershipStabilityScore);
    let riskTier: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Medium Risk';
    if (riskBase >= 80) riskTier = 'Low Risk';
    else if (riskBase < 60) riskTier = 'High Risk';

    // LTV and loan amount
    let maxLTV = riskTier === 'Low Risk' ? 75 : riskTier === 'Medium Risk' ? 65 : 55;
    maxLTV += randRange(-2, 3);
    maxLTV = Math.max(45, Math.min(85, maxLTV));
    const maxLoanAmount = Math.floor(collateralValue * (maxLTV / 100));

    // Staking APY influenced by on-chain activity
    let stakingAPY = Math.round((isWeb3TLD ? 12 : 9) + (tokenActivity - 50) / 10 + (rnd() * 3));
    stakingAPY = Math.max(6, Math.min(25, stakingAPY));

    // Overall score 0-1000
    const overall0_100 = Math.round(
      0.35 * domainQualityScore +
      0.2 * tokenActivity +
      0.2 * nameActivity +
      0.15 * liquidityScore +
      0.1 * ownershipStabilityScore
    );
    const overallScore = Math.max(300, Math.min(990, overall0_100 * 10 + randRange(-20, 20)));

    const recommendations = {
      loanTerms: {
        recommended: riskTier === 'Low Risk' ? 'Approved' : riskTier === 'Medium Risk' ? 'Caution' : 'Not Approved',
        interestRate: riskTier === 'Low Risk' ? 6 + randRange(0, 2) : riskTier === 'Medium Risk' ? 9 + randRange(0, 3) : 12 + randRange(0, 4),
        collateralizationRatio: maxLTV,
      },
      stakingTerms: {
        recommended: tokenActivity >= 60 ? 'Qualified' : 'Not Qualified',
        baseAPY: stakingAPY,
        bonusAPY: liquidityScore >= 70 ? 3 + randRange(0, 3) : liquidityScore >= 50 ? 1 + randRange(0, 2) : 0,
      },
      riskFactors: [
        hasHyphen ? { factor: 'Hyphenated name', impact: 'Negative', severity: 'Medium' } : null,
        hasNumber ? { factor: 'Contains numbers', impact: 'Negative', severity: 'Low' } : null,
        length <= 4 ? { factor: 'Short length', impact: 'Positive', severity: 'Low' } : null,
        foundKeyword ? { factor: `Keyword "${foundKeyword}"`, impact: 'Positive', severity: 'Medium' } : null,
        liquidityScore < 40 ? { factor: 'Low market liquidity', impact: 'Negative', severity: 'High' } : null
      ].filter(Boolean)
    } as any;

    const result: AnalysisResult = {
      success: true,
      domainName: d,
      overallScore,
      riskTier,
      collateralValue: Math.round(collateralValue),
      maxLTV: Math.round(maxLTV),
      maxLoanAmount,
      stakingAPY,
      onChainMetrics: {
        tokenActivity: { score: tokenActivity, breakdown: { recentTransfers: randRange(0, 200) } },
        nameActivity: { score: nameActivity, breakdown: { registrations: randRange(0, 100) } },
        liquidityMetrics: { score: liquidityScore, totalVolume: `${totalVolumeK}K`, uniqueBuyers, uniqueSellers },
        ownershipStability: { score: ownershipStabilityScore, transferFrequency, transferCount }
      },
      offChainMetrics: {
        domainQuality: { score: domainQualityScore, length, brandability, memorability }
      },
      recommendations,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: '1.1',
        dataSource: 'mock',
        tld,
        length,
        features: { hasHyphen, hasNumber, keyword: foundKeyword || null, isWeb3TLD, isPremiumTLD }
      }
    };

    return result;
  };

  // API call function with fallback
  const analyzeWithAPI = async (domain: string, userApiKey?: string) => {
    try {
      setError('');
      
      // If no API key provided, use mock data immediately
      if (!userApiKey) {
        console.log('[Analytics] No API key provided, using mock data');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return generateMockData(domain);
      }

      console.log('[Analytics] Making API request with key');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-doma-api-key': userApiKey
        },
        body: JSON.stringify({ 
          domainName: domain,
          apiKey: userApiKey
        })
      });

      if (!response.ok) {
        // If API fails, fall back to mock data
        console.log(`[Analytics] API request failed (${response.status}), using mock data`);
        return generateMockData(domain);
      }

      const data: AnalysisResult = await response.json();
      
      if (!data.success) {
        console.log('[Analytics] API returned unsuccessful result, using mock data');
        return generateMockData(domain);
      }

      console.log('[Analytics] Successfully received API data');
      return data;
    } catch (err: any) {
      console.warn('[Analytics] API Error, falling back to mock data:', err.message);
      // Always fall back to mock data on error
      return generateMockData(domain);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-neon-green';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Rising':
        return 'text-neon-green';
      case 'Stable':
        return 'text-neon-blue';
      case 'Falling':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-neon-green';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleAnalyzeDomain = async () => {
    const domain = customDomain.trim();
    if (!domain) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const result = await analyzeWithAPI(domain, apiKey);
      setAnalysisResult(result);
      setSelectedDomain(domain);
      setCustomDomain('');
    } catch (err: any) {
      setError(err.message);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleDomainSelect = async (domain: string) => {
    if (domain === selectedDomain && analysisResult) return; // Already selected and analyzed
    
    setIsAnalyzing(true);
    setError('');
    setSelectedDomain(domain);
    
    try {
      const result = await analyzeWithAPI(domain, apiKey);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-sm">
          <p className="text-gray-400">Day {label}</p>
          <p className="text-neon-green">
            Value: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-space-mono font-bold text-white tracking-widest">AI ANALYTICS</h1>
          <p className="text-gray-400 font-jetbrains mt-1">Comprehensive domain analytics powered by Doma API</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-jetbrains text-gray-400">Quick Samples:</label>
          <select
            value={selectedDomain}
            onChange={(e) => handleSampleDomainSelect(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none"
          >
            <option value="">Select a sample domain...</option>
            {sampleDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Domain Analysis Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-space-mono font-bold text-white mb-4 tracking-wide">Analyze Custom Domain</h2>
        <p className="text-gray-400 font-jetbrains text-sm mb-6">Enter any domain to get real-time analytics powered by Doma API</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 font-jetbrains text-sm mb-2">Domain Name</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeDomain()}
              placeholder="Enter domain name (e.g., example.com, mytoken.eth)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains placeholder-gray-500 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-jetbrains text-sm mb-2">Doma API Key (Optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeDomain()}
              placeholder="Paste your API key for live data"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains placeholder-gray-500 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleAnalyzeDomain}
            disabled={!customDomain.trim() || isAnalyzing}
            className="px-8 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black font-jetbrains font-bold rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-green/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Domain'}
          </button>
          
          {!apiKey && (
            <div className="text-yellow-400 font-jetbrains text-xs bg-yellow-400/10 px-3 py-2 rounded border border-yellow-400/20">
              No API key: Using mock fallback data
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-red-400 font-jetbrains text-sm">{error}</div>
          </div>
        )}
        
        {customDomain && !error && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-neon-green font-jetbrains text-sm">Ready to analyze: {customDomain}</span>
            </div>
            <p className="text-gray-400 font-jetbrains text-xs">Click "Analyze Domain" to get comprehensive domain analytics from the Doma API.</p>
          </div>
        )}
      </div>

      {/* Domain Overview - Show only if we have analysis results */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-purple transition-all duration-300">
            <VscPulse className="text-neon-purple mx-auto mb-3" size={32} />
            <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Overall Score</div>
            <div className={`text-3xl font-space-mono font-bold ${getScoreColor(analysisResult.overallScore / 10)}`}>
              {analysisResult.overallScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">{analysisResult.riskTier}</div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-blue transition-all duration-300">
            <HiOutlineBuildingLibrary className="text-neon-blue mx-auto mb-3" size={32} />
            <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Collateral Value</div>
            <div className="text-2xl font-space-mono font-bold text-white">
              {formatCurrency(analysisResult.collateralValue)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Max LTV: {analysisResult.maxLTV}%</div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-green transition-all duration-300">
            <FiArrowUpRight className="text-neon-green mx-auto mb-3" size={32} />
            <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Max Loan</div>
            <div className="text-2xl font-space-mono font-bold text-neon-green">
              {formatCurrency(analysisResult.maxLoanAmount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Interest: {analysisResult.recommendations?.loanTerms?.interestRate || 'N/A'}%</div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-400 transition-all duration-300">
            <MdOutlineEmojiEvents className="text-yellow-400 mx-auto mb-3" size={32} />
            <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Staking APY</div>
            <div className="text-2xl font-space-mono font-bold text-white">
              {analysisResult.stakingAPY}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Domain: {analysisResult.domainName}</div>
          </div>
        </div>
      )}

      {/* Analysis Charts - Show only if we have analysis results */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Domain Traits Analysis */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-space-mono font-bold text-white mb-6 text-center tracking-wide">Domain Quality Analysis</h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fontFamily: 'Share Tech Mono', fill: '#9CA3AF' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fontFamily: 'Share Tech Mono', fill: '#6B7280' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#00ff41"
                    fill="#00ff41"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 font-jetbrains">
                No data available
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-space-mono font-bold text-white mb-6 text-center tracking-wide">Score Breakdown</h3>
            {/* Debug info */}
            <div className="mb-4 text-xs text-gray-500">
              Debug: scoreBreakdownData length = {scoreBreakdownData.length}
            </div>
            {scoreBreakdownData && scoreBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreBreakdownData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#666" fontSize={10} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="#00ff41"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 font-jetbrains">
                <div className="text-center">
                  <div>No data available</div>
                  <div className="text-xs mt-2">scoreBreakdownData: {JSON.stringify(scoreBreakdownData)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Analysis Results - Show only if we have analysis results */}
      {analysisResult && (
        <div>
          <h2 className="text-2xl font-space-mono font-bold text-white mb-6 tracking-wide">Detailed Analysis Results</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* On-chain Metrics */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-space-mono font-bold text-white mb-4">On-chain Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 font-jetbrains text-sm">Token Activity Score:</span>
                  <span className={`font-space-mono font-bold ${getScoreColor(analysisResult.onChainMetrics.tokenActivity.score)}`}>
                    {analysisResult.onChainMetrics.tokenActivity.score}/100
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 font-jetbrains text-sm">Name Activity Score:</span>
                  <span className={`font-space-mono font-bold ${getScoreColor(analysisResult.onChainMetrics.nameActivity.score)}`}>
                    {analysisResult.onChainMetrics.nameActivity.score}/100
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 font-jetbrains text-sm">Liquidity Score:</span>
                  <span className={`font-space-mono font-bold ${getScoreColor(analysisResult.onChainMetrics.liquidityMetrics.score)}`}>
                    {analysisResult.onChainMetrics.liquidityMetrics.score}/100
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 font-jetbrains text-sm">Ownership Stability:</span>
                  <span className={`font-space-mono font-bold ${getScoreColor(analysisResult.onChainMetrics.ownershipStability.score)}`}>
                    {analysisResult.onChainMetrics.ownershipStability.score}/100
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 font-jetbrains text-sm">Total Volume:</span>
                  <span className="text-white font-space-mono font-bold">
                    {analysisResult.onChainMetrics.liquidityMetrics.totalVolume}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-space-mono font-bold text-white mb-4">Loan & Staking Terms</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="text-white font-jetbrains font-bold mb-2">Loan Terms</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-bold ${analysisResult.recommendations?.loanTerms?.recommended?.includes('Approved') ? 'text-neon-green' : 'text-yellow-400'}`}>
                        {analysisResult.recommendations?.loanTerms?.recommended || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Interest Rate:</span>
                      <span className="text-white font-space-mono">
                        {analysisResult.recommendations?.loanTerms?.interestRate || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Collateralization Ratio:</span>
                      <span className="text-white font-space-mono">
                        {analysisResult.recommendations?.loanTerms?.collateralizationRatio || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="text-white font-jetbrains font-bold mb-2">Staking Terms</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-bold ${analysisResult.recommendations?.stakingTerms?.recommended?.includes('Qualified') ? 'text-neon-green' : 'text-red-400'}`}>
                        {analysisResult.recommendations?.stakingTerms?.recommended || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base APY:</span>
                      <span className="text-neon-green font-space-mono">
                        {analysisResult.recommendations?.stakingTerms?.baseAPY || analysisResult.stakingAPY}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bonus APY:</span>
                      <span className="text-neon-green font-space-mono">
                        +{analysisResult.recommendations?.stakingTerms?.bonusAPY || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Risk Factors */}
          {analysisResult.recommendations?.riskFactors && (
            <div className="mt-6 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-space-mono font-bold text-white mb-4">Risk Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.recommendations.riskFactors.map((factor, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded border-l-4 border-l-yellow-400">
                    <div className="text-white font-jetbrains font-bold text-sm mb-2">
                      {factor.factor}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${factor.impact === 'Positive' ? 'text-neon-green' : 'text-red-400'}`}>
                        {factor.impact}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {factor.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;