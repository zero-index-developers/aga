'use client';

import { useState } from 'react';
import { Search, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SAMPLE_NODES = [
  { id: 'auth-middleware', label: 'AuthMiddleware', type: 'middleware' },
  { id: 'user-controller', label: 'UserController', type: 'controller' },
  { id: 'payment-controller', label: 'PaymentController', type: 'controller' },
  { id: 'inventory-controller', label: 'InventoryController', type: 'controller' },
  { id: 'user-service', label: 'UserService', type: 'service' },
  { id: 'payment-service', label: 'PaymentService', type: 'service' },
  { id: 'auth-service', label: 'AuthService', type: 'service' },
  { id: 'db-users', label: 'Users Table', type: 'database' },
  { id: 'db-products', label: 'Products Table', type: 'database' },
  { id: 'db-transactions', label: 'Transactions Table', type: 'database' },
  { id: 'api-users', label: 'GET /api/users', type: 'route' },
  { id: 'api-payments', label: 'POST /api/payments', type: 'route' },
  { id: 'api-inventory', label: 'GET /api/inventory', type: 'route' },
  { id: 'analytics-worker', label: 'AnalyticsWorker', type: 'worker' },
];

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export default function SearchPanel({ onSearch, onNodeSelect, selectedNodeId }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        'auth': 'AuthMiddleware was implemented in Q2 2024 to prevent race conditions during concurrent user sessions. It validates JWT tokens and enforces role-based access control across all protected routes. Removing it would expose the API to unauthorized access.',
        'payment': 'PaymentService integrates with Stripe API and handles transaction processing. It connects to both the Users table for account validation and Transactions table for audit logging. Any changes here impact 3 API routes and 2 services.',
        'bypass': 'Bypassing AuthMiddleware would expose your entire API to unauthorized access. This would affect 8 API routes and impact both user authentication and payment processing systems.',
        'postgresql': 'PostgreSQL was chosen for this architecture because it provides ACID compliance and complex relational queries needed for financial transaction tracking and user audit logs.',
        'default': 'This component is critical to the architecture. It integrates with multiple services and database tables. Before making changes, review the blast radius analysis to understand all downstream impacts.',
      };

      let response = responses.default;
      for (const [key, value] of Object.entries(responses)) {
        if (query.toLowerCase().includes(key)) {
          response = value;
          break;
        }
      }

      setAiResponse(response);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* Contextual Oracle Search */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Contextual Oracle
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ask about the architecture..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-input border-border text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2"
              size="sm"
            >
              {loading ? 'Analyzing...' : 'Ask Bob'}
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-xs font-semibold text-accent mb-2">Oracle Response:</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Architecture Explorer */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Components
          </label>
          <div className="space-y-1.5">
            {SAMPLE_NODES.map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium border border-transparent ${
                  selectedNodeId === node.id
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                    : 'hover:bg-secondary/50 text-foreground/80 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      node.type === 'controller'
                        ? 'bg-blue-400'
                        : node.type === 'service'
                          ? 'bg-green-400'
                          : node.type === 'database'
                            ? 'bg-orange-400'
                            : 'bg-purple-400'
                    }`}
                  ></div>
                  <span className="flex-1">{node.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
