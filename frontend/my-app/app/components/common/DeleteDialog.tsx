'use client'
import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

interface DeleteDialogProps {
    open: boolean;
    title: string;
    contentText: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
    open,
    title,
    contentText,
    onCancel,
    onConfirm,
    loading = false,
    confirmButtonText = 'Xóa',
    cancelButtonText = 'Hủy',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <DialogTitle id="delete-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                    {contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary">
                    {cancelButtonText}
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    autoFocus
                    disabled={loading}
                >
                    {loading ? 'Đang xóa...' : confirmButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;
