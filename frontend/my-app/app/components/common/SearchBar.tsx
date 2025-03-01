'use client'
import React, { useState, useCallback } from 'react';
import {
    TextField,
    InputAdornment,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
    buttonText?: string;
    initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Tìm kiếm...",
    buttonText = "Tìm kiếm",
    initialValue = ""
}) => {
    const [searchInput, setSearchInput] = useState(initialValue);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    const handleSearchSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch(searchInput);
    }, [searchInput, onSearch]);

    return (
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <TextField
                fullWidth
                variant="outlined"
                placeholder={placeholder}
                value={searchInput}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color='error' />
                        </InputAdornment>
                    ),
                    className: "bg-white dark:bg-gray-300 "
                }}
                size="small"
            />
            <Button
                type="submit"
                variant="contained"
                color="error"
                startIcon={<SearchIcon />}
            >
                {buttonText}
            </Button>
        </form>
    );
};

export default SearchBar;
