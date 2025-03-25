'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ADDRESS } from '@/graphql/mutations';
import { GET_ADDRESS_BY_USER_ID } from '@/graphql/queries';
import { Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AddAddressPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [formData, setFormData] = useState({
    address_name: '',
    full_name: '',
    phone: '',
    address: '',
  });

  const [createAddress] = useMutation(CREATE_ADDRESS, {
    refetchQueries: [
      {
        query: GET_ADDRESS_BY_USER_ID,
        variables: { id: userId }
      }
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress({
        variables: {
          createAddressInput: {
            ...formData,
            id_user: userId,
            is_default: false
          }
        }
      });
      toast.success('Đã thêm địa chỉ mới');
      router.push(`/customer/user/address/${userId}`);
    } catch {
      toast.error('Không thể thêm địa chỉ');
    }
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        Thêm địa chỉ mới
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Tên địa chỉ"
              name="address_name"
              value={formData.address_name}
              onChange={handleChange}
              required
              placeholder="Ví dụ: Nhà riêng, Công ty"
            />

            <TextField
              fullWidth
              label="Họ và tên"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              type="tel"
            />

            <TextField
              fullWidth
              label="Địa chỉ chi tiết"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              multiline
              rows={4}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />

            <Box className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outlined"
                onClick={() => router.push(`/customer/user/address/${userId}`)}
              >
                Hủy
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Thêm địa chỉ
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 