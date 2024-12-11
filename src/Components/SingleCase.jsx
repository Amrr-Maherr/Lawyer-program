import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const SingleCase = () => {
  const { customerId, caseId } = useParams(); // الحصول على الـ ID من الـ URL
  const [caseDetails, setCaseDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId || !caseId) {
      setError("خطأ في الرابط. يرجى التحقق من بيانات القضية.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("التوكن غير موجود");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`, // استخدام الـ customerId و caseId الديناميكي في الرابط
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data); // طباعة البيانات في وحدة التحكم
        setCaseDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError(`حدث خطأ أثناء جلب التفاصيل: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, caseId]); // التأكد من أن الرابط يتم تحديثه عند تغيير الـ customerId أو الـ caseId

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    return <div>حدث خطأ: {error}</div>;
  }

  return (
    <div className="container mt-5">
      {caseDetails ? (
        <div>
          <h2>تفاصيل القضية</h2>
          {/* تفاصيل العميل */}
          <h4>اسم العميل: {caseDetails.customer.name}</h4>
          <p>البريد الإلكتروني: {caseDetails.customer.email}</p>
          <p>رقم الهوية: {caseDetails.customer.ID_number}</p>
          <p>الهاتف: {caseDetails.customer.phone}</p>
          <p>العنوان: {caseDetails.customer.address}</p>
          <p>الجنسية: {caseDetails.customer.nationality}</p>
          <p>اسم الشركة: {caseDetails.customer.company_name}</p>
          <p>ملاحظات: {caseDetails.customer.notes}</p>
          {/* تفاصيل القضية */}
          <h4>رقم القضية: {caseDetails.case.case_number}</h4>
          <p>عنوان القضية: {caseDetails.case.case_title}</p>
          <p>اسم الخصم: {caseDetails.case.opponent_name}</p>
          <p>هاتف الخصم: {caseDetails.case.opponent_phone}</p>
          <p>عنوان الخصم: {caseDetails.case.opponent_address}</p>
          <p>محامي الخصم: {caseDetails.case.opponent_lawyer}</p>
          <p>اسم المحكمة: {caseDetails.case.court_name}</p>
          <p>اسم القاضي: {caseDetails.case.judge_name}</p>
          <p>فئة القضية: {caseDetails.case_category.name}</p>{" "}
          {/* عرض اسم الفئة هنا */}
          {/* المبالغ المدفوعة والمتبقية */}
          <h4>المبلغ المدفوع: {caseDetails.paid_amount}</h4>
          <h4>المبلغ المتبقي: {caseDetails.remaining_amount}</h4>
          {/* ملاحظات القضية */}
          <p>ملاحظات القضية: {caseDetails.case.notes}</p>
        </div>
      ) : (
        <div>لا توجد تفاصيل لهذه القضية.</div>
      )}
    </div>
  );
};

export default SingleCase;
