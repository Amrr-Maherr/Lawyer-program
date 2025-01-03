import React, { useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // التحقق من أن الحقل غير فارغ
    if (!email.trim()) {
      Swal.fire({
        title: "تنبيه!",
        text: "الرجاء إدخال البريد الإلكتروني.",
        icon: "warning",
        confirmButtonText: "موافق",
      });
      setLoading(false);
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
        Swal.fire({
          title: "حدث خطأ!",
          text:
            data.message ||
            "حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
          icon: "error",
          confirmButtonText: "موافق",
        });
        setLoading(false);
      } else {
        Swal.fire({
          title: "تم إرسال البريد الإلكتروني!",
          text: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من البريد الوارد.",
          icon: "success",
          confirmButtonText: "موافق",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      Swal.fire({
        title: "خطأ في الاتصال!",
        text: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        icon: "error",
        confirmButtonText: "موافق",
      });
      setLoading(false);
    }

    // تنظيف الحقل بعد العملية
    setEmail("");
  };

  return (
    <div className="container" style={{ direction: "rtl" }}>
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-6">
          <div className="card shadow-lg p-4">
            <h2
              className="text-center mb-4 fw-bold"
              style={{ fontSize: "2rem" }}
            >
              نسيان كلمة المرور
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold fs-5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control border-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 fw-bold"
                disabled={loading}
                style={{ fontSize: "1.1rem" }}
              >
                {loading
                  ? "جاري إرسال الرابط..."
                  : "إرسال رابط إعادة تعيين كلمة السر"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
