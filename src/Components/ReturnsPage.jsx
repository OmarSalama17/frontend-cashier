import { useState, useEffect } from "react";
import axios from "axios";

function ReturnsPage() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});

  const fetchOrder = () => {
    axios
      .get(`https://strapi-backend-cashier.up.railway.app/api/orders?filters[orderId][$eq]=${orderId}&populate=*`)
      .then((res) => {
        const found = res.data.data[0];
        if (found) {
          setOrderData(found);
        } else {
          alert("❌ لم يتم العثور على الفاتورة");
          setOrderData(null);
        }
      })
      .catch((err) => console.error("Error fetching order:", err));
  };

  const handleReturn = async () => {
    try {
const updatedItems = orderData.items.map((item) => {
  const returnedQty = selectedItems[item.barcode] || 0;
  const originalQty = (item.quantity || 0) + (item.returnedCount || 0);

  if (returnedQty > originalQty) {
    alert(`❌ لا يمكن إرجاع كمية أكبر من المباعة للمنتج: ${item.name}`);
    throw new Error(`Invalid return quantity for ${item.name}`);
  }

  const newQty = originalQty - returnedQty;

  return newQty > 0
    ? {
        ...item,
        quantity: newQty,
        returnedCount: (item.returnedCount || 0) + returnedQty,
      }
    : null;
}).filter(Boolean);
      const updateStockRequests = Object.entries(selectedItems).map(async ([barcode, qty]) => {
        const item = orderData.items.find((i) => i.barcode === barcode);
        if (!item || qty === 0) return;

        const res = await axios.get(`https://strapi-backend-cashier.up.railway.app/api/products/${item.documentId}`);
        const currentStock = res.data.data.inStock || 0;
        const currentReturned = res.data.data.returnedCount || 0;

        const newStock = currentStock + qty;
        const newReturned = currentReturned + qty;

        return axios.put(`https://strapi-backend-cashier.up.railway.app/api/products/${item.documentId}`, {
          data: {
            inStock: newStock,
            returnedCount: newReturned,
          },
        });
      });

      await Promise.all(updateStockRequests);

      const updatedTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await axios.put(`https://strapi-backend-cashier.up.railway.app/api/orders/${orderData.documentId}`, {
        data: {
          items: updatedItems,
          total: updatedTotal,
        },
      });

      alert("✅ تم تنفيذ المرتجع وتحديث الفاتورة بنجاح!");
      setOrderData(null);
      setOrderId("");
      setSelectedItems({});
    } catch (err) {
      console.error("Error processing return:", err);
      alert("❌ فشل في تنفيذ المرتجع");
    }
  };

  return (
    <div className="p-4 w-[100%] mx-auto">
      <h1 className="text-xl font-bold mb-4">🔄 صفحة المرتجع</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ادخل رقم الفاتورة"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={fetchOrder}
          className="bg-blue-600 text-white px-4 rounded"
        >
          بحث
        </button>
      </div>

      {orderData && (
        <>
                    <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b font-bold text-purple-700">الفاتورة</div>
          <table className="w-full text-left">
            <thead className="bg-purple-50">
              <tr>
                <th className="p-[2px] px-[10px] text-start">المنتج</th>
                <th className="p-[2px] px-[10px] text-start">الكمية</th>
                <th className="p-[2px] px-[10px] text-start">ارجاع</th>
                <th className="p-[2px] px-[10px] text-start">مرتجع سابقًا</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items.map((item, i) => (
                <tr key={i}>
                  <td className="p-[2px] px-[10px] text-start">{item.name}</td>
                  <td className="p-[2px] px-[10px] text-start">{item.quantity}</td>
                  <td className="p-[2px] px-[10px] text-start">
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={selectedItems[item.barcode] || ""}
                      onChange={(e) =>
                        setSelectedItems({
                          ...selectedItems,
                          [item.barcode]: Number(e.target.value),
                        })
                      }
                      className="border p-[2px] px-[10px] text-start rounded w-20"
                    />
                  </td>
                  <td className="p-[2px] px-[10px] text-start">
                    {item.returnedCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          <button
            onClick={handleReturn}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ✅ تنفيذ المرتجع
          </button>
        </>
      )}
    </div>
  );
}

export default ReturnsPage;
