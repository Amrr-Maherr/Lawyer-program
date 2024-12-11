import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AddCase = () => {
  const [caseData, setCaseData] = useState({
    opponent_name: "",
    opponent_phone: "",
    opponent_address: "",
    case_category_id: "",
    ID_number: "",
    opponent_nation: "",
    opponent_lawyer: "",
    lawyer_phone: "",
    court_name: "",
    judge_name: "",
    case_number: "",
    case_title: "",
    contract_price: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [caseCategories, setCaseCategories] = useState([]);
  const [customers, setCustomers] = useState([]); // حالة لتخزين قائمة العملاء
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // ID العميل المختار

  // جلب فئات القضايا
  useEffect(() => {
    const fetchCaseCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire(
          "خطأ",
          "لم يتم العثور على التوكن. يرجى تسجيل الدخول.",
          "error"
        );
        return;
      }

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/case-categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCaseCategories(response.data);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب فئات القضايا:", error);
        Swal.fire(
          "خطأ",
          "حدث خطأ أثناء جلب فئات القضايا. حاول مرة أخرى.",
          "error"
        );
      }
    };

    fetchCaseCategories();
  }, []);

  // جلب العملاء
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire(
          "خطأ",
          "لم يتم العثور على التوكن. يرجى تسجيل الدخول.",
          "error"
        );
        return;
      }

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/customers", // الاند بوينت لجلب العملاء
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomers(response.data); // حفظ قائمة العملاء
      } catch (error) {
        console.error("حدث خطأ أثناء جلب بيانات العملاء:", error);
        Swal.fire(
          "خطأ",
          "حدث خطأ أثناء جلب بيانات العملاء. حاول مرة أخرى.",
          "error"
        );
      }
    };

    fetchCustomers();
  }, []);

 const handleAddCase = async () => {

   if (!selectedCustomerId) {
     Swal.fire("خطأ", "يرجى اختيار العميل.", "error");
     return;
   }

   if (!caseData.case_category_id) {
     Swal.fire({
       title: "خطأ",
       text: "برجاء ادخال نوع قضية أولاً.",
       icon: "error",
       confirmButtonText: "موافق",
       showCancelButton: true,
       cancelButtonText: "إضافة نوع قضية",
       reverseButtons: true, // لتغيير ترتيب الأزرار
     }).then((result) => {
       if (result.isDismissed) {
         // عند الضغط على "إضافة نوع قضية"
         
       }
     });
     return;
   }

   const token = localStorage.getItem("token");
   if (!token) {
     Swal.fire("خطأ", "لم يتم العثور على التوكن. يرجى تسجيل الدخول.", "error");
     return;
   }

   const casePayload = {
     ...caseData,
     customer_id: selectedCustomerId, // إضافة ID العميل المختار بشكل ديناميكي
   };

   try {
     setLoading(true);
     const response = await axios.post(
       `https://law-office.al-mosa.com/api/customer/${selectedCustomerId}/store-case`, // الاند بوينت لإضافة القضية
       casePayload,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );
     Swal.fire("نجاح", "تم إضافة القضية بنجاح.", "success");
     setCaseData({
       opponent_name: "",
       opponent_phone: "",
       opponent_address: "",
       case_category_id: "",
       ID_number: "",
       opponent_nation: "",
       opponent_lawyer: "",
       lawyer_phone: "",
       court_name: "",
       judge_name: "",
       case_number: "",
       case_title: "",
       contract_price: "",
       notes: "",
     });
     setSelectedCustomerId(null); // إعادة تعيين ID العميل بعد إضافة القضية
   } catch (error) {
     console.error("حدث خطأ أثناء إضافة القضية:", error);
     Swal.fire("خطأ", "حدث خطأ أثناء إضافة القضية. حاول مرة أخرى.", "error");
   } finally {
     setLoading(false);
   }
 };


  return (
    <div className="container-fluid mt-5">
      <h1 className="text-center mb-4">إضافة قضية جديدة</h1>
      <div className="row">
        <div className="col-12 text-end">
          {/* قائمة العملاء */}
          <div className="form-group my-3">
            <label>اختار العميل</label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              disabled={loading}
            >
              <option value="">اختر العميل</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group my-3">
            <label>اسم الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_name}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>هاتف الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_phone}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_phone: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>عنوان الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_address}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_address: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>نوع القضية</label>
            <select
              className="form-control"
              value={caseData.case_category_id}
              onChange={(e) =>
                setCaseData({ ...caseData, case_category_id: e.target.value })
              }
              disabled={loading}
            >
              <option value="">اختر نوع القضية</option>
              {caseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group my-3">
            <label>رقم الهوية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.ID_number}
              onChange={(e) =>
                setCaseData({ ...caseData, ID_number: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>جنسية الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_nation}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_nation: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>محامي الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_lawyer}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_lawyer: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>هاتف المحامي</label>
            <input
              type="text"
              className="form-control"
              value={caseData.lawyer_phone}
              onChange={(e) =>
                setCaseData({ ...caseData, lawyer_phone: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>اسم المحكمة</label>
            <input
              type="text"
              className="form-control"
              value={caseData.court_name}
              onChange={(e) =>
                setCaseData({ ...caseData, court_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>اسم القاضي</label>
            <input
              type="text"
              className="form-control"
              value={caseData.judge_name}
              onChange={(e) =>
                setCaseData({ ...caseData, judge_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>رقم القضية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.case_number}
              onChange={(e) =>
                setCaseData({ ...caseData, case_number: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>عنوان القضية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.case_title}
              onChange={(e) =>
                setCaseData({ ...caseData, case_title: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>مبلغ العقد</label>
            <input
              type="number"
              className="form-control"
              value={caseData.contract_price}
              onChange={(e) =>
                setCaseData({ ...caseData, contract_price: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label>ملاحظات</label>
            <textarea
              className="form-control"
              value={caseData.notes}
              onChange={(e) =>
                setCaseData({ ...caseData, notes: e.target.value })
              }
              disabled={loading}
            ></textarea>
          </div>
          <div className="form-group text-center my-3">
            <button
              className="btn btn-primary"
              onClick={handleAddCase}
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة القضية"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCase;
