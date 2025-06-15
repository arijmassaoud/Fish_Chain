'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/UI/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Define the Product interface to match the data structure
interface Product {
  id: string;
  productName: string;
  imageUrls?: string[];
}

// Update the props interface to use the correct type name
interface DeleteAlertProps {
  product: Product;
}

function DeleteAlert({ product }: DeleteAlertProps) {
  const router = useRouter();

  // This handler will perform the API call to delete the product
  const handleDelete = async () => {
    toast.info(`Deleting product "${product.productName}"...`);

    try {
      // 1. Use fetch to call your backend DELETE endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}`,
        {
          method: 'DELETE',
          // You can add headers if your API requires authentication
          // headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
        }
      );

      // 2. Handle the response from the server
      if (!response.ok) {
        // If the server responds with an error status, throw an error
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`Product "${product.productName}" deleted successfully.`);
        // Refresh the page or re-fetch data to update the UI
        router.refresh();
      } else {
        toast.error(result.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-destructive hover:text-destructive/80 cursor-pointer"
          title="Delete"
        >
          <Trash2 />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product "{product.productName}" and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete} // Call the new handler
            className="cursor-pointer bg-red-800 text-white hover:bg-red-800/80"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAlert;