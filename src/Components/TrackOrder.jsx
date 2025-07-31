import React, { useState } from "react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString("ar-EG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `📅 ${datePart} ⏰ ${timePart}`;
  };

  const searchOrder = async () => {
    if (!orderId.trim()) {
      alert("من فضلك أدخل رقم الطلب");
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const res = await fetch(
        `http://localhost:1337/api/orders?filters[orderId][$eq]=${orderId}&populate=*`
      );
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        setError("❌ لم يتم العثور على الطلب.");
      } else {
        const order = data.data[0];
        setOrderData(order);
      }
    } catch (error) {
      setError("⚠️ حدث خطأ أثناء جلب الطلب، حاول مرة أخرى لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-[100%] mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">
        🔍 تتبع طلبك
      </h1>
      <input
        type="number"
        id="orderIdInput"
        placeholder="ادخل رقم الطلب..."
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
      />
      <button
        onClick={searchOrder}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        {loading ? "⏳ جاري البحث ..." : "بحث"}
      </button>

      {error && <div className="text-red-600 mt-4 text-center">{error}</div>}

      {orderData && (
        <div className="mt-6">
          <p className="font-semibold text-lg text-purple-700">رقم الطلب: {orderData.orderId}</p>
          <p className="text-gray-700">التاريخ: {formatDateTime(orderData.date)}</p>
          {orderData.discount && (
            <p className="text-gray-700">نسبة الخصم: {orderData.discount * 100}%</p>
          )}
          <hr className="my-4" />
          {orderData.items && orderData.items.map((item, index) => {
            const price = item.price * item.quantity;
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
                <p className="font-medium text-purple-700">{item.name}</p>
                <p className="text-gray-600">
                  {item.price} × {item.quantity} = {price} جنيه
                </p>
              </div>
            );
          })}
          <div className="bg-green-100 p-4 rounded-lg mt-6">
            <p className="font-bold text-green-700">
              الإجمالي بعد الخصم: {orderData.total.toFixed(2)} جنيه
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
