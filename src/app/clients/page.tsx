'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';
import { clients as ClientType } from '@prisma/client';
import { TextField, Stack, Paper, Container } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LIMIT = 100;

export default function ClientsPage() {
    const supabase = useMemo(() => createClient(), []);

    const [clients, setClients] = useState<ClientType[]>([]);
    const [page, setPage] = useState(0);
    const [rowCount, setRowCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // -------------------------------
    // Load paginated clients normally
    // -------------------------------
    const loadClients = useCallback(
        async (pageToLoad: number) => {
            const from = pageToLoad * LIMIT;
            const to = from + LIMIT - 1;

            const { data, error, count } = await supabase.from('clients').select('*', { count: 'exact' }).range(from, to);

            if (error) {
                console.error(error);
                return;
            }

            setClients(data || []);
            setRowCount(count ?? 0);
            setPage(pageToLoad);
            setIsSearching(false);
        },
        [supabase]
    );

    // -------------------------------
    // Debounced fuzzy search (RPC)
    // -------------------------------
    const debouncedSearch = useRef(
        debounce(async (text: string) => {
            if (!text) {
                // Reload first page
                loadClients(0);
                setIsSearching(false);
                return;
            }

            try {
                const res = await fetch('/api/clients/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ searchTerm: text })
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch clients');
                }

                const data: ClientType[] = await res.json();

                setClients(data);
                setRowCount(data.length);
                setIsSearching(true);
            } catch (error) {
                console.error(error);
            }
        }, 300)
    ).current;
    function handleSearch(text: string) {
        setSearchTerm(text);
        debouncedSearch(text);
    }

    // Load initial page
    useEffect(() => {
        loadClients(0);
    }, [loadClients]);

    // -------------------------------
    // Delete client
    // -------------------------------
    async function handleDelete(id: string) {
        const { error } = await supabase.from('clients').delete().eq('id', id);

        if (error) {
            console.error(error);
            return;
        }

        // Reload after delete
        if (isSearching) debouncedSearch(searchTerm);
        else loadClients(page);
    }

    // -------------------------------
    // Columns for DataGrid
    // -------------------------------
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'surname', headerName: 'Surname', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phone', headerName: 'Phone', flex: 1 },
        { field: 'notes', headerName: 'Notes', flex: 1 },

        // Actions column
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 110,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon color='primary' />}
                    label='Edit'
                    onClick={() => console.log('Edit clicked', params.row)}
                    key='edit'
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon color='error' />}
                    label='Delete'
                    onClick={() => handleDelete(params.row.id)}
                    key='delete'
                />
            ]
        }
    ];

    return (
        <Container sx={{ py: 3 }} disableGutters>
            {/* Search */}
            <Stack spacing={2} mb={2}>
                <TextField label='Search clients' value={searchTerm} onChange={(e) => handleSearch(e.target.value)} fullWidth />
            </Stack>

            <Paper elevation={2} sx={{ maxHeight: 'calc(100vh - 186px)', display: 'flex', flexDirection: 'column' }}>
                <DataGrid
                    rows={clients}
                    columns={columns}
                    getRowId={(row) => row.id}
                    rowCount={rowCount}
                    pageSizeOptions={[LIMIT]}
                    paginationMode='server'
                    pagination
                    paginationModel={{ page, pageSize: LIMIT }}
                    onPaginationModelChange={(model) => loadClients(model.page)}
                />
            </Paper>
        </Container>
    );
}
