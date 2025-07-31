import React from 'react';
import { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import onScan from 'onscan.js';
import { useReactToPrint } from "react-to-print";
import ReceiptComponent from './ReceiptComponent';

const AdminPanel = () => {
    //hooks
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
const [paymentMethod, setPaymentMethod] = useState("cash");

// fetch
  useEffect(() => {
    axios.get("http://localhost:1337/api/products?populate=*")
      .then(response => {
        const mappedProducts = response.data.data.map(item => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name,
          price: item.price,
          barcode: item.barcode,
          size: item.size,
          color: item.color,
          inStock: item.inStock,
          category:item.category,
          costPrice:item.costPrice,
          image: item.image?.data?.url || null,
        }));
        setProducts(mappedProducts);
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

// barcode
  useEffect(() => {
    const handleScan = (barcode) => {
      console.log("📦 تم مسح الباركود:", barcode);
      const found = products.find(p => p.barcode === barcode);
      if (found) {
        addToCart(found);
      } else {
        alert("❌ المنتج غير موجود!");
      }
    };

    onScan.attachTo(document, {
      onScan: handleScan,
      suffixKeyCodes: [13],
      reactToPaste: true,
    });

    return () => onScan.detachFrom(document);
  }, [products]);

  // add to cart
const addToCart = (product) => {
  const existing = cart.find(item => item.id === product.id);
  const quantityInCart = existing ? existing.quantity : 0;

  if (product.inStock - quantityInCart <= 0) {
    alert(" المنتج غير متوفر في المخزون!");
    return;
  }

  if (existing) {
    const updatedCart = cart.map(item =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updatedCart);
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }
};

// Discount
  const applyDiscount = () => {
    if (discountCode.toLowerCase() === "save10") {
      setDiscountValue(0.1);
      alert("✅ تم تطبيق خصم 10%");
    } else {
      setDiscountValue(0);
      alert("❌ كود الخصم غير صحيح");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAfterDiscount = total - total * discountValue;

  // function finishOrder
  const finishOrder = () => {
    if (cart.length === 0) {
      alert('السلة فاضية!');
      return;
    }

    const orderId = Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    const cleanItems = cart.map(({ id, documentId, name, price, quantity, costPrice, returnedCount, size, color, barcode }) => ({
      id, documentId, name, price, quantity, costPrice,returnedCount: 0,size, color: color || "غير محدد", barcode,
    }));

    const orderData = {
      data: {
        orderId,
        total: totalAfterDiscount,
        date: now,
        discount: discountValue,
        items: cleanItems,
        customerName,
        customerPhone,
        paymentMethod,
      }
    };

    axios.post("http://localhost:1337/api/orders", orderData, {
      headers: { "Content-Type": "application/json" }
    })
      .then(() => {
const updateStockRequests = cart.map(async (item) => {
  try {
    const res = await axios.get(`http://localhost:1337/api/products/${item.documentId}`);
    const currentStock = res.data.data.inStock;
    const currentSold = res.data.data.soldCount || 0;

    if (currentStock < item.quantity) {
      alert(` المنتج "${item.name}" لا يحتوي على كمية كافية في المخزون!`);
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    const newStock = currentStock - item.quantity;
    const newSold = currentSold + item.quantity;

    return axios.put(`http://localhost:1337/api/products/${item.documentId}`, {
      data: {
        inStock: newStock,
        soldCount: newSold,
      }
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    });
  } catch (error) {
    console.error(` خطأ في تحديث المنتج ${item.name}:`, error.response?.data || error.message);
    throw error;
  }
});

Promise.all(updateStockRequests)
    .then(() => {
  const newOrder = {
    id: orderId,
    date: now,
    items: cleanItems,
    total: totalAfterDiscount,
    customerName,
    customerPhone,
    paymentMethod,
  };

  localStorage.setItem("lastOrder", JSON.stringify(newOrder));
  setLastOrder(newOrder); 
  setCart([]);

  alert(`✅ تم تسجيل الطلب!\nرقم الطلب: ${orderId}\nالإجمالي بعد الخصم: ${totalAfterDiscount.toFixed(2)} جنيه`);
  printReceipt(); 

})
  .catch((err) => {
    console.error(" فشل تحديث المخزون:", err);
    alert(" لم يتم خصم الكمية من بعض المنتجات. راجع المخزون.");
  });

})
      .catch(err => {
        console.error(" خطأ في إرسال الطلب:", err.response?.data || err);
        alert(" فشل تسجيل الطلب. حاول مرة تانية.");
      });
  };
  // function plus
  function plus (item ,index) {
    const exit = cart.find(e => e.id === item.id);
    const quantityInCart = exit? exit.quantity : 0;
    if(item.inStock -  quantityInCart <=0){
        alert("المخزون مش كافي ")
    }else{
        const updatedCart = cart.map((e , i) =>{
          if(i === index){
            return {...e , quantity : e.quantity + 1}
            }else{
              return e
            }
        })
        setCart(updatedCart)
    }
  }
  // function minus 
    function pl (item ,index) {
  const currentItem = cart[index];
  if (currentItem.quantity <= 1) {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    return;
  }
  const updatedItem = {
    ...currentItem,
    quantity: currentItem.quantity - 1,
  };

  const newCart = [...cart];
  newCart[index] = updatedItem;
  setCart(newCart); 
  }

    const receiptRef = useRef();
  const printReceipt = useReactToPrint({
    content: () => receiptRef.current,
  });
  const [lastOrder, setLastOrder] = useState(() => {
    const saved = localStorage.getItem("lastOrder");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="flex w-[100%] min-h-screen bg-gray-100">
      {/* Sidebar */}


      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-700">الصفحه الرئيسية</h1>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-[16px] font-bold text-gray-500">الباركود</p>
                    <input
        type="text"
        placeholder="ابحث بالاسم أو الباركود..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const value = e.target.value.trim();
            const found = products.find(
              (p) => p.name.toLowerCase() === value.toLowerCase() || p.barcode === value
            );
            if (found) {
              addToCart(found);
              e.target.value = "";
            } else {
              alert(" المنتج غير موجود!");
            }
          }
        }}
        className="border p-2 mb-4 w-full rounded"
      />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-[16px] font-bold text-gray-500">الخصم</p>
                  <div className='flex gap-2 mb-[10px]'>
                  <input
        type="text"
        placeholder="ادخل كود الخصم"
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
        className="border px-3 py-1 rounded"
      />
      <button
        onClick={applyDiscount}
        className="bg-purple-600 text-white px-3 py-1 ml-2 rounded"
      >
        تطبيق
      </button>
    </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-[16px] font-bold text-gray-500">اسم العميل</p>
                    <input
        type="text"
        placeholder="اسم العميل"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-[16px] font-bold text-gray-500">رقم العميل</p>
              <input
        type="tel"
        placeholder="رقم التليفون"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />
            </div>
          </div>
        <div className='bg-white rounded-lg p-[10px] shadow-md'>
        <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className=" p-2 w-full rounded"
>
  <option value="cash">💵 كاش</option>
  <option value="visa">💳 فيزا</option>
  <option value="bank">🏦 تحويل بنكي</option>
</select>
        </div>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b font-bold text-purple-700">User List</div>
            <table className="w-full text-left">
              <thead className="bg-purple-50">
                <tr>
                  <th className="p-4">الأسم</th>
                  <th className="p-4">الفئة</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">الكمية</th>
                  <th className="p-4">المخزون</th>
                  <th className="p-4">الاجمالي</th>
                  <th className="p-4">الاجراءات</th>
                </tr>
              </thead>
              <tbody>
                    {
                    cart.map((item, index) =>{
                    return(
                        <tr key={item.id} className='border-t'>
                            <td className='p-4'>{item.name}</td>
                            <td className='p-4'>{item.category}</td>
                            <td className='p-4'>{item.price}</td>
                            <td className='p-4'>{item.quantity}</td>
                            <td className='p-4'>{item.inStock}</td>
                            <td className='p-4'>{item.price * item.quantity}</td>
                            <td className='flex justify-around p-4'>
                                <button
              onClick={() => plus(item, index)}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
            >
              +
            </button>
            <button
              onClick={() => pl(item, index)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
            >
              -
            </button>
                            </td>
                        </tr>
                    )
                    })
                    }
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg shadow hover:bg-purple-700">
                <p className="text-lg font-bold mb-2">الإجمالي قبل الخصم: {total} جنيه</p>
      {discountValue > 0 && (
        <p className="text-green-600 font-bold mb-4">
          ✅ تم تطبيق خصم {discountValue * 100}% ⇒ الإجمالي بعد الخصم: {totalAfterDiscount.toFixed(2)} جنيه
        </p>
      )}
            </div>
            <button 
            onClick={finishOrder}
            className="bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700">انهاء الطلب</button>
            <button 
                    onClick={() => {
          if (confirm("هل أنت متأكد من تفريغ السلة؟")) {
            setCart([]);
            localStorage.removeItem('cart');
          }
        }}
            className="bg-red-600 text-white py-3 rounded-lg shadow hover:bg-red-700">تفريغ </button>
          </div>
        </main>
                {lastOrder && (
          <>
            <ReceiptComponent ref={receiptRef} order={lastOrder} />
            <button
              onClick={printReceipt}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              🖨️ طباعة الفاتورة
            </button>
                  <button
        onClick={() => {setLastOrder(null) 
          localStorage.removeItem("lastOrder") }}
        className="bg-gray-600 text-white px-4 py-2 rounded"
      >
        ❌ إخفاء الفاتورة
      </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
