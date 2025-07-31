import { useEffect, useState } from 'react';
import axios from 'axios';

function InventoryPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:1337/api/products?populate=*")
      .then(res => {
        const mapped = res.data.data.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          costPrice: p.costPrice || 0,
          inStock: p.inStock || 0,
          soldCount: p.soldCount || 0,
          returnedCount:p.returnedCount
        }));
        setProducts(mapped);
      })
      .catch(err => console.error("خطأ في تحميل البيانات:", err));
  }, []);

  return (
    <div className="p-6 w-[100%]">
      <h1 className="text-2xl font-bold mb-4">📦 جرد المنتجات</h1>
      <table className="min-w-full text-right border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">المنتج</th>
            <th className="px-4 py-2 border">الفئة</th>
            <th className="px-4 py-2 border">سعر البيع</th>
            <th className="px-4 py-2 border">سعر الشراء</th>
            <th className="px-4 py-2 border">في المخزون</th>
            <th className="px-4 py-2 border">تم بيعه</th>
            <th className="px-4 py-2 border">مرتجع</th>
            <th className="px-4 py-2 border">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{p.name}</td>
              <td className="px-4 py-2 border">{p.category}</td>
              <td className="px-4 py-2 border">{p.price} ج.م</td>
              <td className="px-4 py-2 border">{p.costPrice} ج.م</td>
              <td className="px-4 py-2 border">{p.inStock}</td>
              <td className="px-4 py-2 border">{p.soldCount}</td>
              <td className="px-4 py-2 border">{p.returnedCount}</td>
              <td className="px-4 py-2 border">
                {p.inStock > 0 ? "✅ متوفر" : "❌ نفد المخزون"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryPage;
