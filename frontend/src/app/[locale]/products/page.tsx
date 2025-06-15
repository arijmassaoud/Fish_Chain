'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // جلب الفئات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!response.ok) throw new Error('فشل جلب الفئات');

        const result = await response.json();
        setCategories(result.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
        const params = new URLSearchParams();

        if (selectedCategory) params.append('categoryId', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('فشل جلب المنتجات');

        const result = await response.json();
        setProducts(result.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800   p-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* عنوان الصفحة + زر الإضافة */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {user && ['SELLER', 'ADMIN'].includes(user.role) && (
            <Link
              href="/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add Product
            </Link>
          )}
        </div>

        {/* الفلاتر */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اختيار الفئة */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* البحث */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
        </div>






        {/* قائمة المنتجات */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden shadow transition-transform duration-300 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200 rounded-xl">
                    <Link href={`/products/${product.id}`}>
                      <Image
                        src={product.imageUrl || '/placeholder.png'} // ✅ هنا تم استخدام الحقل الصحيح
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.category.name}</p> {/* ✅ عرض اسم الفئة */}
                    <p className="text-sm text-gray-500 mt-1">Seller: {product.seller.name}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      {user && (
                        <Link
                          href={`/products/${product.id}`}
                          className="text-sm text-primary hover:text-primary"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* رسالة عدم وجود منتجات */}
        {!loading && products.length === 0 && !selectedCategory && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}