(() => {
  const domainInput = document.getElementById('domainInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const statusEl = document.getElementById('status');

  const summary = document.getElementById('summary');
  const overallScoreEl = document.getElementById('overallScore');
  const riskTierEl = document.getElementById('riskTier');
  const collateralValueEl = document.getElementById('collateralValue');
  const maxLoanEl = document.getElementById('maxLoan');

  const charts = document.getElementById('charts');
  const details = document.getElementById('details');
  const onChainEl = document.getElementById('onChain');
  const offChainEl = document.getElementById('offChain');
  const recsEl = document.getElementById('recs');
  const metaEl = document.getElementById('meta');

  let chart;

  function setStatus(msg, isError = false) {
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? '#fca5a5' : '#94a3b8';
  }

  function numberFmt(n) {
    if (typeof n !== 'number') return n;
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  async function analyze() {
    const domain = domainInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!domain) {
      setStatus('Please enter a domain name.', true);
      return;
    }

    analyzeBtn.disabled = true;
    setStatus('Analyzing...');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-doma-api-key': apiKey } : {})
        },
        body: JSON.stringify({ domainName: domain, ...(apiKey ? { apiKey } : {}) })
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to analyze');
      }

      render(data);
      setStatus('Done');
    } catch (e) {
      setStatus(e.message || 'Error analyzing domain', true);
    } finally {
      analyzeBtn.disabled = false;
    }
  }

  function render(data) {
    summary.classList.remove('hidden');
    charts.classList.remove('hidden');
    details.classList.remove('hidden');

    overallScoreEl.textContent = numberFmt(data.overallScore);
    riskTierEl.textContent = data.riskTier;
    collateralValueEl.textContent = '$' + numberFmt(data.collateralValue);
    maxLoanEl.textContent = '$' + numberFmt(data.maxLoanAmount);

    const ctx = document.getElementById('scoreChart');
    const series = [
      data.onChainMetrics?.tokenActivity?.score ?? 0,
      data.onChainMetrics?.nameActivity?.score ?? 0,
      data.onChainMetrics?.liquidityMetrics?.score ?? 0,
      data.onChainMetrics?.ownershipStability?.score ?? 0,
      data.offChainMetrics?.domainQuality?.score ?? 0,
    ];

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Token Activity', 'Name Activity', 'Liquidity', 'Ownership', 'Domain Quality'],
        datasets: [{
          label: 'Score (0-100)',
          data: series,
          backgroundColor: ['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa']
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });

    onChainEl.textContent = JSON.stringify(data.onChainMetrics, null, 2);
    offChainEl.textContent = JSON.stringify(data.offChainMetrics, null, 2);
    recsEl.textContent = JSON.stringify(data.recommendations, null, 2);
    metaEl.textContent = JSON.stringify(data.metadata, null, 2);
  }

  analyzeBtn.addEventListener('click', analyze);
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') analyze();
  });
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') analyze();
  });
})();

