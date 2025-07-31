import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ar";

function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    axios
      .get("http://localhost:1337/api/orders?populate=*")
      .then((res) => {
        setOrders(res.data.data);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedDate, filterType]);

  const filterOrders = () => {
    const date = dayjs(selectedDate);
    const filtered = orders.filter((order) => {
      const orderDate = dayjs(order.date);
      if (filterType === "day") {
        return orderDate.isSame(date, "day");
      } else if (filterType === "month") {
        return orderDate.isSame(date, "month");
      }
      return true;
    });
    setFilteredOrders(filtered);
  };

  let grandTotal = 0;
  let grandProfit = 0;

  return (
    <div className="p-4 w-[100%] mx-auto">
      <h1 className="text-2xl font-bold mb-4"> تقرير المبيعات</h1>

      <div className="flex gap-4 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="day">📅 اليوم</option>
          <option value="month">🗓️ هذا الشهر</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-red-500 font-semibold">❌ لا توجد فواتير في هذا التاريخ.</p>
      )}

      {filteredOrders.map((order, idx) => {
        const items = order.items || [];
        let orderTotal = 0;
        let orderProfit = 0;

        return (
          <div key={idx} className=" mb-6 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">🧾 فاتورة #{order.orderId}</h2>
            <p>👤 {order.customerName || "بدون اسم"}</p>
            <p>📞 {order.customerPhone || "لا يوجد"}</p>
            <p>💳 طريقة الدفع: {order.paymentMethod}</p>
            <p>📅 التاريخ: {dayjs(order.date).locale("ar").format("YYYY/MM/DD hh:mm A")}</p>

            <table className="min-w-full text-sm mt-4 border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">المنتج</th>
                  <th className="border px-2 py-1">المباعة</th>
                  <th className="border px-2 py-1">مرتجع</th>
                  <th className="border px-2 py-1">الصافي</th>
                  <th className="border px-2 py-1">الإجمالي</th>
                  <th className="border px-2 py-1">الربح</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const quantity = item.quantity || 0;
                  const returned = item.returnedCount || 0;
                  const sold = quantity + returned;
                  const net = quantity;
                  const totalPrice = item.price * net;
                  const profit = (item.price - (item.costPrice || 0)) * net;

                  orderTotal += totalPrice;
                  orderProfit += profit;

                  return (
                    <tr key={i}>
                      <td className="border px-2 py-1">{item.name}</td>
                      <td className="border px-2 py-1">{sold}</td>
                      <td className="border px-2 text-[red] font-bold py-1">{returned}</td>
                      <td className="border px-2 py-1">{net}</td>
                      <td className="border px-2 py-1">{totalPrice.toFixed(2)} ج.م</td>
                      <td className="border px-2 py-1">{profit.toFixed(2)} ج.م</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex gap-3 mt-4 font-semibold text-right">
              <p> إجمالي الفاتورة: {orderTotal.toFixed(2)} ج.م</p>
              <p> الربح من الفاتورة: {orderProfit.toFixed(2)} ج.م</p>
            </div>

            {(() => {
              grandTotal += orderTotal;
              grandProfit += orderProfit;
              return null;
            })()}
          </div>
        );
      })}

      <div className="mt-6 border-t pt-4 text-lg font-bold text-right">
        <p>📦 عدد الفواتير: {filteredOrders.length}</p>
        <p>💰 إجمالي كل الفواتير: {grandTotal.toFixed(2)} ج.م</p>
        <p>📈 إجمالي الأرباح: {grandProfit.toFixed(2)} ج.م</p>
      </div>
    </div>
  );
}

export default ReportsPage;
