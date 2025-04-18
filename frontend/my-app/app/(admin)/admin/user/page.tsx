'use client'
import React, { useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Pagination,
    Alert,
    Button
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries';
import SearchBar from '@/app/components/common/SearchBar';

interface User {
    id_user: string;
    user_name: string;
    email: string;
    status: string;
}

interface UsersResponse {
    users: {
        data: User[];
        totalCount: number;
        totalPage: number;
    };
}

// Status chip component for reusability
const StatusChip = ({ status }: { status: string }) => {
    // Xử lý trạng thái null trước
    const normalizedStatus = status === null ? 'active' : status;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Chip
            label={normalizedStatus}
            color={getStatusColor(normalizedStatus)}
        />
    );
};

const UserPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;
    const router = useRouter();

    // Memoize query variables to prevent unnecessary rerenders
    const queryVariables = useMemo(() => ({
        page,
        limit,
        search // Chỉ khi search thay đổi mới gửi truy vấn
    }), [page, limit, search]);

    const { data, loading, error } = useQuery<UsersResponse>(GET_USERS, {
        variables: queryVariables,
        fetchPolicy: 'network-only'
    });

    // Memoize derived data
    const users = useMemo(() => data?.users.data || [], [data]);
    const totalPages = useMemo(() => data?.users.totalPage || 0, [data]);

    // Memoize handlers to prevent recreating functions on each render
    const handleDetailUser = useCallback((id: string) => {
        router.push(`/admin/user/detail/${id}`);
    }, [router]);

    const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    }, []);

    // Hàm xử lý khi người dùng submit tìm kiếm từ SearchBar component
    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải danh mục...</Typography>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Error Loading Data</Typography>
                    <Typography>{error.message || 'An unknown error occurred'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    // Empty state
    const showEmptyState = users.length === 0;

    return (
        <div className="overflow-y-auto p-6">
            <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg h-full flex flex-col">
                <CardContent className="!p-0 flex flex-col h-full">
                    <div className="p-4 bg-gray-50 dark:bg-dark-sidebar border-b border-gray-200 dark:border-gray-700">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Tìm kiếm người dùng..."
                            initialValue={search}
                            buttonText="Search"
                        />
                    </div>
                    <TableContainer
                        component={Paper}
                        className="!bg-transparent flex-grow overflow-hidden flex flex-col"
                    >
                        {showEmptyState ? (
                            <div className="flex-grow flex items-center justify-center p-8">
                                <Typography variant="h6" className=' dark:!text-gray-300'>
                                    Không tìm thấy danh mục nào phù hợp với tiêu chí tìm kiếm
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-auto">
                                    <Table stickyHeader className="min-w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    UserID
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    UserName
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Email
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Status
                                                </TableCell>
                                                <TableCell className="!font-bold !text-gray-700 dark:!text-gray-200 !bg-gray-50 dark:!bg-dark-sidebar !text-2xl">
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow
                                                    key={user.id_user}
                                                    className="hover:!bg-gray-50 dark:hover:!bg-dark-selected transition-colors duration-150"
                                                >
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {user.id_user}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {user.user_name}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell className="!text-gray-600 dark:!text-gray-300 !text-xl">
                                                        <StatusChip status={user.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="detail"
                                                            title="Xem chi tiết"
                                                            onClick={() => handleDetailUser(user.id_user)}
                                                            className="!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900"
                                                            size="small"
                                                        >
                                                            <ViewListIcon className="!w-7 !h-6" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {totalPages > 0 && (
                                    <div className="flex justify-center p-4">
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handleChangePage}
                                            size="large"
                                            color='primary'
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserPage;