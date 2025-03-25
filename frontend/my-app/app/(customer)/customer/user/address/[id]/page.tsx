'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ADDRESS_BY_USER_ID } from '@/graphql/queries';
import { UPDATE_ADDRESS_DEFAULT, REMOVE_ADDRESS } from '@/graphql/mutations';
import { Box, Typography, Card, CardContent, Button, Grid, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Address {
  address_id: number;
  address_name: string;
  full_name: string;
  phone: string;
  address: string;
  is_default: boolean;
  delete_at: string | null;
}

export default function AddressPage() {
  const params = useParams();
  const userId = params.id as string;
  const [addresses, setAddresses] = useState<Address[]>([]);

  const { data, loading, refetch } = useQuery(GET_ADDRESS_BY_USER_ID, {
    variables: { id: userId },
  });

  const [updateAddressDefault] = useMutation(UPDATE_ADDRESS_DEFAULT);
  const [removeAddress] = useMutation(REMOVE_ADDRESS);

  useEffect(() => {
    if (data?.addressByUserId?.address) {
      setAddresses(data.addressByUserId.address.filter((addr: Address) => !addr.delete_at));
    }
  }, [data]);

  const handleSetDefault = async (addressId: number) => {
    try {
      // First, remove default from all addresses
      const currentDefault = addresses.find(addr => addr.is_default);
      const targetAddress = addresses.find(addr => addr.address_id === addressId);

      if (!targetAddress) {
        throw new Error('Address not found');
      }

      if (currentDefault) {
        await updateAddressDefault({
          variables: {
            updateAddressInput: {
              address_id: currentDefault.address_id,
              address_name: currentDefault.address_name,
              full_name: currentDefault.full_name,
              phone: currentDefault.phone,
              address: currentDefault.address,
              is_default: false
            }
          }
        });
      }

      // Then set new default
      await updateAddressDefault({
        variables: {
          updateAddressInput: {
            address_id: targetAddress.address_id,
            address_name: targetAddress.address_name,
            full_name: targetAddress.full_name,
            phone: targetAddress.phone,
            address: targetAddress.address,
            is_default: true
          }
        }
      });

      await refetch();
      toast.success('Đã cập nhật địa chỉ mặc định');
    } catch (error) {
      console.error('Error updating default address:', error);
      toast.error('Không thể cập nhật địa chỉ mặc định');
    }
  };

  const handleDelete = async (addressId: number) => {
    try {
      await removeAddress({
        variables: { id: addressId }
      });
      await refetch();
      toast.success('Đã xóa địa chỉ');
    } catch {
      toast.error('Không thể xóa địa chỉ');
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Địa chỉ của tôi
        </Typography>
        <Link href={`/customer/user/address/add/${userId}`}>
          <Button variant="contained" color="primary">
            Thêm địa chỉ mới
          </Button>
        </Link>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address.address_id}>
            <Card className="h-full">
              <CardContent>
                <Box className="flex justify-between items-start mb-2">
                  <Typography variant="h6" component="h2">
                    {address.address_name}
                    {address.is_default && (
                      <Chip
                        label="Mặc định"
                        color="primary"
                        size="small"
                        className="ml-2"
                      />
                    )}
                  </Typography>
                  <IconButton
                    onClick={() => handleDelete(address.address_id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" className="mb-1">
                  {address.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {address.phone}
                </Typography>
                <Typography variant="body2" className="mb-4">
                  {address.address}
                </Typography>
                {!address.is_default && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSetDefault(address.address_id)}
                  >
                    Đặt làm mặc định
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
