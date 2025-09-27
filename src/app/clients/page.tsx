'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';

const LIMIT = 100;

export default function UsersPage() {
  const supabase = createClient();

  const [clients, setClients] = useState<any[]>([]);
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (!text) {
        // Reset search
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

      setDisplayed(data);
      setIsSearching(true);
      setHasMore(false);
    }, 300)
  ).current;

  useEffect(() => {
    loadClients(0);
  }, []);

  async function loadClients(pageToLoad: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .range(pageToLoad * LIMIT, (pageToLoad + 1) * LIMIT - 1);

    if (error) {
      console.error(error);
      return;
    }

    setClients(data);
    setDisplayed(data);
    setPage(pageToLoad);
    setHasMore(data.length === LIMIT);
    setIsSearching(false);
  }

  function handleSearch(text: string) {
    setSearchTerm(text);
    debouncedSearch(text);
  }

  function renderTable(data: any[]) {
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
          {data.map((client, idx) => (
            <tr key={idx}>
              {Object.entries(client)
                .filter(([key]) => key !== 'id')
                .map(([key, val], j) => (
                  <td key={j} className="border px-2 py-1">
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

      {renderTable(displayed)}

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
