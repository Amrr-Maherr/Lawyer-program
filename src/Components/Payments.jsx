import React, { useEffect, useState } from "react";
import axios from "axios";

const Payments = () => {
  const [cases, setCases] = useState([]); // تخزين القضايا
  const [payments, setPayments] = useState([]); // تخزين المدفوعات
  const [loadingCases, setLoadingCases] = useState(true); // حالة تحميل القضايا
  const [loadingPayments, setLoadingPayments] = useState(true); // حالة تحميل المدفوعات
  const [selectedCase, setSelectedCase] = useState(null); // القضية المختارة

  // جلب القضايا
  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("يرجى تسجيل الدخول");
        return;
      }

      try {
        const response = await axios.get(
          `https://law-office.al-mosa.com/api/cases`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCases(response.data.cases); // تخزين القضايا
        setLoadingCases(false); // انتهى تحميل القضايا
      } catch (error) {
        console.error("هناك خطأ أثناء جلب القضايا:", error);
        setLoadingCases(false);
      }
    };

    fetchCases();
  }, []);

  // جلب المدفوعات للقضية المختارة
  useEffect(() => {
    if (!selectedCase) return;

    const fetchPayments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("يرجى تسجيل الدخول");
        return;
      }

      try {
        const { customer_id, case_id } = selectedCase;

        const response = await axios.get(
          `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPayments(response.data.payments); // تحديث بيانات المدفوعات
        setLoadingPayments(false); // تم تحميل المدفوعات
      } catch (error) {
        console.error("هناك خطأ أثناء جلب المدفوعات:", error);
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [selectedCase]);

  // أحداث الأزرار
  const handleDelete = (id) => {
    alert(`تم حذف الدفعة رقم ${id}`);
  };

  const handleEdit = (id) => {
    alert(`تعديل الدفعة رقم ${id}`);
  };

  const handleViewDetails = (payment) => {
    alert(
      `تفاصيل الدفعة: \nالعنوان: ${payment.title}\nالمبلغ: ${payment.amount}\nالتاريخ: ${payment.date}`
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">تفاصيل المدفوعات</h2>

      {/* عرض القضايا لاختيار قضية معينة */}
      {loadingCases ? (
        <div className="text-center">
          <i className="fa fa-spinner fa-spin"></i> تحميل القضايا...
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="caseSelect" className="form-label">
            اختر القضية:
          </label>
          <select
            id="caseSelect"
            className="form-select"
            onChange={(e) => {
              const caseId = e.target.value;
              const selected = cases.find(
                (caseItem) => caseItem.case_id.toString() === caseId
              );
              setSelectedCase(selected);
              setLoadingPayments(true); // إعادة تعيين حالة تحميل المدفوعات
              setPayments([]); // تصفير المدفوعات السابقة
            }}
          >
            <option value="">-- اختر القضية --</option>
            {cases.map((caseItem) => (
              <option key={caseItem.case_id} value={caseItem.case_id}>
                {caseItem.case_number} - {caseItem.customer_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* عرض تفاصيل المدفوعات */}
      {loadingPayments ? (
        selectedCase ? (
          <div className="text-center">
            <i className="fa fa-spinner fa-spin"></i> تحميل المدفوعات...
          </div>
        ) : (
          <div className="text-center text-muted">
            يرجى اختيار قضية لعرض تفاصيل المدفوعات.
          </div>
        )
      ) : payments.length > 0 ? (
        <div style={{ direction: "rtl" }}>
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>عنوان الدفعة</th>
                <th>المبلغ المدفوع</th>
                <th>تاريخ الدفع</th>
                <th>طريقة الدفع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>{payment.title}</td>
                  <td>{payment.amount}</td>
                  <td>{new Date(payment.date).toLocaleDateString("ar-EG")}</td>
                  <td>{payment.method}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDelete(payment.id)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEdit(payment.id)}
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      <i className="fa fa-info-circle"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-danger">
          لا توجد مدفوعات لهذه القضية.
        </div>
      )}
    </div>
  );
};

export default Payments;
