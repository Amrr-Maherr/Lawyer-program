import React, { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // كود التأكيد
  const [newPassword, setNewPassword] = useState(""); // كلمة المرور الجديدة
  const [confirmPassword, setConfirmPassword] = useState(""); // تأكيد كلمة المرور الجديدة
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من أن الحقول ليست فارغة
    if (!email || !code || !newPassword || !confirmPassword) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    // التحقق من أن كلمة المرور الجديدة تطابق تأكيد كلمة المرور
    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة لا تطابق تأكيد كلمة المرور");
      return;
    }

    try {
      // استرجاع التوكين من localStorage
      const token = localStorage.getItem("token");

      // إرسال الطلب إلى الـ API
      const response = await fetch(
        "https://law-office.al-mosa.com/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // إضافة التوكين هنا
          },
          body: JSON.stringify({
            email,
            code, // إرسال كود التأكيد
            password: newPassword, // إرسال كلمة المرور الجديدة
            password_confirmation: confirmPassword, // إرسال تأكيد كلمة المرور
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "حدث خطأ أثناء إعادة تعيين كلمة السر");
        setSuccessMessage("");
      } else {
        const data = await response.json();
        setSuccessMessage("تم إعادة تعيين كلمة السر بنجاح");
        setError("");
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("حدث خطأ في الاتصال بالـ API");
      setSuccessMessage("");
    }

    // تنظيف الحقول بعد العملية
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="container">
      <div className="row justify-content-center vh-100 d-flex align-items-center justify-content-center">
        <div className="col-md-4">
          {" "}
          {/* الحجم لا يزال صغيرًا */}
          <div
            className="card hover shadow-lg p-3 mt-5"
            style={{ maxHeight: "450px", overflowY: "auto" }}
          >
            <h2 className="text-center">إعادة تعيين كلمة السر</h2>
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

              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  كود التأكيد
                </label>
                <input
                  type="text"
                  id="code"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل كود التأكيد"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}

              <button type="submit" className="btn btn-dark w-100">
                إعادة تعيين كلمة المرور
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
