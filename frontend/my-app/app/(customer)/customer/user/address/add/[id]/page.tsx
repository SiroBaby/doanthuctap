'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ADDRESS } from '@/graphql/mutations';
import { GET_ADDRESS_BY_USER_ID } from '@/graphql/queries';
import { Box, Typography, TextField, Button, Card, CardContent, List, ListItem, ListItemButton, ListItemText, Popper, Paper, ClickAwayListener, InputAdornment, CircularProgress } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AddressSuggestion {
  description: string;
  place_id: string;
}

interface GoongPrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  }
}

interface GoongResponse {
  predictions: GoongPrediction[];
  status: string;
  execution_time?: string;
}

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

  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [createAddress] = useMutation(CREATE_ADDRESS, {
    refetchQueries: [
      {
        query: GET_ADDRESS_BY_USER_ID,
        variables: { id: userId }
      }
    ]
  });

  const fetchAddressSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/place/autocomplete?api_key=${process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY}&input=${encodeURIComponent(query)}`
      );
      const data: GoongResponse = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions.map((prediction: GoongPrediction) => ({
          description: prediction.description,
          place_id: prediction.place_id
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý debounce cho input địa chỉ
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (addressQuery.trim()) {
      timeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(addressQuery);
      }, 1000); // Debounce 1 giây
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [addressQuery]);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAddressQuery(value);
    setAnchorEl(e.currentTarget);
    
    // Cập nhật formData.address theo input hiện tại
    setFormData(prev => ({
      ...prev,
      address: value
    }));
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.description
    }));
    setAddressQuery(suggestion.description);
    setSuggestions([]);
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setSuggestions([]);
    setAnchorEl(null);
  };

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

  const open = Boolean(anchorEl) && suggestions.length > 0;
  const id = open ? 'address-suggestions' : undefined;

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

            <ClickAwayListener onClickAway={handleClickAway}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <TextField
                  fullWidth
                  label="Địa chỉ chi tiết"
                  value={addressQuery}
                  onChange={handleAddressInputChange}
                  required
                  inputRef={addressInputRef}
                  placeholder="Nhập địa chỉ để tìm kiếm"
                  InputProps={{
                    endAdornment: loading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <Popper 
                  id={id} 
                  open={open} 
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
                >
                  <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List>
                      {suggestions.map((suggestion) => (
                        <ListItem key={suggestion.place_id} disablePadding>
                          <ListItemButton onClick={() => handleSuggestionClick(suggestion)}>
                            <ListItemText primary={suggestion.description} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>

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