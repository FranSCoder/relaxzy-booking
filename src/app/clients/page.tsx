'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';
import { clients as ClientType } from '@prisma/client';

const LIMIT = 100;

export default function UsersPage() {
  // Memoize supabase client so it remains stable
  const supabase = useMemo(() => createClient(), []);

  // State
  const [clients, setClients] = useState<ClientType[]>([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load clients function, stable with useCallback
  const loadClients = useCallback(async (pageToLoad: number) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .range(pageToLoad * LIMIT, (pageToLoad + 1) * LIMIT - 1);

    if (error) {
      console.error(error);
      return;
    }

  if (!data) return;

  setClients(data as ClientType[]);
    setPage(pageToLoad);
    setHasMore(data.length === LIMIT);
    setIsSearching(false);
  }, [supabase]);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (!text) {
        loadClients(0);
        setIsSearching(false);
        return;
      }

      const { data, error } = await supabase.rpc('search_clients_fuzzy', {
        search_term: text,
      });

      if (error) {
        console.error(error);
        return;
      }

  if (!data) return;

  setClients(data as ClientType[]);
      setIsSearching(true);
      setHasMore(false);
    }, 300)
  ).current;

  // Load first page on mount
  useEffect(() => {
    loadClients(0);
  }, [loadClients]);

  // Handle search input
  function handleSearch(text: string) {
    setSearchTerm(text);
    debouncedSearch(text);
  }

  // Render table
  function renderTable(data: ClientType[]) {
    if (data.length === 0) return <p>No clients found.</p>;

    return (
      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr>
            {Object.keys(data[0])
              .filter((key) => key !== 'id')
              .map((key) => (
                <th key={key} className="border px-2 py-1 text-left capitalize">
                  {key.replace(/_/g, ' ')}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((client) => (
            <tr key={client.id}>
              {Object.entries(client)
                .filter(([key]) => key !== 'id')
                .map(([key, val]) => (
                  <td key={key} className="border px-2 py-1">
                    {String(val)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search clients..."
        className="w-full p-2 mb-4 border rounded"
      />

      {renderTable(clients)}

      {!isSearching && (
        <div className="flex justify-between mt-4">
          <button
            onClick={() => loadClients(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => loadClients(page + 1)}
            disabled={!hasMore}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
