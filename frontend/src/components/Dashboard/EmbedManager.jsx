import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, ExternalLink, RefreshCw, Trash2, Clock, 
  Lock, Unlock, Code, Eye, Settings, AlertCircle, Globe
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const EmbedManager = ({ dashboardId, onClose }) => {
  const [embedTokens, setEmbedTokens] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  const [embedOptions, setEmbedOptions] = useState({
    expiresIn: 86400000,
    hideControls: false,
    readOnly: true,
    showGrid: false,
    zoom: 'fit'
  });

  // Holds the raw token value for the most-recently-generated token so
  // copy / preview still works without the list endpoint exposing it.
  const [lastGeneratedToken, setLastGeneratedToken] = useState(null);

  useEffect(() => {
    loadEmbedData();
  }, [dashboardId]);

  const loadEmbedData = async () => {
    try {
      setLoading(true);
      setError(null);

      const publicResponse = await fetch(`${API_URL}/embed/dashboard/${dashboardId}/public-status`);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        setIsPublic(publicData.isPublic || false);
      }

      const tokensResponse = await fetch(`${API_URL}/embed/tokens/${dashboardId}`);
      if (tokensResponse.ok) {
        const tokens = await tokensResponse.json();
        setEmbedTokens(tokens);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading embed data:', err);
      setError('Failed to load embed settings');
      setLoading(false);
    }
  };

  const generateEmbedToken = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch(`${API_URL}/embed/generate-token/${dashboardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresIn: embedOptions.expiresIn,
          permissions: {
            readOnly: embedOptions.readOnly
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate embed token');
      }

      const data = await response.json();
      setLastGeneratedToken(data.token);
      await loadEmbedData();
      
      copyToClipboard(buildEmbedUrl(data.token), 'url');
      
      setGenerating(false);
    } catch (err) {
      console.error('Error generating token:', err);
      setError('Failed to generate embed token');
      setGenerating(false);
    }
  };

  const togglePublicStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/embed/dashboard/${dashboardId}/public-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic })
      });

      if (!response.ok) {
        throw new Error('Failed to update public status');
      }

      const data = await response.json();
      setIsPublic(data.isPublic);
    } catch (err) {
      console.error('Error toggling public status:', err);
      setError('Failed to update public status');
    }
  };

  const revokeToken = async (tokenId) => {
    if (!confirm('Are you sure you want to revoke this embed token? All embeds using this token will stop working.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/embed/tokens/${tokenId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke token');
      }

      await loadEmbedData();
    } catch (err) {
      console.error('Error revoking token:', err);
      setError('Failed to revoke token');
    }
  };

  const buildEmbedUrl = (tokenValue = null) => {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/embed?id=${dashboardId}`;
    
    if (tokenValue) {
      url += `&token=${tokenValue}`;
    }
    
    if (embedOptions.hideControls) {
      url += '&hideControls=true';
    }
    
    if (!embedOptions.readOnly) {
      url += '&readOnly=false';
    }
    
    if (embedOptions.showGrid) {
      url += '&grid=true';
    }
    
    if (embedOptions.zoom !== 'fit') {
      url += `&zoom=${embedOptions.zoom}`;
    }
    
    return url;
  };

  const buildEmbedCode = (tokenValue = null) => {
    const url = buildEmbedUrl(tokenValue);
    return `<iframe
  src="${url}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  allowfullscreen
></iframe>`;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExpiresIn = (ms) => {
    const hours = ms / (1000 * 60 * 60);
    if (hours < 24) return `${hours} hours`;
    const days = hours / 24;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-panel rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-panel-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-blue/10 rounded-lg">
              <Code className="text-accent-blue" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Embed Dashboard</h2>
              <p className="text-sm text-white/50">Share your dashboard anywhere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-panel-light rounded-lg transition-colors"
          >
            <X className="text-white/70" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-accent-blue animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-panel-light rounded-lg border border-panel-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Unlock className="text-green-400" size={18} />
                    ) : (
                      <Lock className="text-white/50" size={18} />
                    )}
                    <h3 className="text-sm font-semibold text-white">
                      {isPublic ? 'Public Dashboard' : 'Private Dashboard'}
                    </h3>
                  </div>
                  <button
                    onClick={togglePublicStatus}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      isPublic
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    }`}
                  >
                    {isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
                <p className="text-xs text-white/50">
                  {isPublic
                    ? 'Anyone with the link can view this dashboard without authentication'
                    : 'This dashboard requires a valid embed token to view'}
                </p>
              </div>

              <div className="p-4 bg-panel-light rounded-lg border border-panel-border space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Settings size={16} />
                  Embed Options
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedOptions.hideControls}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, hideControls: e.target.checked })}
                      className="rounded border-panel-border bg-canvas text-accent-blue focus:ring-accent-blue"
                    />
                    Hide Controls
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedOptions.readOnly}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, readOnly: e.target.checked })}
                      className="rounded border-panel-border bg-canvas text-accent-blue focus:ring-accent-blue"
                    />
                    Read Only
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedOptions.showGrid}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, showGrid: e.target.checked })}
                      className="rounded border-panel-border bg-canvas text-accent-blue focus:ring-accent-blue"
                    />
                    Show Grid
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/70">Zoom:</label>
                    <select
                      value={embedOptions.zoom}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, zoom: e.target.value })}
                      className="flex-1 px-2 py-1 bg-canvas border border-panel-border rounded text-sm text-white"
                    >
                      <option value="fit">Fit to container</option>
                      <option value="0.5">50%</option>
                      <option value="0.75">75%</option>
                      <option value="1">100%</option>
                      <option value="1.25">125%</option>
                      <option value="1.5">150%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Token Expiration:</label>
                  <select
                    value={embedOptions.expiresIn}
                    onChange={(e) => setEmbedOptions({ ...embedOptions, expiresIn: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-canvas border border-panel-border rounded text-sm text-white"
                  >
                    <option value={3600000}>1 hour</option>
                    <option value={21600000}>6 hours</option>
                    <option value={86400000}>24 hours</option>
                    <option value={604800000}>7 days</option>
                    <option value={2592000000}>30 days</option>
                    <option value={31536000000}>1 year</option>
                  </select>
                </div>
              </div>

              {isPublic && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe size={16} />
                    Public Embed Code
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/50">Embed URL:</label>
                      <button
                        onClick={() => copyToClipboard(buildEmbedUrl(), 'public-url')}
                        className="text-xs text-accent-blue hover:text-accent-blue/80 flex items-center gap-1"
                      >
                        {copied === 'public-url' ? (
                          <><Check size={12} /> Copied!</>
                        ) : (
                          <><Copy size={12} /> Copy</>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-canvas rounded text-xs text-white/70 overflow-x-auto">
                      {buildEmbedUrl()}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/50">Iframe Code:</label>
                      <button
                        onClick={() => copyToClipboard(buildEmbedCode(), 'public-code')}
                        className="text-xs text-accent-blue hover:text-accent-blue/80 flex items-center gap-1"
                      >
                        {copied === 'public-code' ? (
                          <><Check size={12} /> Copied!</>
                        ) : (
                          <><Copy size={12} /> Copy</>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-canvas rounded text-xs text-white/70 overflow-x-auto">
                      {buildEmbedCode()}
                    </pre>
                  </div>
                </div>
              )}

              {!isPublic && (
                <button
                  onClick={generateEmbedToken}
                  disabled={generating}
                  className="w-full px-4 py-3 bg-accent-blue hover:bg-accent-blue/90 disabled:bg-accent-blue/50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Generating Token...
                    </>
                  ) : (
                    <>
                      <Code size={18} />
                      Generate New Embed Token
                    </>
                  )}
                </button>
              )}

              {!isPublic && embedTokens.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock size={16} />
                    Active Embed Tokens ({embedTokens.length})
                  </h3>
                  
                  <div className="space-y-2">
                    {embedTokens.map((token) => {
                      const isExpired = new Date() > new Date(token.expiresAt);

                      // We only have the raw token value for the one that was
                      // just generated in this session.  Match by preview so we
                      // never need the list endpoint to return it.
                      const resolvedToken =
                        lastGeneratedToken &&
                        token.tokenPreview ===
                          `${lastGeneratedToken.substring(0, 8)}...${lastGeneratedToken.substring(lastGeneratedToken.length - 4)}`
                          ? lastGeneratedToken
                          : null;
                      
                      return (
                        <div
                          key={token.id}
                          className={`p-3 rounded-lg border ${
                            isExpired 
                              ? 'bg-red-500/5 border-red-500/20' 
                              : 'bg-panel-light border-panel-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-xs font-mono text-white/70 bg-canvas px-2 py-0.5 rounded">
                                  {token.tokenPreview}
                                </code>
                                {isExpired && (
                                  <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                                    Expired
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-white/40 space-y-0.5">
                                <div>Created: {formatDate(token.createdAt)}</div>
                                <div>Expires: {formatDate(token.expiresAt)}</div>
                                {token.lastUsedAt && (
                                  <div>Last used: {formatDate(token.lastUsedAt)}</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {resolvedToken && (
                                <>
                                  <button
                                    onClick={() => window.open(buildEmbedUrl(resolvedToken), '_blank')}
                                    className="p-1.5 hover:bg-panel rounded text-white/50 hover:text-white/70"
                                    title="Preview"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(buildEmbedUrl(resolvedToken), `token-url-${token.id}`)}
                                    className="p-1.5 hover:bg-panel rounded text-white/50 hover:text-white/70"
                                    title="Copy URL"
                                  >
                                    {copied === `token-url-${token.id}` ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => revokeToken(token.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300"
                                title="Revoke"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-panel-border bg-canvas/50">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Embed tokens are secure and can be revoked anytime</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 hover:bg-panel-light rounded text-white/70 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedManager;