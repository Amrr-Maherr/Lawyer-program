import React, { useState } from "react";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من أن الحقل غير فارغ
    if (!email) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }

    try {
      // استرجاع التوكين من localStorage
      const token = localStorage.getItem("token");

      // إرسال الطلب إلى الـ API
      const response = await fetch(
        "https://law-office.al-mosa.com/api/forgot-password", // تأكد من تحديث الـ API URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // إضافة التوكين هنا
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "حدث خطأ أثناء إرسال البريد الإلكتروني");
        setSuccessMessage("");
      } else {
        setSuccessMessage(
          "تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني"
        );
        setError("");
        // يمكن إضافة نافذة منبثقة تنبه المستخدم بنجاح العملية
        Swal.fire(
          "تم إرسال البريد الإلكتروني",
          "تفاصيل إعادة تعيين كلمة السر أُرسلت إلى بريدك الإلكتروني.",
          "success"
        );
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالـ API");
      setSuccessMessage("");
    }

    // تنظيف الحقل بعد العملية
    setEmail("");
  };

  return (
    <div className="container">
      <div className="row justify-content-center vh-100 d-flex align-items-center justify-content-center">
        <div className="col-md-6">
          <div className="card hover shadow-lg p-4 mt-5">
            <h2 className="text-center">نسيان كلمة المرور</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}

              <button type="submit" className="btn btn-dark w-100">
                إرسال رابط إعادة تعيين كلمة السر
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
