/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
    Box,
    Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from '@/graphql/queries';
import moment from 'moment-timezone';

// Cập nhật interface phù hợp với dữ liệu GraphQL
interface User {
    id_user: string;
    user_name: string;
    email: string;
    password: string;
    phone: string;
    status: string;
    role: string;
    create_at: string;
    update_at: string;
}

interface UserResponse {
    user: User;
}

const UserDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const userId = String(params.id);

    const { data, loading, error } = useQuery<UserResponse>(GET_USER_BY_ID, {
        variables: { id: userId },
        fetchPolicy: 'network-only'
    });

    // Hàm format thời gian
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return moment(dateString).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm');
        } catch (e) {
            return "Invalid date";
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <CircularProgress />
                <Typography className="ml-3">Đang tải thông tin người dùng...</Typography>
            </div>
        );
    }

    if (error || !data?.user) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <Alert severity="error" className="mb-4 w-full max-w-2xl">
                    <Typography variant="h6">Lỗi khi tải dữ liệu</Typography>
                    <Typography>{error?.message || 'Không tìm thấy người dùng hoặc đã xảy ra lỗi không xác định.'}</Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => router.push('/admin/user')}
                >
                    Quay lại
                </Button>
            </div>
        );
    }

    const user = data.user;

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 dark:bg-dark-body">
            <div className="p-6">
                <Card className="!bg-white dark:!bg-dark-sidebar shadow-lg">
                    <CardContent>
                        <Typography variant="h4" className="!text-gray-700 dark:!text-gray-200 !font-bold">
                            Chi tiết người dùng
                        </Typography>
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            className="mt-4"
                        >
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>ID:</strong> {user.id_user}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Tên người dùng:</strong> {user.user_name}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Mật khẩu:</strong> {user.password ? '••••••••' : 'Chưa cập nhật'}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Trạng thái:</strong> {user.status || 'active'}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Vai trò:</strong> {user.role || 'Người dùng thường'}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Ngày tạo:</strong> {formatDate(user.create_at)}
                            </Typography>
                            <Typography className="!text-gray-600 dark:!text-gray-300">
                                <strong>Ngày cập nhật:</strong> {formatDate(user.update_at)}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            className="mt-6"
                            onClick={() => router.push('/admin/user')}
                        >
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserDetailPage;
