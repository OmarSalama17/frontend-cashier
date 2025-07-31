import React, { forwardRef } from "react";

const ReceiptComponent = forwardRef(({ order }, ref) => {
  if (!order) return <p>⚠️ لا توجد فاتورة</p>;

  return (
<div ref={ref} className="w-[80mm] mx-auto p-4 text-[12px] font-mono border border-dashed border-gray-400 rounded shadow bg-white">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">💈 كاشير عمر</h2>
        <p>فاتورة بيع</p>
        <p>رقم الطلب: {order.id}</p>
        <p>التاريخ: {new Date(order.date).toLocaleString()}</p>
      </div>

      <div className="mb-2">
        <p>👤 اسم العميل: {order.customerName || "------"}</p>
        <p>📞 رقم الهاتف: {order.customerPhone || "------"}</p>
        <p>💳 طريقة الدفع: {order.paymentMethod === "cash" ? "كاش" : order.paymentMethod === "visa" ? "فيزا" : "تحويل بنكي"}</p>
      </div>

      <table className="w-full text-right border-t border-b border-gray-300 mb-2">
        <thead>
          <tr>
            <th className="py-1 border-b border-gray-300">المنتج</th>
            <th className="py-1 border-b border-gray-300">الكمية</th>
            <th className="py-1 border-b border-gray-300">السعر</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="py-1">{item.name}</td>
              <td className="py-1">{item.quantity}</td>
              <td className="py-1">{item.price * item.quantity} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right border-t border-gray-300 pt-2">
        <p>الإجمالي: {order.total} ج.م</p>
        {order.discount > 0 && (
          <p className="text-green-600">خصم: {order.discount * 100}%</p>
        )}
      </div>

      <div className="text-center mt-4 border-t border-gray-300 pt-2">
        <p className="text-sm">💡 شكراً لتسوقك معنا!</p>
        <p className="text-xs">🔁 سياسة الاسترجاع خلال 14 يوم</p>
      </div>
    </div>
  );
});

export default ReceiptComponent;
